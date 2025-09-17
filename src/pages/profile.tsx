"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useEffect, useState } from "react"
import { getOrderStatusInfo } from '@/utils/orderStatus'
import { useRouter } from "next/router"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
// NOTE: fetchOrders remains imported; fetchOrderByTracking may not exist if lib/orders missing in project tree.
import { fetchOrders, fetchOrderByTracking as fetchOrderByTrackingMaybe } from '@/lib/orders'

const openSans = Open_Sans({ subsets: ["latin"] })

export default function ProfilePage() {
  const router = useRouter()
  const [flash, setFlash] = useState<string | null>(null)
  const { user, loading, error, logout, refreshUser, token } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  // Tracking form state
  const [trackingCode, setTrackingCode] = useState("")
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackingError, setTrackingError] = useState<string | null>(null)
  const [trackedOrder, setTrackedOrder] = useState<any | null>(null)

  // Removed auto-redirect to allow public tracking access when not authenticated.
  // We'll conditionally render login prompt + tracking UI instead.
  useEffect(() => {
    // If there was an auth error we keep existing error rendering below.
  }, [loading, user, error])

  // Optionally could trigger refresh on mount
  useEffect(() => { if (user) refreshUser() }, [])

  // Fetch orders when user & token available
  useEffect(() => {
    let active = true
    async function load() {
      if (!user || !token) return
      setOrdersLoading(true)
      setOrdersError(null)
      try {
        const resp = await fetchOrders(token)
        if (!active) return
        setOrders(resp.data || [])
      } catch (e:any) {
        if (!active) return
        setOrdersError(e?.message || 'No se pudieron cargar las órdenes')
      } finally {
        if (active) setOrdersLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [user, token])

  // Read and clear flash message from localStorage
  useEffect(() => {
    try {
      const f = localStorage.getItem('romana_flash')
      if (f) {
        setFlash(f)
        localStorage.removeItem('romana_flash')
      }
    } catch {}
  }, [])

  if (loading) return <div className="mt-24 text-center">Cargando...</div>

  if (error) {
    return (
      <main className={openSans.className}>
        <Header />
        <div className="container mx-auto mt-24 px-4 py-12 lg:px-8">
          <div className="mb-6 p-3 border border-red-300 bg-red-50 text-red-800 text-sm">{error}</div>
          <button
            onClick={() => router.replace('/login?returnTo=/profile')}
            className="px-4 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800"
          >Ir a iniciar sesión</button>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className={openSans.className}>
      <Header />
      <div className="container mx-auto mt-24 px-4 py-12 lg:px-8">
        {flash && (
          <div className="mb-6 p-3 border border-emerald-300 bg-emerald-50 text-emerald-800 text-sm">
            {flash}
          </div>
        )}
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Perfil y rastreo de órdenes</h1>
        {/* Tracking Section (always visible) */}
        <section className="mt-8 border border-gray-200 p-6">
          <h2 className="text-sm font-semibold tracking-wide text-gray-800 mb-4">Rastrea tu orden</h2>
          <p className="text-sm text-gray-600 mb-4">Ingresa el número de tracking proporcionado al crear tu orden para ver su estado.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const code = trackingCode.trim()
              if (!code) { setTrackingError('Ingresa un código válido'); return }
              setTrackingError(null)
              setTrackedOrder(null)
              setTrackingLoading(true)
              try {
                // Attempt to use helper if available, else fallback to direct fetch
                let data:any = null
                if (typeof fetchOrderByTrackingMaybe === 'function') {
                  try {
                    data = await fetchOrderByTrackingMaybe(code)
                  } catch (innerErr:any) {
                    // If helper throws structured error with response json attempt to read
                    const msg = innerErr?.message || ''
                    if (innerErr?.error?.code) {
                      throw innerErr
                    }
                    throw innerErr
                  }
                } else {
                  const res = await fetch(`/api/orders/track/${code}`)
                  const json = await res.json().catch(()=>null)
                  if (!res.ok) {
                    throw json?.error || { message: 'No se encontró la orden' }
                  }
                  data = json
                }
                // Expected success shape: { data: {...}, meta: {...} }
                if (data?.data) {
                  setTrackedOrder({ order: data.data, meta: data.meta, seguimientos: data.data.seguimientos || data.seguimientos || [] })
                } else if (data?.order) {
                  // Previous helper shape { order, seguimientos }
                  setTrackedOrder(data)
                } else {
                  // Fallback: treat raw as order
                  setTrackedOrder({ order: data })
                }
              } catch (err:any) {
                const apiError = err?.error || err
                const code = apiError?.code
                const message = apiError?.message || err?.message || 'No se encontró la orden'
                setTrackingError(code === 'ORDER_NOT_FOUND' ? 'Orden no encontrada' : message)
              } finally {
                setTrackingLoading(false)
              }
            }}
            className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end"
          >
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Tracking number</label>
              <input
                type="text"
                value={trackingCode}
                onChange={e => setTrackingCode(e.target.value.toUpperCase())}
                placeholder="Ej: TRK123456"
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 tracking-wide uppercase"
                disabled={trackingLoading}
              />
            </div>
            <button
              type="submit"
              disabled={trackingLoading}
              className="px-5 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >{trackingLoading ? 'Buscando...' : 'Rastrear'}</button>
          </form>
          {trackingError && <p className="mt-3 text-xs text-red-600">{trackingError}</p>}
          {trackedOrder && trackedOrder.order && (
            <div className="mt-6 border border-gray-200">
              {/* Header Info */}
              <div className="p-5 grid gap-4 md:grid-cols-4 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Orden</p>
                  <p className="font-semibold text-gray-900">#{trackedOrder?.order?.order_number || trackedOrder?.order?.id?.slice?.(0,8)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Tracking</p>
                  <p className="font-mono text-gray-800 break-all">{trackedOrder?.order?.tracking_number}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Estado</p>
                  {(() => { const info = getOrderStatusInfo(trackedOrder?.order?.estado); const map: Record<string,string> = {
                    pending_approval: 'bg-amber-100 text-amber-800',
                    created: 'bg-indigo-100 text-indigo-700',
                    processing: 'bg-blue-100 text-blue-700',
                    in_transit: 'bg-sky-100 text-sky-700',
                    delivered: 'bg-emerald-100 text-emerald-700',
                    cancelled: 'bg-rose-100 text-rose-700',
                    refunded: 'bg-cyan-100 text-cyan-700'
                  }; const cls = map[info.code] || 'bg-gray-200 text-gray-700'; return <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium ${cls}`}>{info.label}</span> })()}
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Creada</p>
                  <p>{trackedOrder?.order?.created_at ? new Date(trackedOrder.order.created_at).toLocaleString('es-DO') : '—'}</p>
                </div>
              </div>
              {/* Items */}
              <div className="border-t border-gray-200">
                <div className="p-5">
                  <h3 className="text-xs font-semibold tracking-wide text-gray-700 mb-3">Artículos</h3>
                  {trackedOrder?.order?.detalles && trackedOrder.order.detalles.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr className="text-left">
                            <th className="py-2 px-3 font-medium">Producto</th>
                            <th className="py-2 px-3 font-medium">Variación</th>
                            <th className="py-2 px-3 font-medium text-right">Cantidad</th>
                            <th className="py-2 px-3 font-medium text-right">Precio</th>
                            <th className="py-2 px-3 font-medium text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {trackedOrder.order.detalles.map((d:any) => {
                            const unit = Number(d.precio_unitario||0)
                            const sub = unit * Number(d.cantidad||0)
                            return (
                              <tr key={d.id} className="text-gray-800">
                                <td className="py-2 px-3 font-medium whitespace-nowrap">{d.producto_nombre}</td>
                                <td className="py-2 px-3 text-gray-600 whitespace-nowrap">{d.variacion_nombre || '—'}</td>
                                <td className="py-2 px-3 text-right">{d.cantidad}</td>
                                <td className="py-2 px-3 text-right">{unit.toLocaleString('es-DO',{style:'currency',currency:'DOP'})}</td>
                                <td className="py-2 px-3 text-right font-medium">{sub.toLocaleString('es-DO',{style:'currency',currency:'DOP'})}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={4} className="py-3 px-3 text-right text-gray-600 font-medium">Total</td>
                            <td className="py-3 px-3 text-right font-semibold text-gray-900">{Number(trackedOrder?.order?.monto_total||0).toLocaleString('es-DO',{style:'currency',currency:'DOP'})}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600">Sin artículos.</p>
                  )}
                </div>
              </div>
              {/* Seguimientos */}
              <div className="border-t border-gray-200">
                <div className="p-5">
                  <h3 className="text-xs font-semibold tracking-wide text-gray-700 mb-3">Seguimiento</h3>
                  {trackedOrder?.seguimientos && trackedOrder.seguimientos.length > 0 ? (
                    <ol className="space-y-3 text-xs">
                      {trackedOrder.seguimientos.map((s:any, idx:number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="mt-0.5 h-2 w-2 rounded-full bg-gray-900 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{s.estado}</p>
                            <p className="text-[11px] text-gray-500">{new Date(s.created_at).toLocaleString('es-DO')}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-xs text-gray-600">Sin eventos de seguimiento todavía.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
        {user && (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <section className="border border-gray-200 p-6">
              <h2 className="text-sm font-semibold tracking-wide text-gray-800">Sesión</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-700 sm:grid-cols-2">
                <div className="border border-gray-200 p-4"><span className="text-gray-500">Email</span><div className="mt-1 font-medium">{user?.correo}</div></div>
                <div className="border border-gray-200 p-4"><span className="text-gray-500">Nombre</span><div className="mt-1 font-medium">{user?.nombre || '—'}</div></div>
              </div>
              <div className="mt-4">
                <button
                  onClick={async () => { logout(); router.push('/') }}
                  className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50"
                >Cerrar sesión</button>
              </div>
            </section>
          </div>
        )}

        {user && (
        <section className="mt-8 border border-gray-200 p-6">
          <h2 className="text-sm font-semibold tracking-wide text-gray-800 mb-4">Órdenes recientes</h2>
          {ordersLoading ? (
            <p className="text-sm text-gray-600">Cargando órdenes...</p>
          ) : ordersError ? (
            <p className="text-sm text-red-600">{ordersError}</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-gray-600">No hay órdenes registradas aún.</p>
          ) : (
            <div className="overflow-hidden border border-gray-200 divide-y">
              {orders.map(o => (
                <div key={o.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">Orden #{o.order_number || o.id.slice(0,8)}</p>
                    <p className="text-gray-600">{new Date(o.created_at).toLocaleString('es-DO')}</p>
                    <p className="text-xs text-gray-500 mt-1">Estado: <span className="font-medium text-gray-700">{o.estado}</span></p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-gray-900 font-semibold whitespace-nowrap">{Number(o.monto_total||0).toLocaleString('es-DO',{ style:'currency', currency:'DOP' })}</div>
                    <Link href={`/store/orders/${o.tracking_number}`} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-xs font-medium hover:bg-gray-50">
                      Ver
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex items-center gap-4">
            <Link href="/store" className="inline-block px-4 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800">Seguir comprando</Link>
            <button
              onClick={() => {
                if (!token) return
                setOrdersLoading(true)
                fetchOrders(token).then(r=> setOrders(r.data||[])).catch(e=> setOrdersError(e?.message||'Error refrescando')).finally(()=> setOrdersLoading(false))
              }}
              className="text-xs px-3 py-2 border border-gray-300 hover:bg-gray-50"
            >Refrescar</button>
          </div>
        </section>
        )}
      </div>
      <Footer />
    </main>
  )
}


