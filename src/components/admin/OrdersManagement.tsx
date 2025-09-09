"use client"

import { useEffect, useState } from 'react'
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

// Importar los tipos y datos de órdenes
interface Order {
  id: string
  orderNumber: string
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    province: string
    postalCode: string
  }
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    image?: string
  }>
  totals: {
    subtotal: number
    tax: number
    shipping: number
    grandTotal: number
  }
  status: {
    id: string
    name: string
    generalStatus: string
    color: string
    icon: string
  }
  createdAt: string
  estimatedDelivery?: string
  actualDelivery?: string
  assignedTo?: string
  department?: string
  priority: string
  source: string
}

// Estados disponibles para las órdenes
const ORDER_STATUSES = [
  { id: 'quote_requested', name: 'Cotización Solicitada', color: '#6B7280', generalStatus: 'pending', icon: 'FileText' },
  { id: 'quote_sent', name: 'Cotización Enviada', color: '#3B82F6', generalStatus: 'pending', icon: 'Send' },
  { id: 'awaiting_approval', name: 'Esperando Aprobación', color: '#F59E0B', generalStatus: 'pending', icon: 'Clock' },
  { id: 'confirmed', name: 'Pedido Confirmado', color: '#10B981', generalStatus: 'processing', icon: 'CheckCircle' },
  { id: 'deposit_paid', name: 'Depósito Pagado', color: '#059669', generalStatus: 'processing', icon: 'DollarSign' },
  { id: 'design_phase', name: 'Fase de Diseño', color: '#6366F1', generalStatus: 'processing', icon: 'Palette' },
  { id: 'material_preparation', name: 'Preparación de Materiales', color: '#8B5CF6', generalStatus: 'processing', icon: 'Package' },
  { id: 'cutting_wood', name: 'Cortando Madera', color: '#EC4899', generalStatus: 'processing', icon: 'Scissors' },
  { id: 'woodworking', name: 'Ebanistería', color: '#F97316', generalStatus: 'processing', icon: 'Hammer' },
  { id: 'assembling', name: 'Ensamblando', color: '#06B6D4', generalStatus: 'processing', icon: 'Settings' },
  { id: 'finishing', name: 'Acabando', color: '#10B981', generalStatus: 'processing', icon: 'Brush' },
  { id: 'quality_check', name: 'Control de Calidad', color: '#F59E0B', generalStatus: 'processing', icon: 'CheckSquare' },
  { id: 'ready_for_shipping', name: 'Listo para Envío', color: '#84CC16', generalStatus: 'shipped', icon: 'Truck' },
  { id: 'in_transit', name: 'En Tránsito', color: '#22C55E', generalStatus: 'shipped', icon: 'MapPin' },
  { id: 'delivered', name: 'Entregado', color: '#16A34A', generalStatus: 'delivered', icon: 'CheckCircle' },
  { id: 'installation_complete', name: 'Instalación Completa', color: '#15803D', generalStatus: 'delivered', icon: 'Home' },
  { id: 'cancelled_by_customer', name: 'Cancelado por Cliente', color: '#DC2626', generalStatus: 'cancelled', icon: 'XCircle' },
  { id: 'cancelled_by_admin', name: 'Cancelado por Admin', color: '#B91C1C', generalStatus: 'cancelled', icon: 'XCircle' },
  { id: 'return_requested', name: 'Devolución Solicitada', color: '#7C3AED', generalStatus: 'processing', icon: 'RotateCcw' },
  { id: 'refunded', name: 'Reembolsado', color: '#0891B2', generalStatus: 'refunded', icon: 'RefreshCw' }
]

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  // Filtros
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    department: '',
    assignedTo: '',
    dateRange: 'all'
  })

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, filters, searchTerm])

  const loadOrders = async () => {
    try {
      // En producción, esto vendría de la API
      // const response = await fetch('/api/orders')
      // const data = await response.json()

      // Datos simulados basados en el sistema existente
      const mockOrders: Order[] = [
        {
          id: 'ord-2024-001',
          orderNumber: 'ORD-2024001-00001',
          customer: {
            firstName: 'María',
            lastName: 'Rodríguez',
            email: 'maria.rodriguez@email.com',
            phone: '(809) 555-0123',
            address: 'Calle Principal 123, Bella Vista',
            city: 'Santiago',
            province: 'Santiago',
            postalCode: '51000'
          },
          items: [
            {
              id: 'item-1',
              name: 'Mesa de Comedor Moderna Premium - 8 personas',
              quantity: 1,
              price: 42000
            },
            {
              id: 'item-2',
              name: 'Silla Ejecutiva de Cuero - Negro',
              quantity: 8,
              price: 12500
            }
          ],
          totals: {
            subtotal: 154000,
            tax: 27720,
            shipping: 1500,
            grandTotal: 183220
          },
          status: ORDER_STATUSES[15], // Entregado
          createdAt: '2024-01-15T10:00:00Z',
          estimatedDelivery: '2024-02-15T10:00:00Z',
          actualDelivery: '2024-02-12T15:30:00Z',
          assignedTo: 'Carlos Artesano',
          department: 'produccion',
          priority: 'high',
          source: 'website'
        },
        {
          id: 'ord-2024-002',
          orderNumber: 'ORD-2024001-00002',
          customer: {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan.perez@email.com',
            phone: '(809) 555-0456',
            address: 'Av. Independencia 456, Centro',
            city: 'Santo Domingo',
            province: 'Distrito Nacional',
            postalCode: '10204'
          },
          items: [
            {
              id: 'item-3',
              name: 'Closet Empotrado Premium - 3 puertas',
              quantity: 1,
              price: 65000
            }
          ],
          totals: {
            subtotal: 65000,
            tax: 11700,
            shipping: 1200,
            grandTotal: 77900
          },
          status: ORDER_STATUSES[9], // Ebanistería
          createdAt: '2024-01-20T14:30:00Z',
          estimatedDelivery: '2024-02-20T10:00:00Z',
          assignedTo: 'Ana Diseñadora',
          department: 'produccion',
          priority: 'normal',
          source: 'phone'
        },
        {
          id: 'ord-2024-003',
          orderNumber: 'ORD-2024001-00003',
          customer: {
            firstName: 'Ana',
            lastName: 'García',
            email: 'ana.garcia@email.com',
            phone: '(809) 555-0789',
            address: 'Calle Duarte 789, Villa Mella',
            city: 'Santo Domingo',
            province: 'Distrito Nacional',
            postalCode: '10601'
          },
          items: [
            {
              id: 'item-4',
              name: 'Vanity de Baño Minimalista - 80cm',
              quantity: 1,
              price: 17200
            }
          ],
          totals: {
            subtotal: 17200,
            tax: 3096,
            shipping: 800,
            grandTotal: 21096
          },
          status: ORDER_STATUSES[2], // Esperando Aprobación
          createdAt: '2024-01-25T09:15:00Z',
          estimatedDelivery: '2024-02-25T10:00:00Z',
          priority: 'normal',
          source: 'website'
        }
      ]

      setOrders(mockOrders)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por estado
    if (filters.status) {
      filtered = filtered.filter(order => order.status.id === filters.status)
    }

    // Filtro por prioridad
    if (filters.priority) {
      filtered = filtered.filter(order => order.priority === filters.priority)
    }

    // Filtro por departamento
    if (filters.department) {
      filtered = filtered.filter(order => order.department === filters.department)
    }

    // Filtro por fecha
    if (filters.dateRange !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          startDate = new Date(0)
      }

      filtered = filtered.filter(order =>
        new Date(order.createdAt) >= startDate
      )
    }

    setFilteredOrders(filtered)
  }

  const handleStatusChange = async (orderId: string, newStatusId: string) => {
    try {
      // En producción: llamada a API
      // await fetch(`/api/orders/${orderId}/status`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ statusId: newStatusId })
      // })

      // Actualizar localmente
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: ORDER_STATUSES.find(s => s.id === newStatusId) || order.status }
            : order
        )
      )

      // Mostrar notificación de éxito
      alert(`Estado actualizado exitosamente`)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al actualizar el estado')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount)
  }

  const getStatusBadge = (status: Order['status']) => {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
        style={{
          backgroundColor: status.color + '20',
          color: status.color
        }}
      >
        <span>{status.name}</span>
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
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Package size={18} />
            Nueva Orden
          </button>
        </div>
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
              {ORDER_STATUSES.map(status => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
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
              <option value="">Todas las prioridades</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
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
                  Prioridad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.source}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.customer.firstName} {order.customer.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(order.totals.grandTotal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('es-DO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      order.priority === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : order.priority === 'high'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowOrderDetail(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={18} />
                      </button>
                      <select
                        value={order.status.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        {ORDER_STATUSES.map(status => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
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
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setShowOrderDetail(false)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}

// Componente para el modal de detalle de orden
interface OrderDetailModalProps {
  order: Order
  onClose: () => void
  onStatusChange: (orderId: string, statusId: string) => void
}

function OrderDetailModal({ order, onClose, onStatusChange }: OrderDetailModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Orden {order.orderNumber}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Información del Cliente</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-gray-400" />
                    <span className="font-medium">
                      {order.customer.firstName} {order.customer.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-gray-400" />
                    <span className="text-sm">{order.customer.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-gray-400" />
                    <span className="text-sm">{order.customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-gray-400" />
                    <span className="text-sm">
                      {order.customer.address}, {order.customer.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Status & Actions */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Estado de la Orden</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado actual:</span>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: order.status.color + '20',
                        color: order.status.color
                      }}
                    >
                      {order.status.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Prioridad:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.priority === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : order.priority === 'high'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.priority}
                    </span>
                  </div>
                  {order.assignedTo && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Asignado a:</span>
                      <span className="text-sm font-medium">{order.assignedTo}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cambiar Estado
                    </label>
                    <select
                      value={order.status.id}
                      onChange={(e) => onStatusChange(order.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    >
                      {ORDER_STATUSES.map(status => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-4">Productos</h4>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Cantidad: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Totals */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ITBIS (18%):</span>
                  <span>{formatCurrency(order.totals.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío:</span>
                  <span>{formatCurrency(order.totals.shipping)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>{formatCurrency(order.totals.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Order Dates */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={18} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Creada</span>
                </div>
                <p className="text-sm text-blue-700">
                  {new Date(order.createdAt).toLocaleDateString('es-DO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {order.estimatedDelivery && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck size={18} className="text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">Entrega Estimada</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    {new Date(order.estimatedDelivery).toLocaleDateString('es-DO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {order.actualDelivery && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={18} className="text-green-600" />
                    <span className="text-sm font-medium text-green-900">Entregada</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {new Date(order.actualDelivery).toLocaleDateString('es-DO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cerrar
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <Download size={18} className="mr-2" />
              Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
