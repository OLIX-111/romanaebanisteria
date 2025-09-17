import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminAuth } from '@/components/admin/useAdminAuth'
import { fetchAdminUserById, AdminUserDetailResponse } from '@/lib/users'
import { getOrderStatusInfo } from '@/utils/orderStatus'
import { ArrowLeft, User, Package, Mail, Phone, Calendar, Copy, RefreshCw } from 'lucide-react'

interface ClientOrderRowProps {
  order: AdminUserDetailResponse['data']['ordenes'][number]
  onNavigate: (id: string) => void
}

function StatusBadge({ estado }: { estado: string }) {
  const info = getOrderStatusInfo(estado)
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{backgroundColor: info.color + '20', color: info.color}}>{info.label}</span>
}

function ClientOrderRow({ order, onNavigate }: ClientOrderRowProps) {
  return (
    <tr onClick={() => onNavigate(order.id_orden)} className="cursor-pointer hover:bg-gray-50">
      <td className="px-4 py-2 font-medium text-gray-900">#{order.numero_orden}</td>
      <td className="px-4 py-2 text-gray-600"><StatusBadge estado={order.estado} /></td>
      <td className="px-4 py-2 text-gray-600 text-right">{new Date(order.fecha_orden_raw).toLocaleString('es-DO')}</td>
      <td className="px-4 py-2 text-gray-900 font-medium text-right">{formatCurrency(order.monto_total)}</td>
      <td className="px-4 py-2 text-gray-600 text-xs">{order.tracking_number}</td>
    </tr>
  )
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP'}).format(amount)
}

export default function AdminClientDetailPage() {
  const router = useRouter()
  const { id } = router.query as { id?: string }
  const { loading: authLoading, isAdmin, user } = useAdminAuth()
  const [data, setData] = useState<AdminUserDetailResponse['data'] | null>(null)
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

  const load = async (uid: string) => {
    try {
      setLoading(true); setError(null)
      const resp = await fetchAdminUserById(uid)
      setData(resp.data)
    } catch (e: any) {
      console.error('Error cargando cliente', e)
      setError(e.message || 'No se pudo cargar el cliente')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ if(id) load(id) },[id])

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
  if(!isAdmin) return null

  const usuario = data?.usuario

  return (
    <>
      <Head><title>Cliente {usuario?.nombre || id} | Romana Admin</title></Head>
      <AdminLayout activeTab="clients" onTabChange={handleTabChange} user={user}>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/ebadmin/clients')} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft size={18}/> Volver
            </button>
            {usuario && (
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><User size={20}/> {usuario.nombre}</h1>
                <div className="text-xs text-gray-500 flex flex-wrap gap-3">
                  <span>ID: <code className="font-mono">{usuario.id.slice(0,8)}…</code></span>
                  <span>Creado: {new Date(usuario.fecha_creacion_raw).toLocaleString('es-DO')}</span>
                  <span>Tipo: {usuario.tipo_usuario}</span>
                </div>
              </div>
            )}
          </div>
          {usuario && (
            <button onClick={()=> load(usuario.id)} className="inline-flex items-center gap-1 text-xs px-3 py-2 bg-primary text-white rounded hover:bg-primary/90"><RefreshCw size={14}/> Refrescar</button>
          )}
        </div>

        {loading && (
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_,i)=>(<div key={i} className="h-24 bg-gray-100 rounded animate-pulse"/>))}
            </div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-64 bg-gray-100 rounded animate-pulse" />
          </div>
        )}

        {!loading && error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
            <button onClick={()=> id && load(id)} className="mt-2 text-xs underline">Reintentar</button>
          </div>
        )}

        {!loading && !error && usuario && (
          <div className="space-y-10">
            {/* Summary stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-[11px] font-medium uppercase text-gray-500">Total Órdenes</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{usuario.estadisticas?.total_ordenes ?? 0}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-[11px] font-medium uppercase text-gray-500">Total Gastado</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{formatCurrency(usuario.estadisticas?.total_gastado || 0)}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-[11px] font-medium uppercase text-gray-500">Orden más reciente</p>
                <p className="text-xs font-medium text-gray-700 mt-1">{usuario.estadisticas?.orden_mas_reciente || '—'}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-[11px] font-medium uppercase text-gray-500">Orden más antigua</p>
                <p className="text-xs font-medium text-gray-700 mt-1">{usuario.estadisticas?.orden_mas_antigua || '—'}</p>
              </div>
            </div>

            {/* Contact info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-8 col-span-1 lg:col-span-1">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><User size={18}/>Datos del Cliente</h2>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm space-y-2">
                    <p className="font-medium text-gray-900 flex items-center gap-2"><Mail size={14}/> {usuario.email}</p>
                    <p className="text-gray-600 flex items-center gap-2"><Phone size={14}/> {usuario.telefono || '—'}</p>
                    <p className="text-gray-600 flex items-center gap-2"><Calendar size={14}/> Registrado: {new Date(usuario.fecha_creacion_raw).toLocaleDateString('es-DO')}</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><Package size={18}/> Órdenes</h2>
                <div className="overflow-hidden border border-gray-200 rounded-lg bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                      <tr className="text-left">
                        <th className="px-4 py-2 font-medium">Orden</th>
                        <th className="px-4 py-2 font-medium">Estado</th>
                        <th className="px-4 py-2 font-medium text-right">Fecha</th>
                        <th className="px-4 py-2 font-medium text-right">Total</th>
                        <th className="px-4 py-2 font-medium">Tracking</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data?.ordenes?.map(o => (<ClientOrderRow key={o.id_orden} order={o} onNavigate={(oid)=> router.push(`/ebadmin/orders/${oid}`)} />))}
                      {!data?.ordenes?.length && (
                        <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">Sin órdenes</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
