import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminAuth } from '@/components/admin/useAdminAuth'
import { fetchAdminServiceRequestById, AdminServiceRequestItem, updateServiceRequestEstado } from '@/lib/serviceRequestsAdmin'
import { ArrowLeft, RefreshCw, AlertTriangle, Mail, MapPin, Clock } from 'lucide-react'

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
  const [updating, setUpdating] = useState(false)
  const [newEstado, setNewEstado] = useState<string>('')
  const [nota, setNota] = useState<string>('')
  const [updateMessage, setUpdateMessage] = useState<string | null>(null)

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
  useEffect(()=> { if(item){ setNewEstado(item.estado) } }, [item])

  async function handleUpdateEstado(){
    if(!id || !newEstado) return
    setUpdating(true); setUpdateMessage(null)
    try {
      const resp = await updateServiceRequestEstado(id, { estado: newEstado, nota: nota || undefined })
      setUpdateMessage(resp.message)
      // refrescar detalle
      await load(id)
      setNota('')
    } catch(e:any){
      setUpdateMessage(e.message || 'Error actualizando estado')
    } finally { setUpdating(false) }
  }

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
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-1">Estado</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <EstadoBadge estado={item.estado} />
                </div>
                <div className="mt-3 space-y-2">
                  <label className="block">
                    <span className="text-[11px] font-medium text-gray-600 uppercase tracking-wide">Actualizar Estado</span>
                    <select
                      className="mt-1 w-full border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                      value={newEstado}
                      disabled={updating}
                      onChange={e=> setNewEstado(e.target.value)}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En proceso</option>
                      <option value="completado">Completado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-medium text-gray-600 uppercase tracking-wide">Nota (opcional)</span>
                    <textarea
                      className="mt-1 w-full border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary resize-none"
                      rows={3}
                      placeholder="Descripción del cambio..."
                      value={nota}
                      disabled={updating}
                      onChange={e=> setNota(e.target.value)}
                    />
                  </label>
                  <button
                    onClick={handleUpdateEstado}
                    disabled={updating || !newEstado || newEstado === item.estado}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-white text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {updating && <span className="inline-block h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                    Guardar Cambio
                  </button>
                  {updateMessage && (
                    <p className="text-[11px] text-gray-600 mt-1">{updateMessage}</p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-8">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h2 className="text-sm font-semibold text-gray-800 mb-4">Servicio</h2>
                  <p className="font-medium text-gray-900 mb-2">{item.nombre_servicio}</p>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">{item.descripcion_proyecto}</div>
                </div>
                {/* Historial de estados */}
                {item.historial_estados && item.historial_estados.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-500"/> Historial de Estados</h2>
                    <ol className="relative border-l border-gray-200 ml-2">
                      {item.historial_estados
                        .slice()
                        .sort((a,b)=> new Date(a.fecha_cambio).getTime() - new Date(b.fecha_cambio).getTime())
                        .map(h => {
                          const m = h.estado.toLowerCase()
                          let color = 'gray'
                          switch(m){
                            case 'pendiente': color = 'amber'; break
                            case 'en_proceso': color = 'blue'; break
                            case 'completado': color = 'green'; break
                            case 'cancelado': color = 'red'; break
                          }
                          const dotClass = {
                            amber: 'bg-amber-500',
                            blue: 'bg-blue-500',
                            green: 'bg-green-500',
                            red: 'bg-red-500',
                            gray: 'bg-gray-400'
                          }[color]
                          return (
                            <li key={h.id} className="ml-4 mb-6">
                              <div className={`absolute -left-1.5 mt-1 w-3 h-3 rounded-full border-2 border-white ${dotClass}`}/>
                              <div className="flex flex-col gap-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">{h.estado.replace('_',' ')}</span>
                                  <span className="text-[10px] text-gray-500">{new Date(h.fecha_cambio).toLocaleString('es-DO')}</span>
                                </div>
                                {h.nota && <p className="text-xs text-gray-700 whitespace-pre-line">{h.nota}</p>}
                                {h.usuario && <p className="text-[10px] text-gray-500">Por: {h.usuario.nombre}</p>}
                              </div>
                            </li>
                          )
                        })}
                    </ol>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
