"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Open_Sans } from 'next/font/google'
import { fetchOrderByTracking } from '@/lib/orders'
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
  const [showToast, setShowToast] = useState(false)

  useEffect(()=> {
    let active = true
    async function load(){
      if (!tracking || Array.isArray(tracking)) return
      setLoading(true)
      setError(null)
      try {
        const resp = await fetchOrderByTracking(tracking as string, token)
        setOrder(resp.data)
      } catch (e:any) {
        setError(e?.message || 'No se pudo cargar la orden')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
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
          {loading ? (
            <div className="py-32 text-center">
              <div className="inline-flex items-center gap-3 text-slate-600 text-sm">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cargando orden...
              </div>
            </div>
          ) : error ? (
            <div className="py-32 text-center space-y-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">No se pudo cargar la orden</h1>
              <p className="text-slate-600 text-sm max-w-md mx-auto">{error}</p>
              <div className="flex justify-center gap-3 text-sm">
                <Link href="/store" className="px-5 py-3 bg-slate-900 text-white font-medium hover:bg-slate-800">Ir a la tienda</Link>
                <Link href={`/store/orders/${tracking}`} className="px-5 py-3 border border-slate-300 text-slate-700 font-medium hover:bg-slate-50">Ver tracking</Link>
              </div>
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
