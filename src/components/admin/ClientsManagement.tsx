"use client"

import { useEffect, useState, useCallback } from 'react'
import {
  Search,
  Filter,
  Eye,
  Edit,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  MoreHorizontal,
  Plus
} from 'lucide-react'
import { useRouter } from 'next/router'
import { fetchAdminUsers, AdminUserListItem } from '@/lib/users'

// Interfaces para los tipos de datos de clientes
interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  createdAt: string
  totalOrders: number
  totalSpent: number
  lastOrderDate?: string
  status: 'active' | 'inactive'
}

// Datos simulados de clientes
const mockClients: Client[] = [
  {
    id: 'client-001',
    firstName: 'María',
    lastName: 'Rodríguez',
    email: 'maria.rodriguez@email.com',
    phone: '(809) 555-0123',
    address: 'Calle Principal 123, Bella Vista',
    city: 'Santiago',
    province: 'Santiago',
    postalCode: '51000',
    createdAt: '2024-01-15T10:00:00Z',
    totalOrders: 3,
    totalSpent: 183220,
    lastOrderDate: '2024-01-20T14:30:00Z',
    status: 'active'
  },
  {
    id: 'client-002',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    phone: '(809) 555-0456',
    address: 'Av. Independencia 456, Centro',
    city: 'Santo Domingo',
    province: 'Distrito Nacional',
    postalCode: '10204',
    createdAt: '2024-01-20T14:30:00Z',
    totalOrders: 1,
    totalSpent: 77900,
    lastOrderDate: '2024-01-22T09:15:00Z',
    status: 'active'
  },
  {
    id: 'client-003',
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana.garcia@email.com',
    phone: '(809) 555-0789',
    address: 'Calle Duarte 789, Villa Mella',
    city: 'Santo Domingo',
    province: 'Distrito Nacional',
    postalCode: '10601',
    createdAt: '2024-01-25T09:15:00Z',
    totalOrders: 2,
    totalSpent: 21096,
    lastOrderDate: '2024-01-25T16:45:00Z',
    status: 'active'
  },
  {
    id: 'client-004',
    firstName: 'Carlos',
    lastName: 'López',
    email: 'carlos.lopez@email.com',
    phone: '(809) 555-0321',
    address: 'Calle Restauración 321, Gazcue',
    city: 'Santo Domingo',
    province: 'Distrito Nacional',
    postalCode: '10203',
    createdAt: '2023-12-10T11:20:00Z',
    totalOrders: 5,
    totalSpent: 450000,
    lastOrderDate: '2024-01-18T13:00:00Z',
    status: 'active'
  },
  {
    id: 'client-005',
    firstName: 'Sofia',
    lastName: 'Martínez',
    email: 'sofia.martinez@email.com',
    phone: '(809) 555-0654',
    address: 'Av. Abraham Lincoln 654, Piantini',
    city: 'Santo Domingo',
    province: 'Distrito Nacional',
    postalCode: '10148',
    createdAt: '2023-11-05T08:30:00Z',
    totalOrders: 0,
    totalSpent: 0,
    status: 'inactive'
  }
]

export default function ClientsManagement() {
  const router = useRouter()
  // real data state
  const [users, setUsers] = useState<AdminUserListItem[]>([])
  const [page, setPage] = useState(1)
  const [perPage] = useState(20)
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // debounce search
  useEffect(()=>{ const h = setTimeout(()=> setDebouncedSearch(searchTerm), 450); return ()=> clearTimeout(h)}, [searchTerm])

  const load = useCallback(async ()=> {
    setLoading(true); setError(null)
    try {
      const resp = await fetchAdminUsers({ page, per_page: perPage, busqueda: debouncedSearch || undefined })
      setUsers(resp.data)
      setTotal(resp.meta.pagination.total)
      setLastPage(resp.meta.pagination.last_page)
    } catch(e:any){
      console.error('Error cargando usuarios', e)
      setError(e.message || 'No se pudo cargar usuarios')
    } finally { setLoading(false) }
  }, [page, perPage, debouncedSearch])

  useEffect(()=> { load() }, [load])

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-DO',{style:'currency',currency:'DOP'}).format(amount)

  const handleRowClick = (id: string) => router.push(`/ebadmin/clients/${id}`)

  // simplified active/inactive derived from orders for now
  const activeCount = users.filter(u => u.ordenes > 0).length
  const totalSpent = users.reduce((sum,u)=> sum + (u.total_gastado||0),0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">
            Administra la información de tus clientes
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Total Clientes</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Con Órdenes</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Promedio por Cliente</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(total ? totalSpent/total : 0)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e)=> { setSearchTerm(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button onClick={()=> load()} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50">Recargar</button>
          </div>
        </div>
        {(debouncedSearch) && (
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              Búsqueda: &quot;{debouncedSearch}&quot;
              <button onClick={()=> { setSearchTerm(''); setDebouncedSearch('') }} className="hover:text-gray-900">×</button>
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Órdenes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Gastado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Orden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  Cargando clientes...
                </td></tr>)}
              {!loading && !error && users.map(u => {
                const initials = u.cliente.split(' ').slice(0,2).map(p=> p.charAt(0).toUpperCase()).join('')
                return (
                  <tr key={u.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=> handleRowClick(u.id)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-semibold text-sm">{initials}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{u.cliente}</div>
                          <div className="text-sm text-gray-500">Desde {u.fecha_creacion}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{u.contacto.email}</div>
                      <div className="text-sm text-gray-500">{u.contacto.telefono || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.ordenes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(u.total_gastado)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.ultima_orden || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><span className="text-gray-400 text-xs">Ver detalle →</span></td>
                  </tr>
                )
              })}
              {!loading && !error && users.length===0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">Sin clientes</td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={6} className="px-6 py-6 text-center text-sm text-red-600">{error}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 text-sm">
          <div className="text-gray-600">Página {page} de {lastPage} • {total} clientes</div>
          <div className="flex items-center gap-2">
            <button disabled={page<=1 || loading} onClick={()=> setPage(p=> p-1)} className="px-3 py-1.5 border rounded disabled:opacity-40">Anterior</button>
            <button disabled={page>=lastPage || loading} onClick={()=> setPage(p=> p+1)} className="px-3 py-1.5 border rounded disabled:opacity-40">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para el modal de detalle de cliente
interface ClientDetailModalProps {
  client: Client
  onClose: () => void
}

function ClientDetailModal({ client, onClose }: ClientDetailModalProps) {
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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-xl">
                    {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {client.firstName} {client.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      client.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {client.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className="text-sm text-gray-500">
                      Cliente desde {new Date(client.createdAt).toLocaleDateString('es-DO')}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Información de Contacto</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-gray-400" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-gray-400" />
                    <span className="text-sm">{client.phone}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-gray-400 mt-0.5" />
                    <div className="text-sm">
                      <div>{client.address}</div>
                      <div className="text-gray-500">{client.city}, {client.province}</div>
                      <div className="text-gray-500">{client.postalCode}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Estadísticas</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total de Órdenes:</span>
                    <span className="font-medium">{client.totalOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Gastado:</span>
                    <span className="font-medium">{formatCurrency(client.totalSpent)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Promedio por Orden:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        client.totalOrders > 0 ? client.totalSpent / client.totalOrders : 0
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Última Orden:</span>
                    <span className="font-medium">
                      {client.lastOrderDate
                        ? new Date(client.lastOrderDate).toLocaleDateString('es-DO')
                        : 'Sin órdenes'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-4">Órdenes Recientes</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center text-gray-500">
                  <Package size={24} className="mx-auto mb-2" />
                  <p className="text-sm">Vista de órdenes próximamente disponible</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cerrar
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <Edit size={18} className="mr-2" />
              Editar Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
