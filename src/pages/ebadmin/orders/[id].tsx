import { useRouter } from 'next/router'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminAuth } from '@/components/admin/useAdminAuth'
import { fetchAdminOrderById, updateAdminOrderStatus } from '@/lib/orders'
import { ArrowLeft, Package, User, MapPin, AlertTriangle, RefreshCw, Info, Copy, Check, Clock, Wrench, Truck, CheckCircle, XCircle, RotateCcw, ExternalLink } from 'lucide-react'
import { getOrderStatusInfo } from '@/utils/orderStatus'

interface CrmOrderDetail {
  id: string
  producto_id: string
  variacion_id: string
  producto_nombre: string
  variacion_nombre?: string
  sku?: string
  captured_at?: string
  cantidad: number
  precio_unitario: string
  configuracion: any
}

interface CrmOrder {
  id: string
  estado?: string
  estado_actual?: string
  monto_total: string
  calculated_subtotal?: string
  direccion_envio?: {
    pais: string
    calle: string
    ciudad: string
    provincia: string
    codigo_postal: string
  } | null
  contacto?: {
    correo: string
    nombre: string
    apellido: string
    telefono: string
  } | null
  cliente?: {
    id?: string
    nombre?: string
    email?: string
    telefono?: string
  } | null
  reclamada: boolean
  order_number: string
  tracking_number: string
  items_count: number
  created_at?: string
  fecha_creacion?: string
  fecha_actualizacion?: string
  detalles: CrmOrderDetail[]
  seguimientos?: Array<{ created_at?: string; fecha?: string; estado?: string; comentario?: string; usuario?: any }>
  historial_por_estado?: Record<string, Array<{ fecha?: string; nota?: string; usuario?: any }>>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount)
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_,i)=>(<div key={i} className="h-24 bg-gray-100 rounded animate-pulse"/>))}
      </div>
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-3">
        {[...Array(4)].map((_,i)=>(<div key={i} className="h-16 bg-gray-100 rounded animate-pulse"/>))}
      </div>
    </div>
  )
}

function StatusBadge({ estado }: { estado: string }) {
  const info = getOrderStatusInfo(estado)
  return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium" style={{backgroundColor: info.color + '20', color: info.color}}>{info.label}</span>
}

function getCreatedAt(o: CrmOrder) {
  return o.fecha_creacion || o.created_at
}

function getLastUpdated(o: CrmOrder) {
  if (o.fecha_actualizacion) return o.fecha_actualizacion
  const segMax = (o.seguimientos || []).reduce((acc, ev) => {
    const t = ev.created_at || ev.fecha
    const ts = t ? new Date(t).getTime() : 0
    return Math.max(acc, ts)
  }, 0)
  const histMax = o.historial_por_estado
    ? Object.values(o.historial_por_estado).flat().reduce((acc, h) => {
        const ts = h.fecha ? new Date(h.fecha).getTime() : 0
        return Math.max(acc, ts)
      }, 0)
    : 0
  const maxTs = Math.max(segMax, histMax)
  if (maxTs) return new Date(maxTs).toISOString()
  return getCreatedAt(o)
}

function buildCombinedEvents(o: CrmOrder) {
  const seg = (o.seguimientos || []).map(ev => ({
    fecha: ev.fecha || ev.created_at,
    estado: ev.estado,
    comentario: ev.comentario,
    usuario: ev.usuario
  }))
  const hist = o.historial_por_estado
    ? Object.entries(o.historial_por_estado).flatMap(([estado, arr]) =>
        (arr || []).map(h => ({ fecha: h.fecha, estado, comentario: h.nota, usuario: h.usuario }))
      )
    : []
  const all = [...seg, ...hist].filter(e => e.fecha || e.estado)
  all.sort((a, b) => new Date(a.fecha || 0).getTime() - new Date(b.fecha || 0).getTime())
  return all
}

export default function AdminOrderDetailPage() {
  const router = useRouter()
  const { id } = router.query as { id?: string }
  const { loading: authLoading, isAdmin, user } = useAdminAuth()
  const [order, setOrder] = useState<CrmOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState<string | null>(null)
  const [updateErr, setUpdateErr] = useState<string | null>(null)
  const [newEstado, setNewEstado] = useState<string>('')
  const [nota, setNota] = useState<string>('')
  const [copied, setCopied] = useState<{ order?: boolean; tracking?: boolean; email?: boolean; phone?: boolean; address?: boolean }>({})

  const currentEstado = order?.estado_actual || order?.estado || ''

  function copyToClipboard(text: string, key: keyof typeof copied) {
    if (!text) return
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(prev => ({ ...prev, [key]: true }))
        setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 1500)
      })
    }
  }

  function buildAddressString() {
    const a = order?.direccion_envio
    if (!a) return ''
    return [a.calle, a.ciudad, a.provincia, a.pais, a.codigo_postal].filter(Boolean).join(', ')
  }

  function statusIcon(status?: string) {
    const s = (status || '').toLowerCase()
    if (s.includes('entregado')) return { Icon: CheckCircle, color: '#16a34a' }
    if (s.includes('cancel')) return { Icon: XCircle, color: '#ef4444' }
    if (s.includes('reembol')) return { Icon: RotateCcw, color: '#0ea5e9' }
    if (s.includes('transit') || s.includes('tráns') || s.includes('transito')) return { Icon: Truck, color: '#3b82f6' }
    if (s.includes('proceso') || s.includes('process')) return { Icon: Wrench, color: '#a855f7' }
    if (s.includes('cread') || s.includes('pend')) return { Icon: Clock, color: '#f59e0b' }
    return { Icon: Info, color: '#64748b' }
  }

  const handleTabChange = (tab: 'dashboard' | 'orders' | 'clients' | 'services') => {
    switch (tab) {
      case 'dashboard': window.location.href = '/ebadmin'; break
      case 'orders': window.location.href = '/ebadmin/orders'; break
      case 'clients': window.location.href = '/ebadmin/clients'; break
      case 'services': window.location.href = '/ebadmin/services/requests'; break
    }
  }

  const loadOrder = async (oid: string) => {
    setLoading(true); setError(null)
    try {
      const resp = await fetchAdminOrderById(oid, 'detalles')
      // resp.data is guaranteed after normalization
      setOrder(resp.data as any)
    } catch (e: any) {
      console.error('Error cargando orden', e)
      setError(e?.message || 'No se pudo cargar la orden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) loadOrder(id)
  }, [id])

  // Prefill estado selector with current state
  useEffect(() => {
    setNewEstado(prev => prev || currentEstado)
  }, [currentEstado])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Verificando credenciales...</p>
        </div>
      </div>
    )
  }
  if (!isAdmin) return null

  return (
    <>
      <Head><title>Orden #{order?.order_number || id} | Romana Admin</title></Head>
      <AdminLayout activeTab="orders" onTabChange={handleTabChange} user={user}>
        <div className="mb-6 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/ebadmin/orders')} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft size={18} /> Volver
              </button>
              {order && (
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">Orden {order.order_number}</h1>
                  <button onClick={()=>copyToClipboard(order.order_number, 'order')} className="p-1.5 rounded hover:bg-gray-100" title="Copiar número de orden">
                    {copied.order ? <Check className="w-4 h-4 text-emerald-600"/> : <Copy className="w-4 h-4 text-gray-500"/>}
                  </button>
                  <StatusBadge estado={currentEstado} />
                </div>
              )}
            </div>
            {order && (
              <div className="flex items-center gap-3 text-xs">
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded border bg-white text-gray-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Actualizado {getLastUpdated(order) ? new Date(getLastUpdated(order) as string).toLocaleString('es-DO') : '—'}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded border bg-white">
                  <span className="text-gray-500">Tracking</span>
                  <span className="font-mono text-gray-800">{order.tracking_number}</span>
                  <button onClick={()=>copyToClipboard(order.tracking_number, 'tracking')} className="p-1 rounded hover:bg-gray-100" title="Copiar tracking">
                    {copied.tracking ? <Check className="w-3.5 h-3.5 text-emerald-600"/> : <Copy className="w-3.5 h-3.5 text-gray-500"/>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {loading && <LoadingSkeleton />}
        {!loading && error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p>{error}</p>
              <button onClick={() => id && loadOrder(id)} className="mt-2 inline-flex items-center gap-1 text-xs underline">
                <RefreshCw size={14} /> Reintentar
              </button>
            </div>
          </div>
        )}
        {!loading && !error && !order && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">No se encontró la orden.</div>
        )}
        {!loading && !error && order && (
          <div className="space-y-10">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-[11px] font-medium uppercase text-gray-500">Estado</p>
                <div className="mt-1"><StatusBadge estado={order.estado_actual || order.estado || ''} /></div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-[11px] font-medium uppercase text-gray-500">Creada</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{getCreatedAt(order) ? new Date(getCreatedAt(order) as string).toLocaleString('es-DO') : '—'}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-[11px] font-medium uppercase text-gray-500">Total</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(Number(order.monto_total||0))}</p>
              </div>
            </div>

            {/* Status quick summary */}
            <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-3">
              <div className="text-xs">
                <p className="text-gray-900 font-medium">{getOrderStatusInfo(order.estado_actual || order.estado)?.label}</p>
                <p className="text-gray-600">Creada {getCreatedAt(order) ? new Date(getCreatedAt(order) as string).toLocaleString('es-DO') : '—'}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="text-gray-500">Tracking</span>
                <span className="font-mono">{order.tracking_number}</span>
                <button onClick={()=>copyToClipboard(order.tracking_number, 'tracking')} className="p-1 rounded hover:bg-gray-100" title="Copiar tracking">
                  {copied.tracking ? <Check className="w-3.5 h-3.5 text-emerald-600"/> : <Copy className="w-3.5 h-3.5 text-gray-500"/>}
                </button>
              </div>
            </div>

            {/* Update status form */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Actualizar estado</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] uppercase text-gray-500 mb-1">Estado</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                    value={newEstado}
                    onChange={(e)=> setNewEstado(e.target.value)}
                  >
                    <option value="">Selecciona un estado...</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="creada">Creada</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="en_transito">En tránsito</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="reembolsado">Reembolsado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] uppercase text-gray-500 mb-1">Nota</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                    rows={2}
                    placeholder="Descripción o motivo del cambio"
                    value={nota}
                    onChange={(e)=> setNota(e.target.value)}
                  />
                  <p className="mt-1 text-[11px] text-gray-500">Esta nota puede ser visible para otros administradores y sirve como historial.</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  disabled={!newEstado || updating}
                  onClick={async ()=>{
                    if (!id || !newEstado) return
                    if (['entregado','cancelado','reembolsado'].includes(newEstado)) {
                      const ok = window.confirm(`¿Confirmas marcar la orden como "${getOrderStatusInfo(newEstado).label}"?`)
                      if (!ok) return
                    }
                    setUpdating(true); setUpdateErr(null); setUpdateMsg(null)
                    try {
                      await updateAdminOrderStatus(id, { estado: newEstado, nota: nota || undefined })
                      setUpdateMsg('Estado actualizado exitosamente.')
                      setNota(''); setNewEstado('')
                      await loadOrder(id)
                    } catch (e:any) {
                      setUpdateErr(e?.message || 'No se pudo actualizar el estado')
                    } finally {
                      setUpdating(false)
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm"
                >
                  {updating && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Guardar cambio
                </button>
                {updateMsg && <span className="text-xs text-emerald-600">{updateMsg}</span>}
                {updateErr && <span className="text-xs text-red-600">{updateErr}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">Seguimiento e historial</h2>
                  {(() => {
                    const events = buildCombinedEvents(order)
                    return events.length ? (
                      <ol className="relative border-l pl-6 border-gray-200 space-y-6 bg-white border rounded-lg p-4">
                        {events.map((ev, idx) => {
                          const info = getOrderStatusInfo(ev.estado)
                          const { Icon, color } = statusIcon(ev.estado)
                          const dotBg = color + '1A'
                          return (
                            <li key={idx} className="relative">
                              <span className="absolute -left-[26px] w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: dotBg }}>
                                <Icon className="w-3.5 h-3.5" style={{ color }} />
                              </span>
                              <div className="text-xs text-gray-500 mb-1">{ev.fecha ? new Date(ev.fecha).toLocaleString('es-DO') : '—'}</div>
                              <p className="text-sm font-medium" style={{ color: info.color }}>{info.label}</p>
                              {ev.comentario && <p className="text-xs text-gray-700 mt-1">{ev.comentario}</p>}
                              {ev.usuario?.nombre && <p className="text-[11px] text-gray-500 mt-0.5">Por {ev.usuario.nombre}</p>}
                            </li>
                          )
                        })}
                      </ol>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-600 flex items-start gap-2"><Info className="w-4 h-4 mt-0.5 text-gray-400" /> Sin eventos aún.</div>
                    )
                  })()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><User size={18} />Contacto</h2>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm space-y-1">
                    {order.cliente || order.contacto ? (
                      <>
                        <p className="font-medium text-gray-900">{order.cliente?.nombre || `${order.contacto?.nombre || ''} ${order.contacto?.apellido || ''}`.trim()}</p>
                        <p className="text-gray-600 flex items-center gap-2">
                          <a className="hover:underline" href={`mailto:${order.cliente?.email || order.contacto?.correo}`}>{order.cliente?.email || order.contacto?.correo}</a>
                          <button onClick={()=>copyToClipboard(order.cliente?.email || order.contacto?.correo || '', 'email')} className="p-1 rounded hover:bg-gray-100" title="Copiar correo">
                            {copied.email ? <Check className="w-3.5 h-3.5 text-emerald-600"/> : <Copy className="w-3.5 h-3.5 text-gray-500"/>}
                          </button>
                        </p>
                        <p className="text-gray-600 flex items-center gap-2">
                          <a className="hover:underline" href={`tel:${order.cliente?.telefono || order.contacto?.telefono}`}>{order.cliente?.telefono || order.contacto?.telefono}</a>
                          <button onClick={()=>copyToClipboard(order.cliente?.telefono || order.contacto?.telefono || '', 'phone')} className="p-1 rounded hover:bg-gray-100" title="Copiar teléfono">
                            {copied.phone ? <Check className="w-3.5 h-3.5 text-emerald-600"/> : <Copy className="w-3.5 h-3.5 text-gray-500"/>}
                          </button>
                        </p>
                      </>
                    ) : <p className="italic text-gray-400">Sin contacto</p>}
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin size={18} />Envío</h2>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm space-y-1">
                    {order.direccion_envio ? (
                      <>
                        <p className="text-gray-900">{order.direccion_envio.calle}</p>
                        <p className="text-gray-600">{order.direccion_envio.ciudad}, {order.direccion_envio.provincia}</p>
                        <p className="text-gray-600">{order.direccion_envio.pais} {order.direccion_envio.codigo_postal}</p>
                        <div className="pt-1 flex items-center gap-2">
                          <button onClick={()=>copyToClipboard(buildAddressString(), 'address')} className="inline-flex items-center gap-1 px-2 py-1 text-xs border rounded hover:bg-gray-50">
                            {copied.address ? <Check className="w-3.5 h-3.5 text-emerald-600"/> : <Copy className="w-3.5 h-3.5 text-gray-500"/>}
                            Copiar dirección
                          </button>
                          <a className="inline-flex items-center gap-1 px-2 py-1 text-xs border rounded hover:bg-gray-50" target="_blank" rel="noopener noreferrer" href={`https://maps.google.com/?q=${encodeURIComponent(buildAddressString())}`}>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-500" /> Ver en mapa
                          </a>
                        </div>
                      </>
                    ) : <p className="italic text-gray-400">Sin dirección</p>}
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><Package size={18} />Artículos</h2>
                <div className="space-y-3">
                  {order.detalles.map(det => {
                    const unit = Number(det.precio_unitario||0)
                    const subtotal = unit * det.cantidad
                    return (
                      <div key={det.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{det.producto_nombre}{det.variacion_nombre && <span className='text-gray-400'> ({det.variacion_nombre})</span>}</span>
                          {det.sku && <span className="text-xs text-gray-500 mt-0.5">SKU: {det.sku}</span>}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">x{det.cantidad}</p>
                          <p className="font-medium text-gray-900">{formatCurrency(unit)}</p>
                          <p className="text-xs text-gray-600">{formatCurrency(subtotal)}</p>
                        </div>
                      </div>
                    )
                  })}
                  {!order.detalles.length && <div className="p-4 bg-gray-50 border border-gray-200 rounded text-sm text-gray-500">Sin artículos</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
