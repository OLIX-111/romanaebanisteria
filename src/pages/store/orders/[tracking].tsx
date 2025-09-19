"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Open_Sans } from 'next/font/google'
import { fetchOrderByTracking as fetchOrderByTrackingMaybe } from '@/lib/orders'
import { getOrderStatusInfo } from '@/utils/orderStatus'
import { useAuth } from '@/context/AuthContext'
import { CheckCircle2, Clock, Package, Cog, Truck, XCircle, Info } from 'lucide-react'

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
                  <TimelinePanel order={order} />

                  <ItemsPanel order={order} />
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
    pending: 'bg-amber-100 text-amber-800',
    pending_approval: 'bg-amber-100 text-amber-800',
    created: 'bg-indigo-100 text-indigo-700',
    processing: 'bg-blue-100 text-blue-700',
    in_transit: 'bg-sky-100 text-sky-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
    refunded: 'bg-cyan-100 text-cyan-700'
  }
  return base + ' ' + (classMap[info.code] || classMap[status] || 'bg-slate-200 text-slate-700')
}

const OrderHeader = ({ order }: { order: any }) => {
  if (!order) return null
  const normalized = normalizeStatus(order.estado ?? order.estado_actual)
  const lastUpdated = getLastUpdatedAt(order)
  const createdAt = order.created_at || order.fecha_creacion
  return (
    <header className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Orden #{order.order_number}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
            <div>Creada <span className="font-medium text-slate-900">{createdAt ? new Date(createdAt).toLocaleString('es-DO') : '—'}</span></div>
            <div>Estado <span className={statusStyle(order.estado ?? order.estado_actual)}>{getOrderStatusInfo(normalized)?.label || (order.estado ?? order.estado_actual)}</span></div>
            <div>Total <span className="font-medium text-slate-900">{Number(order.monto_total||0).toLocaleString('es-DO',{ style:'currency', currency:'DOP' })}</span></div>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <code className="px-2 py-1 bg-slate-900 text-white rounded text-xs font-mono tracking-wide">{order.tracking_number}</code>
          <CopyButton value={order.tracking_number} />
        </div>
      </div>

      <StatusSummary status={normalized} lastUpdated={lastUpdated} />
      <StatusProgress current={normalized} />
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
  // Build a combined list of events from `seguimientos` and `historial_por_estado`
  const combined = useMemo(() => {
    const rawSeg = Array.isArray(order?.seguimientos) ? order.seguimientos : []
    const segEvents = rawSeg.map((ev: any) => ({
      fecha: ev.created_at || ev.fecha,
      estado: ev.estado,
      comentario: ev.comentario || ev.nota,
      usuario: ev.usuario
    }))

    const historial = order?.historial_por_estado && typeof order.historial_por_estado === 'object'
      ? Object.entries(order.historial_por_estado as Record<string, any[]>)
          .flatMap(([estado, arr]) => (arr || []).map((h: any) => ({
            fecha: h.fecha,
            estado,
            comentario: h.nota,
            usuario: h.usuario
          })))
      : []

    const all = [...segEvents, ...historial].filter(e => e && (e.fecha || e.estado))
    // sort asc by date/time
    all.sort((a, b) => new Date(a.fecha || 0).getTime() - new Date(b.fecha || 0).getTime())
    return all
  }, [order])
  return (
    <section className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">Seguimiento</h2>
        <span className="text-xs text-slate-500">{combined.length} eventos</span>
      </div>
      <div className="p-6">
        {combined.length ? (
          <ol className="relative border-l border-slate-200 pl-6 space-y-6">
            {combined.map((ev: any, idx: number) => {
              const s = normalizeStatus(ev.estado)
              const Icon = statusIcon(s)
              const color = statusColor(s)
              return (
                <li key={idx} className="relative">
                  <span className={`absolute -left-3 w-2.5 h-2.5 rounded-full ${color}`} />
                  <div className="text-xs text-slate-500 mb-1">{ev.fecha ? new Date(ev.fecha).toLocaleString('es-DO') : '—'}</div>
                  <p className="text-sm font-medium text-slate-800 inline-flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color.replace('bg-','text-')}`} />
                    {getOrderStatusInfo(ev.estado)?.label || ev.estado || 'Actualización'}
                  </p>
                  {ev.comentario && <p className="text-xs text-slate-600 mt-1">{ev.comentario}</p>}
                </li>
              )
            })}
          </ol>
        ) : (
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <Info className="w-4 h-4 mt-0.5 text-slate-400" />
            <p>Sin eventos de seguimiento todavía. Te avisaremos cuando tu orden avance de estado.</p>
          </div>
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

// ---- Status UX helpers ----
type NormalizedStatus = 'pending' | 'created' | 'processing' | 'in_transit' | 'delivered' | 'cancelled' | 'refunded' | 'unknown'

function normalizeStatus(s?: string): NormalizedStatus {
  const v = (s || '').toLowerCase()
  if (!v) return 'unknown'
  if (v === 'pending' || v === 'pending_approval' || v === 'pendiente') return 'pending'
  if (v === 'created' || v === 'creada') return 'created'
  if (v === 'processing' || v === 'processed' || v === 'en_proceso' || v === 'procesando') return 'processing'
  if (v === 'in_transit' || v === 'shipped' || v === 'en_transito' || v === 'enviado') return 'in_transit'
  if (v === 'delivered' || v === 'completed' || v === 'entregado') return 'delivered'
  if (v === 'cancelled' || v === 'canceled' || v === 'cancelado') return 'cancelled'
  if (v === 'refunded' || v === 'reembolsado') return 'refunded'
  return 'unknown'
}

function statusIcon(s: NormalizedStatus) {
  switch (s) {
    case 'pending':
    case 'created':
      return Clock
    case 'processing':
      return Cog
    case 'in_transit':
      return Truck
    case 'delivered':
      return CheckCircle2
    case 'cancelled':
    case 'refunded':
      return XCircle
    default:
      return Info
  }
}

function statusColor(s: NormalizedStatus) {
  switch (s) {
    case 'pending':
      return 'bg-blue-500'
    case 'created':
      return 'bg-blue-500'
    case 'processing':
      return 'bg-blue-500'
    case 'in_transit':
      return 'bg-blue-500'
    case 'delivered':
      return 'bg-blue-500'
    case 'cancelled':
      return 'bg-blue-500'
    case 'refunded':
      return 'bg-blue-500'
    default:
      return 'bg-slate-400'
  }
}

function getLastUpdatedAt(order: any): Date | null {
  // prefer explicit fecha_actualizacion if present
  const fa = order?.fecha_actualizacion
  if (fa) return new Date(fa)
  const segMax = Array.isArray(order?.seguimientos) && order.seguimientos.length
    ? order.seguimientos.reduce((acc: number, ev: any) => {
        const t = ev?.created_at ? new Date(ev.created_at).getTime() : (ev?.fecha ? new Date(ev.fecha).getTime() : 0)
        return Math.max(acc, t)
      }, 0)
    : 0
  const histMax = order?.historial_por_estado && typeof order.historial_por_estado === 'object'
    ? Object.values(order.historial_por_estado as Record<string, any[]>).flat().reduce((acc: number, h: any) => {
        const t = h?.fecha ? new Date(h.fecha).getTime() : 0
        return Math.max(acc, t)
      }, 0)
    : 0
  const maxTs = Math.max(segMax, histMax)
  if (maxTs) return new Date(maxTs)
  const created = order?.created_at || order?.fecha_creacion
  return created ? new Date(created) : null
}

const statusFriendlyMessage: Record<NormalizedStatus,string> = {
  pending: 'Tu orden fue creada y está pendiente de confirmación.',
  created: 'Estamos preparando tu orden. Pronto comenzará a procesarse.',
  processing: 'Tu orden está en proceso. Estamos trabajando en los productos.',
  in_transit: '¡En camino! Tu orden está siendo transportada.',
  delivered: 'Entregada. ¡Esperamos que disfrutes tu compra!',
  cancelled: 'Orden cancelada. Contáctanos si necesitas ayuda.',
  refunded: 'Reembolso emitido o en proceso.',
  unknown: 'Estado no disponible por el momento.'
}

const stepOrder: NormalizedStatus[] = ['pending','created','processing','in_transit','delivered']

const StatusSummary = ({ status, lastUpdated }: { status: NormalizedStatus, lastUpdated: Date | null }) => {
  const Icon = statusIcon(status)
  const color = statusColor(status).replace('bg-','text-')
  return (
    <div className="w-full rounded-md border border-slate-200 bg-white/80 px-4 py-3 flex items-start gap-3">
      <Icon className={`w-5 h-5 mt-0.5 ${color}`} />
      <div className="text-sm">
        <p className="text-slate-900 font-medium">{getOrderStatusInfo(status)?.label || getOrderStatusInfo(String(status))?.label || status.toUpperCase()}</p>
        <p className="text-slate-600">{statusFriendlyMessage[status]}</p>
        {lastUpdated && (
          <p className="text-xs text-slate-500 mt-1">Actualizado el {lastUpdated.toLocaleString('es-DO')}</p>
        )}
      </div>
    </div>
  )
}

const StatusProgress = ({ current }: { current: NormalizedStatus }) => {
  const currentIndex = useMemo(() => {
    const idx = stepOrder.indexOf(current)
    return idx === -1 ? 0 : idx
  }, [current])
  return (
    <div className="mt-2">
      <ol className="grid grid-cols-5 gap-2">
        {stepOrder.map((s, idx) => {
          const active = idx <= currentIndex
          const Icon = statusIcon(s)
          const color = active ? statusColor(s) : 'bg-slate-200'
          const text = active ? color.replace('bg-','text-') : 'text-slate-400'
          return (
            <li key={s} className="flex flex-col items-center text-center">
              <div className={`w-full h-1 rounded-full ${color} mb-2`} aria-hidden />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${active ? color : 'bg-slate-200'}`}>
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <span className={`mt-2 text-[11px] font-medium ${active ? 'text-slate-800' : 'text-slate-400'}`}>{getOrderStatusInfo(s)?.label || s}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const ContactPanel = ({ order }: { order: any }) => {
  const cliente = order?.cliente || {}
  const contacto = order?.contacto || {}
  const nombre = cliente?.nombre || [contacto?.nombre, contacto?.apellido].filter(Boolean).join(' ').trim()
  const email = cliente?.email || contacto?.correo
  const telefono = cliente?.telefono || contacto?.telefono
  return (
    <section className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">Contacto</h2>
      </div>
      <div className="p-6 text-sm space-y-1">
        {nombre && <p className="font-medium text-slate-900">{nombre}</p>}
        {email && <p className="text-slate-600">{email}</p>}
        {telefono && <p className="text-slate-600">{telefono}</p>}
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
