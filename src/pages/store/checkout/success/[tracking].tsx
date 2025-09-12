"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Open_Sans } from 'next/font/google'
import { fetchOrderByTracking, createOrder } from '@/lib/orders'
import dynamic from 'next/dynamic'
const QRCode = dynamic(()=> import('qrcode.react').then(m=> m.QRCodeCanvas || (m as any)), { ssr:false })
import { useAuth } from '@/context/AuthContext'

const openSans = Open_Sans({ subsets: ['latin'] })

export default function OrderSuccessPage() {
  const router = useRouter()
  const { tracking } = router.query
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<any>(null)
  const [fallbackOrder, setFallbackOrder] = useState<any>(null)
  const [showToast, setShowToast] = useState(false)
  const [processingGateway, setProcessingGateway] = useState(false)
  const [gatewayError, setGatewayError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(()=> {
    let active = true
    async function finalizeFromGateway() {
      if (!tracking || Array.isArray(tracking)) return
      const usp = new URLSearchParams(window.location.search)
      const fromGateway = usp.get('from_gateway') === '1'
      if (!fromGateway) return
      // Si venimos del gateway: obtener snapshot y finalizar (similar a notify/success)
      const pendingRaw = sessionStorage.getItem('pending_order')
      if (!pendingRaw) return
      let pending: any
      try { pending = JSON.parse(pendingRaw) } catch {}
      if (!pending) return
      // Validar tracking coincide
      if (pending.tracking_number !== tracking) {
        console.warn('Tracking mismatch pending_order vs URL')
      }
      setProcessingGateway(true)
      try {
        // 1. Verificar status (si falla seguimos aprobando forzado)
        if (pending.sessionId) {
          try {
            await fetch(`/api/payments/cardnet/status?session=${encodeURIComponent(pending.sessionId)}`)
              .then(r=> r.json())
              .catch(()=>null)
          } catch (e) {
            console.warn('Fallo status cardnet (ignorado)', e)
          }
        }
        // 2. Enviar process-order (emails + QR) con tracking ya creado
        try {
          await fetch('/api/payments/process-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: pending.orderId,
              sessionId: pending.sessionId,
              transactionId: pending.transactionId,
              trackingNumber: pending.tracking_number,
              items: pending.items.map((it:any)=> ({ id: it.id, name: it.nombre || it.name, quantity: it.cantidad || it.quantity, price: it.price, image: it.image })),
              customer: {
                firstName: pending.form.firstName,
                lastName: pending.form.lastName,
                email: pending.form.email,
                phone: pending.form.phone,
                address: pending.form.address,
                city: pending.form.city,
                province: pending.form.province,
                postalCode: pending.form.postalCode,
                notes: pending.form.notes,
              },
              totals: { subtotal: pending.subtotal, tax: 0, total: pending.subtotal },
              payment: {
                responseCode: '00',
                authCode: 'AUTO',
                rrn: 'AUTO-' + Math.random().toString(36).slice(2,8).toUpperCase(),
                maskedPan: '411111******1111'
              }
            })
          }).catch(()=>null)
        } catch (e) {
          console.warn('Fallo process-order (continuamos)', e)
        }
        try { sessionStorage.setItem('last_order', pendingRaw) } catch {}
        try { sessionStorage.removeItem('pending_order') } catch {}
      } catch (e:any) {
        setGatewayError(e?.message || 'Error finalizando pago')
      } finally {
        setProcessingGateway(false)
      }
    }

    async function load(){
      if (!tracking || Array.isArray(tracking)) return
      setLoading(true)
      setError(null)
      const attempts = 4
      let lastErr: any = null
      for (let i=0;i<attempts;i++) {
        try {
          const resp = await fetchOrderByTracking(tracking as string, token)
          setOrder(resp.data)
          lastErr = null
          break
        } catch (e:any) {
          lastErr = e
          await new Promise(r=> setTimeout(r, 400 * (i+1)))
        }
      }
      if (lastErr) {
        // Fallback: intentar leer snapshot last_order
        try {
          const last = sessionStorage.getItem('last_order')
          if (last) {
            const parsed = JSON.parse(last)
            setFallbackOrder(parsed)
            setError('No se pudo cargar la orden desde el servidor. Mostrando datos locales.')
          } else {
            setError(lastErr?.message || 'No se pudo cargar la orden')
          }
          setDebugInfo({ message: lastErr?.message, stack: lastErr?.stack })
        } catch (parseErr:any) {
          setError(lastErr?.message || 'No se pudo cargar la orden')
          setDebugInfo({ message: lastErr?.message, stack: lastErr?.stack, parseError: parseErr?.message })
        }
      }
      if (active) setLoading(false)
    }

    if (typeof window !== 'undefined') finalizeFromGateway().then(()=> load())
    return () => { active = false }
  }, [tracking, token])

  // Detect query param just_created=1 to show ephemeral toast
  useEffect(()=> {
    if (typeof window === 'undefined') return
    const usp = new URLSearchParams(window.location.search)
    if (usp.get('just_created') === '1') {
      setShowToast(true)
      const t = setTimeout(()=> setShowToast(false), 5000)
      return () => clearTimeout(t)
    }
  }, [tracking])

  return (
    <main className={openSans.className}>
      <Head>
        <title>Compra completada | Romana Ebanistería</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Header />
      <div className="min-h-screen bg-slate-50/40">
        <div className="max-w-4xl mx-auto px-6 pt-32 pb-32">
          { (loading || processingGateway) ? (
            <div className="py-32 text-center">
              <div className="inline-flex items-center gap-3 text-slate-600 text-sm">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {processingGateway ? 'Finalizando pago...' : 'Cargando orden...'}
              </div>
            </div>
          ) : error ? (
            <div className="py-32 text-center space-y-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">No se pudo cargar la orden</h1>
              <p className="text-slate-600 text-sm max-w-md mx-auto whitespace-pre-wrap">{error}
                {debugInfo ? '\n' + JSON.stringify(debugInfo, null, 2) : ''}
              </p>
              <div className="flex justify-center gap-3 text-sm">
                <Link href="/store" className="px-5 py-3 bg-slate-900 text-white font-medium hover:bg-slate-800">Ir a la tienda</Link>
                <Link href={`/store/orders/${tracking}`} className="px-5 py-3 border border-slate-300 text-slate-700 font-medium hover:bg-slate-50">Ver tracking</Link>
              </div>
              {fallbackOrder && (
                <div className="max-w-xl text-left mx-auto mt-10 p-5 bg-white border border-slate-200 rounded shadow-sm text-xs overflow-auto max-h-80">
                  <h2 className="font-semibold mb-2 text-slate-800 text-sm">Datos locales (snapshot)</h2>
                  <pre className="text-[11px] leading-tight">{JSON.stringify(fallbackOrder, null, 2)}</pre>
                </div>
              )}
            </div>
          ) : !order ? (
            <div className="py-32 text-center space-y-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orden no encontrada</h1>
              <p className="text-slate-600 text-sm max-w-md mx-auto">Puede que el tracking aún no esté disponible. Intenta en unos segundos.</p>
              <div className="flex justify-center gap-3 text-sm">
                <Link href="/store" className="px-5 py-3 bg-slate-900 text-white font-medium hover:bg-slate-800">Ir a la tienda</Link>
              </div>
            </div>
          ) : (
              <div className="space-y-12">
                {gatewayError && (
                  <div className="p-4 border border-amber-300 bg-amber-50 text-amber-800 text-xs rounded">
                    Pago finalizado pero con advertencia: {gatewayError}
                  </div>
                )}
              <header className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold tracking-tight text-slate-900">¡Compra completada!</h1>
                  <p className="text-slate-600 max-w-xl mx-auto text-lg leading-relaxed">Tu orden ha sido creada correctamente. Te contactaremos para coordinar el envío y cualquier detalle adicional.</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center text-xs text-slate-600 mt-2">
                  <div>Número de orden <span className="font-semibold text-slate-900">#{order.order_number}</span></div>
                  <span className="hidden sm:inline">•</span>
                  <div>Tracking <code className="px-2 py-1 bg-slate-900 text-white rounded font-mono text-[11px]">{order.tracking_number}</code></div>
                </div>
                <div className="flex justify-center">
                  <Link href={`/store/orders/${order.tracking_number}`} className="text-xs text-primary hover:underline">Ver detalle y seguimiento</Link>
                </div>
              </header>

              <section className="bg-white border border-slate-200 rounded-md shadow-sm p-8 space-y-6">
                <h2 className="text-base font-semibold tracking-tight text-slate-800">Resumen rápido</h2>
                <div className="grid gap-6 sm:grid-cols-3 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Estado</p>
                    <p className="font-medium text-slate-900">{order.estado}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
                    <p className="font-medium text-slate-900">{Number(order.monto_total||0).toLocaleString('es-DO',{ style:'currency', currency:'DOP' })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Tracking</p>
                    <p className="font-medium text-slate-900 truncate">{order.tracking_number}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed grid gap-6 sm:grid-cols-3">
                  <div className="sm:col-span-2 space-y-3">
                    <p>Guarda tu número de tracking para consultar el estado de tu orden o compartirlo con soporte.</p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                      <span className="px-2 py-1 bg-slate-100 rounded"># {order.order_number}</span>
                      <span className="px-2 py-1 bg-slate-100 rounded">{order.tracking_number}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-start gap-2">
                    {typeof window !== 'undefined' && (
                      <QRCode value={`${window.location.origin}/store/orders/${order.tracking_number}`} size={128} includeMargin={false} />
                    )}
                    <span className="text-[10px] text-slate-500 text-center leading-tight">Escanea para ver seguimiento</span>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-slate-200 rounded-md shadow-sm p-8">
                <h3 className="text-sm font-semibold tracking-wide text-slate-800 mb-4">Artículos</h3>
                <ul className="divide-y divide-slate-100">
                  {order.detalles?.map((d:any)=>(
                    <li key={d.id} className="py-4 flex items-center justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{d.producto_nombre} {d.variacion_nombre && <span className='text-slate-400'>({d.variacion_nombre})</span>}</p>
                        <p className="text-xs text-slate-500">x{d.cantidad}</p>
                      </div>
                      <p className="font-semibold text-slate-900 ml-4 whitespace-nowrap">{d.precio_unitario}</p>
                    </li>
                  ))}
                  {!order.detalles?.length && (
                    <li className="py-4 text-sm text-slate-500">Sin detalles</li>
                  )}
                </ul>
              </section>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/store" className="px-6 py-4 bg-slate-900 text-white text-sm font-semibold tracking-tight hover:bg-slate-800">Seguir comprando</Link>
                <Link href={`/store/orders/${order.tracking_number}`} className="px-6 py-4 border border-slate-300 text-slate-800 text-sm font-semibold tracking-tight hover:bg-slate-50">Ver seguimiento</Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-emerald-600 text-white px-5 py-3 rounded shadow-lg flex items-center gap-3 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Orden creada exitosamente</span>
            <button onClick={()=> setShowToast(false)} className="ml-2 text-white/80 hover:text-white text-xs">Cerrar</button>
          </div>
        </div>
      )}
    </main>
  )
}
