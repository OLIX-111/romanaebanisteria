import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminAuth } from '@/components/admin/useAdminAuth'
import { fetchAdminServiceRequestById, AdminServiceRequestItem } from '@/lib/serviceRequestsAdmin'
import { ArrowLeft, RefreshCw, AlertTriangle, Mail, Phone, Factory, MapPin, Calendar } from 'lucide-react'

function EstadoBadge({ estado }: { estado: string }) {
  const m = estado?.toLowerCase()
  let color = '#6b7280', label = estado || 'Desconocido'
  switch(m){
    case 'pendiente': color = '#f59e0b'; label = 'Pendiente'; break
    case 'en_proceso': color = '#2563eb'; label = 'En proceso'; break
    case 'completado': color = '#16a34a'; label = 'Completado'; break
    case 'cancelado': color = '#dc2626'; label = 'Cancelado'; break
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{backgroundColor: color+'25', color}}>{label}</span>
}

function LoadingSkeleton(){
  return (
    <div className="space-y-6">
      <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_,i)=>(<div key={i} className="h-24 bg-gray-100 rounded animate-pulse"/>))}
      </div>
      <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
      <div className="h-64 bg-gray-100 rounded animate-pulse" />
    </div>
  )
}

export default function AdminServiceRequestDetailPage(){
  const router = useRouter()
  const { id } = router.query as { id?: string }
  const { loading: authLoading, isAdmin, user } = useAdminAuth()
  const [item, setItem] = useState<AdminServiceRequestItem | null>(null)
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

  async function load(rid: string){
    setLoading(true); setError(null)
    try {
      const resp = await fetchAdminServiceRequestById(rid)
      setItem(resp.data)
    } catch(e:any){
      console.error('Error cargando solicitud', e)
      setError(e.message || 'No se pudo cargar la solicitud')
    } finally { setLoading(false) }
  }

  useEffect(()=> { if(id) load(id) }, [id])

  if(authLoading){
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"/><p className="text-gray-600">Verificando credenciales...</p></div></div>
  }
  if(!isAdmin) return null

  return (
    <>
      <Head><title>Solicitud {item?.id || id} | Romana Admin</title></Head>
      <AdminLayout activeTab="services" onTabChange={handleTabChange} user={user}>
        <div className="mb-6 flex items-center gap-4">
          <button onClick={()=> router.push('/ebadmin/services/requests')} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><ArrowLeft size={18}/> Volver</button>
          {item && <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">Solicitud de Servicio</h1>}
        </div>

        {loading && <LoadingSkeleton />}
        {!loading && error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5"/>
            <div>
              <p className="font-semibold">Error</p>
              <p>{error}</p>
              <button onClick={()=> id && load(id)} className="mt-2 inline-flex items-center gap-1 text-xs underline"><RefreshCw size={14}/> Reintentar</button>
            </div>
          </div>
        )}
        {!loading && !error && !item && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">No se encontró la solicitud.</div>
        )}
        {!loading && !error && item && (
          <div className="space-y-10">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-1">Estado</p>
                <EstadoBadge estado={item.estado} />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-1">Fecha deseada</p>
                <p className="text-sm font-medium text-gray-900">{item.fecha_deseada || '-'}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-1">Creada</p>
                <p className="text-sm font-medium text-gray-900">{new Date(item.created_at).toLocaleString('es-DO')}</p>
              </div>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                {/* Contacto */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h2 className="text-sm font-semibold text-gray-800 mb-4">Contacto</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5"/>
                      <div>
                        <p className="font-medium text-gray-900">{item.contacto?.nombre_completo}</p>
                        <p className="text-gray-600">{item.contacto?.correo}</p>
                        <p className="text-gray-600">{item.contacto?.telefono}</p>
                        {item.contacto?.empresa && <p className="text-gray-600 text-xs mt-1">Empresa: {item.contacto.empresa}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dirección */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h2 className="text-sm font-semibold text-gray-800 mb-4">Dirección</h2>
                  <div className="space-y-2 text-sm">
                    {item.direccion ? (
                      <>
                        <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gray-400 mt-0.5"/> <span>{item.direccion.calle}</span></p>
                        <p className="text-gray-600 text-xs">Sector: {item.direccion.sector} · {item.direccion.estado} · CP {item.direccion.codigo_postal}</p>
                      </>
                    ) : <p className="text-gray-600 text-xs">Sin dirección registrada</p>}
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-8">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h2 className="text-sm font-semibold text-gray-800 mb-4">Servicio</h2>
                  <p className="font-medium text-gray-900 mb-2">{item.nombre_servicio}</p>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">{item.descripcion_proyecto}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
