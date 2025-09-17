"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Open_Sans } from 'next/font/google'
import { fetchOrderByTracking as fetchOrderByTrackingMaybe } from '@/lib/orders'
import { getOrderStatusInfo } from '@/utils/orderStatus'
import { useAuth } from '@/context/AuthContext'

const openSans = Open_Sans({ subsets: ['latin'] })

interface UIOrderItem {
  id: string
  producto_nombre: string
  variacion_nombre?: string
  sku?: string
  cantidad: number
  precio_unitario: string
}

export default function OrderDetailPage() {
  const router = useRouter()
  const { tracking } = router.query
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<any>(null)
  const [raw, setRaw] = useState<any>(null)

  useEffect(()=> {
    let active = true
    async function load() {
      if (!tracking || Array.isArray(tracking)) return
      setLoading(true)
      setError(null)
      try {
        let data:any
        if (typeof fetchOrderByTrackingMaybe === 'function') {
          try {
            data = await fetchOrderByTrackingMaybe(tracking, token)
          } catch (err:any) {
            // Helper might already produce { data } shape or throw with error
            if (err?.error?.code) throw err
            throw err
          }
        } else {
          const res = await fetch(`/api/orders/track/${tracking}`)
          const json = await res.json().catch(()=>null)
            data = json
          if (!res.ok) {
            throw json?.error || { message: 'No se pudo cargar la orden' }
          }
        }
        if (!active) return
        setRaw(data)
        // Accept shapes: {data:{...}}, {order:{...}}, or direct order
        const resolved = data?.data || data?.order || data
        setOrder(resolved)
      } catch(e:any) {
        if (!active) return
        const apiErr = e?.error || e
        setError(apiErr?.code === 'ORDER_NOT_FOUND' ? 'Orden no encontrada' : (apiErr?.message || 'No se pudo cargar la orden'))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [tracking, token])

  return (
    <main className={openSans.className}>
      <Header />
      <div className="min-h-screen bg-slate-50/40">
        <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
          <nav className="mb-10 text-xs text-slate-500 flex items-center gap-2">
            <Link href="/profile" className="hover:text-slate-700 font-medium">Perfil</Link>
            <span>/</span>
            <span className="text-slate-700">Orden</span>
          </nav>

          {loading ? (
            <div className="py-24 text-center text-slate-600">Cargando orden...</div>
          ) : error ? (
            <div className="py-24 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={()=> router.reload()} className="px-4 py-2 text-sm bg-slate-900 text-white">Reintentar</button>
            </div>
          ) : !order ? (
            <div className="py-24 text-center text-slate-600">Orden no encontrada</div>
          ) : (
            <div className="space-y-10">
              <OrderHeader order={order} />

              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                  <ItemsPanel order={order} />

                  <TimelinePanel order={order} />
                </div>

                <div className="space-y-6">
                  <SummaryPanel order={order} />

                  <ContactPanel order={order} />

                  <ShippingPanel order={order} />

                  <div className="pt-2">
                    <Link href="/profile" className="text-xs text-slate-600 hover:text-slate-800 inline-flex items-center gap-1">← Volver al perfil</Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}

// ---- Sub Components ----
function statusStyle(status?: string) {
  const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-medium'
  if (!status) return base + ' bg-slate-200 text-slate-700'
  const info = getOrderStatusInfo(status)
  // Map to utility classes approximating color; fallback generic
  const classMap: Record<string,string> = {
    pending_approval: 'bg-amber-100 text-amber-800',
    created: 'bg-indigo-100 text-indigo-700',
    processing: 'bg-blue-100 text-blue-700',
    in_transit: 'bg-sky-100 text-sky-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
    refunded: 'bg-cyan-100 text-cyan-700'
  }
  return base + ' ' + (classMap[info.code] || 'bg-slate-200 text-slate-700')
}

const OrderHeader = ({ order }: { order: any }) => {
  if (!order) return null
  return (
    <header className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Orden #{order.order_number}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
            <div>Creada <span className="font-medium text-slate-900">{order.created_at ? new Date(order.created_at).toLocaleString('es-DO') : '—'}</span></div>
            <div>Estado <span className={statusStyle(order.estado)}>{getOrderStatusInfo(order.estado).label}</span></div>
            <div>Total <span className="font-medium text-slate-900">{Number(order.monto_total||0).toLocaleString('es-DO',{ style:'currency', currency:'DOP' })}</span></div>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <code className="px-2 py-1 bg-slate-900 text-white rounded text-xs font-mono tracking-wide">{order.tracking_number}</code>
          <CopyButton value={order.tracking_number} />
        </div>
      </div>
    </header>
  )
}

const CopyButton = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(()=> setCopied(false), 1800) }}
      className="text-xs px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded transition-colors"
    >{copied ? 'Copiado' : 'Copiar'}</button>
  )
}

const ItemsPanel = ({ order }: { order: any }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">Artículos</h2>
        <span className="text-xs text-slate-500">{order.detalles?.length || 0} artículo(s)</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {order.detalles?.map((it: UIOrderItem) => (
          <li key={it.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{it.producto_nombre} {it.variacion_nombre && <span className='text-slate-400'>({it.variacion_nombre})</span>}</p>
              {it.sku && <p className="text-xs text-slate-500 mt-1">SKU: {it.sku}</p>}
            </div>
            <div className="flex items-center gap-8 flex-shrink-0">
              <span className="text-xs text-slate-500">x{it.cantidad}</span>
              <span className="font-semibold text-slate-900 whitespace-nowrap">{Number(it.precio_unitario||0).toLocaleString('es-DO',{ style:'currency', currency:'DOP' })}</span>
            </div>
          </li>
        ))}
        {!order.detalles?.length && (
          <li className="p-5 text-sm text-slate-500">Sin detalles de artículos.</li>
        )}
      </ul>
    </section>
  )
}

const TimelinePanel = ({ order }: { order: any }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">Seguimiento</h2>
        <span className="text-xs text-slate-500">{order.seguimientos?.length || 0} eventos</span>
      </div>
      <div className="p-6">
        {order.seguimientos?.length ? (
          <ol className="relative border-l border-slate-200 pl-6 space-y-6">
            {order.seguimientos.map((ev: any, idx: number) => (
              <li key={idx} className="relative">
                <span className="absolute -left-3 w-2.5 h-2.5 rounded-full bg-slate-400" />
                <div className="text-xs text-slate-500 mb-1">{ev.created_at ? new Date(ev.created_at).toLocaleString('es-DO') : '—'}</div>
                <p className="text-sm font-medium text-slate-800">{ev.estado || 'Actualización'}</p>
                {ev.comentario && <p className="text-xs text-slate-600 mt-1">{ev.comentario}</p>}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-500">Sin eventos de seguimiento todavía.</p>
        )}
      </div>
    </section>
  )
}

const SummaryPanel = ({ order }: { order: any }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">Resumen</h2>
      </div>
      <div className="p-6 space-y-4 text-sm">
        <div className="flex justify-between"><span className="text-slate-600">Total</span><span className="font-semibold text-slate-900">{Number(order.monto_total||0).toLocaleString('es-DO',{ style:'currency', currency:'DOP' })}</span></div>
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <p className="text-xs text-slate-500">Número de seguimiento para consultas o soporte.</p>
          <code className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono">{order.tracking_number}</code>
        </div>
      </div>
    </section>
  )
}

const ContactPanel = ({ order }: { order: any }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">Contacto</h2>
      </div>
      <div className="p-6 text-sm space-y-1">
        <p className="font-medium text-slate-900">{order.contacto?.nombre} {order.contacto?.apellido}</p>
        <p className="text-slate-600">{order.contacto?.correo}</p>
        <p className="text-slate-600">{order.contacto?.telefono}</p>
      </div>
    </section>
  )
}

const ShippingPanel = ({ order }: { order: any }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">Dirección de envío</h2>
      </div>
      <div className="p-6 text-sm space-y-1">
        <p className="text-slate-900">{order.direccion_envio?.calle}</p>
        <p className="text-slate-600">{order.direccion_envio?.ciudad}, {order.direccion_envio?.provincia}</p>
        <p className="text-slate-600">{order.direccion_envio?.pais} {order.direccion_envio?.codigo_postal}</p>
      </div>
    </section>
  )
}
