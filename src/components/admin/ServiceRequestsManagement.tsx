import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { fetchAdminServiceRequests, AdminServiceRequestItem } from '@/lib/serviceRequestsAdmin'
import { RefreshCw, Search, Filter, Calendar, AlertTriangle } from 'lucide-react'

interface PaginationState {
  page: number
  per_page: number
}

const ESTADO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'completado', label: 'Completado' },
  { value: 'cancelado', label: 'Cancelado' }
]

function formatDate(dateStr?: string) {
  if(!dateStr) return '-'
  try { return new Date(dateStr).toLocaleString('es-DO') } catch { return dateStr }
}

export default function ServiceRequestsManagement() {
  const router = useRouter()
  const [items, setItems] = useState<AdminServiceRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, per_page: 20, total: 0, last_page: 1 })
  const [estado, setEstado] = useState<string>('')
  const [fechaDesde, setFechaDesde] = useState<string>('')
  const [fechaHasta, setFechaHasta] = useState<string>('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  // Debounce search
  useEffect(()=>{ const t = setTimeout(()=> setDebouncedSearch(search.trim().toLowerCase()), 450); return ()=> clearTimeout(t) }, [search])

  async function load(page = 1) {
    setLoading(true); setError(null)
    try {
      const resp = await fetchAdminServiceRequests({ page, per_page: pagination.per_page, estado: estado || null, fecha_desde: fechaDesde || null, fecha_hasta: fechaHasta || null })
      setItems(resp.data)
      // meta may have pagination structure
      const meta: any = resp.meta || {}
      const pag = meta.pagination || meta
      setPagination({ page: pag.current_page || page, per_page: pag.per_page || pagination.per_page, total: pag.total || resp.data.length, last_page: pag.last_page || 1 })
    } catch(e:any) {
      console.error('Error cargando solicitudes', e)
      setError(e.message || 'No se pudieron cargar las solicitudes')
    } finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(()=>{ load(1) // eslint-disable-next-line
  }, [estado, fechaDesde, fechaHasta])

  // Client-side filter for search (API lacks busqueda param per sample)
  const filtered = useMemo(()=>{
    if(!debouncedSearch) return items
    return items.filter(it => {
      const haystack = `${it.contacto?.nombre_completo || ''} ${it.contacto?.correo || ''} ${it.nombre_servicio}`.toLowerCase()
      return haystack.includes(debouncedSearch)
    })
  }, [items, debouncedSearch])

  function handleRefresh() {
    setRefreshing(true)
    load(pagination.page)
  }

  function clearFilters() {
    setEstado('')
    setFechaDesde('')
    setFechaHasta('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Servicios</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center gap-1 text-xs px-3 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"><RefreshCw size={14} className={refreshing? 'animate-spin':''}/> Refrescar</button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Buscar</label>
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e=> setSearch(e.target.value)} placeholder="Nombre, correo o servicio" className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
            <select value={estado} onChange={e=> setEstado(e.target.value)} className="w-full text-sm border-gray-300 rounded focus:ring-primary focus:border-primary py-2">
              {ESTADO_OPTIONS.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha desde</label>
            <input type="date" value={fechaDesde} onChange={e=> setFechaDesde(e.target.value)} className="w-full text-sm border-gray-300 rounded focus:ring-primary focus:border-primary py-2" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha hasta</label>
            <input type="date" value={fechaHasta} onChange={e=> setFechaHasta(e.target.value)} className="w-full text-sm border-gray-300 rounded focus:ring-primary focus:border-primary py-2" />
          </div>
          <div className="flex items-end">
            <button onClick={clearFilters} className="w-full inline-flex items-center justify-center gap-1 text-xs px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"><Filter size={14}/> Limpiar</button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Servicio</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Contacto</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Estado</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Fecha deseada</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Creada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading && (
                <tr><td colSpan={5} className="py-10 text-center text-gray-500 text-sm">Cargando solicitudes...</td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={5} className="p-6">
                  <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Error</p>
                      <p>{error}</p>
                      <button onClick={()=> load(pagination.page)} className="mt-2 text-xs underline">Reintentar</button>
                    </div>
                  </div>
                </td></tr>
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-gray-500 text-sm">No hay solicitudes.</td></tr>
              )}
              {!loading && !error && filtered.map(item => (
                <tr key={item.id} onClick={()=> router.push(`/ebadmin/services/requests/${item.id}`)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-2 font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span>{item.nombre_servicio}</span>
                      <span className="text-xs text-gray-500 line-clamp-1 max-w-[300px]">{item.descripcion_proyecto}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{item.contacto?.nombre_completo}</span>
                      <span className="text-xs text-gray-500">{item.contacto?.correo}</span>
                      <span className="text-xs text-gray-500">{item.contacto?.telefono}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <EstadoBadge estado={item.estado} />
                  </td>
                  <td className="px-4 py-2 text-gray-700">{item.fecha_deseada || '-'}</td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{formatDate(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-xs text-gray-600">
          <div>
            Página {pagination.page} de {pagination.last_page} · {pagination.total} registros
          </div>
          <div className="flex items-center gap-2">
            <button disabled={pagination.page <= 1 || loading} onClick={()=> { if(pagination.page>1) load(pagination.page - 1) }} className="px-2 py-1 border border-gray-300 rounded disabled:opacity-40">Anterior</button>
            <button disabled={pagination.page >= pagination.last_page || loading} onClick={()=> { if(pagination.page < pagination.last_page) load(pagination.page + 1) }} className="px-2 py-1 border border-gray-300 rounded disabled:opacity-40">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const info = mapEstado(estado)
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: info.color + '25', color: info.color }}>{info.label}</span>
}

function mapEstado(raw: string) {
  const v = raw?.toLowerCase()
  switch(v) {
    case 'pendiente': return { label: 'Pendiente', color: '#f59e0b' }
    case 'en_proceso': return { label: 'En proceso', color: '#2563eb' }
    case 'completado': return { label: 'Completado', color: '#16a34a' }
    case 'cancelado': return { label: 'Cancelado', color: '#dc2626' }
    default: return { label: raw || 'Desconocido', color: '#6b7280' }
  }
}
