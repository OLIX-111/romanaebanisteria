"use client"

import { useEffect, useState } from 'react'
import { fetchOrderAdmin } from '@/lib/orders'
import { getOrderStatusInfo, ORDER_STATUS_FILTERS } from '@/utils/orderStatus'
import {
  Search,
  Filter,
  Eye,
  Edit,
  MoreHorizontal,
  ChevronDown,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  Download,
  FileText,
  Send,
  Palette,
  Scissors,
  Hammer,
  Settings,
  Brush,
  CheckSquare,
  Home,
  XCircle,
  RotateCcw,
  RefreshCw,
  DollarSign
} from 'lucide-react'

// Order type adapted to CRM API shape
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
  order_number: string
  tracking_number: string
  items_count: number
  created_at: string
  detalles: CrmOrderDetail[]
}

// Estados ahora centralizados en utils/orderStatus.

export default function OrdersManagement() {
  const [orders, setOrders] = useState<CrmOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<CrmOrder[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<CrmOrder | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    department: '',
    assignedTo: '',
    dateRange: 'all'
  })

  useEffect(() => { loadOrders(currentPage) }, [currentPage])

  useEffect(() => {
    filterOrders()
  }, [orders, filters, searchTerm])

  const loadOrders = async (page: number = 1) => {
    setLoading(true); setError(null)
    try {
      const res = await fetchOrderAdmin(page)
      const list: CrmOrder[] = (res.data as any) || []
      setOrders(list)
      // meta pagination from API
      const meta = (res as any)?.meta || {}
      const pagination = meta.pagination || meta
      setTotalPages(Number(pagination?.last_page || 1))
      setTotalOrders(Number(pagination?.total || list.length))
    } catch (e: any) {
      console.error('Error loading orders:', e)
      setError(e?.message || 'No se pudieron cargar las órdenes')
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(o =>
        String(o.order_number).toLowerCase().includes(q) ||
        o.tracking_number.toLowerCase().includes(q) ||
        (o.contacto?.correo || '').toLowerCase().includes(q) ||
        (o.contacto?.nombre || '').toLowerCase().includes(q)
      )
    }
    if (filters.status) {
      filtered = filtered.filter(o => getOrderStatusInfo(o.estado).code === filters.status)
    }
    if (filters.dateRange !== 'all') {
      const now = new Date(); let start: Date
      switch (filters.dateRange) {
        case 'today': start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break
        case 'week': start = new Date(now.getTime() - 7*24*60*60*1000); break
        case 'month': start = new Date(now.getFullYear(), now.getMonth(), 1); break
        default: start = new Date(0)
      }
      filtered = filtered.filter(o => new Date(o.created_at) >= start)
    }
    // No paginar localmente: API entrega paginación. Sólo filtrado local sobre la página actual.
    setFilteredOrders(filtered)
  }

  const handleStatusChange = async (_orderId: string, _new: string) => {
    alert('Actualización de estado pendiente de implementación en API.')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount)
  }

  const getEstadoBadge = (estado: string) => {
    const info = getOrderStatusInfo(estado)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: info.color + '20', color: info.color }}>
        {info.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Órdenes</h1>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Órdenes</h1>
          <p className="text-gray-600 mt-1">
            Administra todas las órdenes de Romana Ebanistería
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => loadOrders(currentPage)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <RefreshCw size={18} />
            Refrescar
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 -mt-2">
  <span>Total: {totalOrders} órdenes</span>
  <span>Página {currentPage} de {totalPages}</span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número, cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="">Todos los estados</option>
              {ORDER_STATUS_FILTERS.map(s => (
                <option key={s.code} value={s.code}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="">Artículos</option>
              <option value="normal">Normal</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || value === 'all') return null
            return (
              <span
                key={key}
                className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {key}: {value}
                <button
                  onClick={() => setFilters({ ...filters, [key]: '' })}
                  className="hover:text-gray-900"
                >
                  <X size={14} />
                </button>
              </span>
            )
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artículos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    window.location.href = `/ebadmin/orders/${order.id}`
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                    <div className="text-sm text-gray-500">
                      {order.tracking_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.contacto ? (
                      <>
                        <div className="text-sm font-medium text-gray-900">{order.contacto.nombre} {order.contacto.apellido}</div>
                        <div className="text-sm text-gray-500">{order.contacto.correo}</div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 italic">Sin contacto</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getEstadoBadge(order.estado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(Number(order.monto_total||0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('es-DO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{order.items_count} Artículo(s)</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">Ver detalle →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se encontraron órdenes con los filtros aplicados.
            </p>
          </div>
        )}
        {/* Pagination */}
        {filteredOrders.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-sm">
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >Anterior</button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded border text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >Siguiente</button>
            </div>
            <div className="text-xs text-gray-500">Página {currentPage} de {totalPages} • Total {totalOrders}</div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <CrmOrderDetailModal
          order={selectedOrder}
          onClose={() => setShowOrderDetail(false)}
        />
      )}
    </div>
  )
}

// Componente para el modal de detalle de orden
interface CrmOrderDetailModalProps { order: CrmOrder; onClose: () => void }
function CrmOrderDetailModal({ order, onClose }: CrmOrderDetailModalProps) {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-DO',{style:'currency',currency:'DOP'}).format(amount)
  const badge = (estado: string) => {
    const info = getOrderStatusInfo(estado)
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{backgroundColor: info.color + '20', color: info.color}}>{info.label}</span>
  }
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500/70" onClick={onClose}></div>
        </div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Orden #{order.order_number}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Contacto</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  {order.contacto ? (
                    <>
                      <p className="font-medium text-gray-900">{order.contacto.nombre} {order.contacto.apellido}</p>
                      <p className="text-gray-600">{order.contacto.correo}</p>
                      <p className="text-gray-600">{order.contacto.telefono}</p>
                    </>
                  ) : <p className="italic text-gray-400">Sin contacto</p>}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Envío</h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
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
            <div className="mt-8">
              <h4 className="font-medium text-gray-900 mb-4">Artículos</h4>
              <div className="space-y-3">
                {order.detalles.map(d => {
                  const unit = Number(d.precio_unitario||0); const subtotal = unit * Number(d.cantidad||0)
                  return (
                    <div key={d.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{d.producto_nombre} {d.variacion_nombre && <span className='text-gray-400'>({d.variacion_nombre})</span>}</span>
                        {d.sku && <span className="text-xs text-gray-500 mt-0.5">SKU: {d.sku}</span>}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">x{d.cantidad}</p>
                        <p className="font-medium text-gray-900">{formatCurrency(unit)}</p>
                        <p className="text-xs text-gray-600">{formatCurrency(subtotal)}</p>
                      </div>
                    </div>
                  )
                })}
                {!order.detalles.length && <div className="p-4 bg-gray-50 rounded text-sm text-gray-500">Sin artículos</div>}
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-xs font-medium text-blue-900 mb-1">Creada</div>
                <div className="text-sm text-blue-700">{new Date(order.created_at).toLocaleString('es-DO')}</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="text-xs font-medium text-amber-900 mb-1">Estado</div>
                <div>{badge(order.estado)}</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="text-xs font-medium text-emerald-900 mb-1">Total</div>
                <div className="font-semibold text-emerald-700">{formatCurrency(Number(order.monto_total||0))}</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button onClick={onClose} className="w-full inline-flex justify-center rounded-md shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 sm:ml-3 sm:w-auto sm:text-sm">Cerrar</button>
            <button className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              <Download size={18} className="mr-2" /> Exportar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
