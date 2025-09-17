import { useRouter } from 'next/router'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminAuth } from '@/components/admin/useAdminAuth'
import { fetchAdminOrderById } from '@/lib/orders'
import { ArrowLeft, Package, User, MapPin, AlertTriangle, RefreshCw } from 'lucide-react'
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
  estado: string
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
  reclamada: boolean
  order_number: number
  tracking_number: string
  items_count: number
  created_at: string
  detalles: CrmOrderDetail[]
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

export default function AdminOrderDetailPage() {
  const router = useRouter()
  const { id } = router.query as { id?: string }
  const { loading: authLoading, isAdmin, user } = useAdminAuth()
  const [order, setOrder] = useState<CrmOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => router.push('/ebadmin/orders')} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft size={18} /> Volver
          </button>
          {order && <h1 className="text-2xl font-bold text-gray-900">Orden #{order.order_number}</h1>}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-[11px] font-medium uppercase text-gray-500">Estado</p>
                <div className="mt-1"><StatusBadge estado={order.estado} /></div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-[11px] font-medium uppercase text-gray-500">Creada</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{new Date(order.created_at).toLocaleString('es-DO')}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-[11px] font-medium uppercase text-gray-500">Total</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(Number(order.monto_total||0))}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-[11px] font-medium uppercase text-gray-500">Artículos</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{order.items_count}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><User size={18} />Contacto</h2>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm space-y-1">
                    {order.contacto ? (
                      <>
                        <p className="font-medium text-gray-900">{order.contacto.nombre} {order.contacto.apellido}</p>
                        <p className="text-gray-600">{order.contacto.correo}</p>
                        <p className="text-gray-600">{order.contacto.telefono}</p>
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
