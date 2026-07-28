"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, CheckCircle, AlertTriangle, Clock, Truck } from 'lucide-react'
import { fetchOrderAdmin } from '@/lib/orders'
import { getOrderStatusInfo } from '@/utils/orderStatus'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingApproval: number
  created: number
  processing: number
  inTransit: number
  delivered: number
  cancelled: number
  avgOrderValue: number
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingApproval: 0,
    created: 0,
    processing: 0,
    inTransit: 0,
    delivered: 0,
    cancelled: 0,
    avgOrderValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    // Simular carga de datos - en producción vendrían de la API
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetchOrderAdmin()
        const list = response.data || []
        setOrders(list as any[])

        // Helpers
        const toNumber = (v: string | number) => {
          if (typeof v === 'number') return v
          const parsed = parseFloat(v)
          return isNaN(parsed) ? 0 : parsed
        }

        const totalOrders = list.length
        const totalRevenue = list.reduce((acc: number, o: any) => acc + toNumber(o.monto_total), 0)
        const statusCounts = list.reduce((acc: Record<string, number>, o: any) => {
          const info = getOrderStatusInfo(o.estado)
          acc[info.code] = (acc[info.code] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0

        setStats({
          totalOrders,
          totalRevenue,
          pendingApproval: statusCounts['pending_approval'] || 0,
          created: statusCounts['created'] || 0,
          processing: statusCounts['processing'] || 0,
          inTransit: statusCounts['in_transit'] || 0,
          delivered: statusCounts['delivered'] || 0,
          cancelled: statusCounts['cancelled'] || 0,
          avgOrderValue
        })
      } catch (err: any) {
        console.error('Error loading dashboard data:', err)
        setError(err?.message || 'Error cargando datos')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount)
  }

  const loadingSkeleton = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-3 w-1/2" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
        </div>
      ))}
    </div>
  )

  const orderStatusCards = [
    { title: 'Pendiente aprobación', value: stats.pendingApproval, icon: Clock, bgColor: 'bg-gray-50/20', textColor: 'text-gray-700' },
    { title: 'Orden creada', value: stats.created, icon: Package, bgColor: 'bg-orange-50/20', textColor: 'text-gray-700' },
    { title: 'En proceso', value: stats.processing, icon: Package, bgColor: 'bg-orange-50/50', textColor: 'text-gray-800' },
    { title: 'En tránsito', value: stats.inTransit, icon: Truck, bgColor: 'bg-orange-50/80', textColor: 'text-gray-800' },
    { title: 'Entregado', value: stats.delivered, icon: CheckCircle, bgColor: 'bg-orange-100/90', textColor: 'text-gray-800' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Resumen general de La Fabbrica
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Última actualización: {new Date().toLocaleTimeString('es-DO')}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
              </div>
            </div>
          )
        })}
      </div> */}

      {/* Overview / Error */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Resumen de Órdenes</h2>
          {loading && <span className="text-xs text-gray-500 animate-pulse">Actualizando...</span>}
        </div>
        {error && (
          <div className="mb-6 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <div>
              <p className="font-medium">No se pudieron cargar las órdenes</p>
              <p>{error}</p>
              <button
                onClick={() => {
                  setLoading(true); setError(null); (async()=>{ await new Promise(r=>setTimeout(r,150)); const resp= await fetchOrderAdmin().catch(e=>{setError(e?.message||'Error'); return null}); if(resp){ setOrders(resp.data||[]); } setLoading(false) })()}}
                className="mt-2 text-xs underline"
              >Reintentar</button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
            <p className="text-xs font-medium text-gray-500">Órdenes Totales</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
            <p className="text-xs font-medium text-gray-500">Ingresos Totales</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
            <p className="text-xs font-medium text-gray-500">Ticket Promedio</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.avgOrderValue)}</p>
          </div>
        </div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Estados</h3>
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {orderStatusCards.map((status, index) => {
            const Icon = status.icon
            return (
              <div key={index} className={`${status.bgColor} rounded-md p-3 flex flex-col gap-2 border border-gray-100`}>
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${status.textColor}`} />
                  <span className="text-lg font-semibold text-gray-900">{status.value}</span>
                </div>
                <p className={`text-[11px] font-medium ${status.textColor} uppercase tracking-wide`}>{status.title}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Orders (compact) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Órdenes Recientes</h2>
          <div className="flex items-center gap-3">
            {loading && <span className="text-xs text-gray-400">Cargando...</span>}
              <Link
                href="/ebadmin/orders"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >Ver todas</Link>
          </div>
        </div>
        {loading && loadingSkeleton}
        {!loading && orders.length === 0 && !error && (
          <p className="text-sm text-gray-500">No hay órdenes disponibles.</p>
        )}
        {!loading && orders.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {orders
              .slice()
              .sort((a:any,b:any)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0,5)
              .map((o:any) => {
                const fecha = new Date(o.created_at)
                const ahora = Date.now()
                const diffMs = Math.max(0, ahora - fecha.getTime())
                const diffMin = Math.floor(diffMs/60000)
                const diffHr = Math.floor(diffMin/60)
                const diffDay = Math.floor(diffHr/24)
                const relative = diffMin < 60 ? `${diffMin}m` : diffHr < 24 ? `${diffHr}h` : `${diffDay}d`
                return (
                  <li
                    key={o.id}
                    onClick={() => { window.location.href = `/ebadmin/orders/${o.id}` }}
                    className="group flex items-center gap-4 py-3 px-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col min-w-[64px]">
                      <span className="text-sm font-semibold text-gray-900 leading-none">#{o.order_number}</span>
                      <span className="text-[11px] text-gray-500 mt-1 font-mono" title={fecha.toLocaleString('es-DO')}>{relative}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{o.contacto?.nombre} {o.contacto?.apellido}</p>
                      <p className="text-xs text-gray-500 truncate font-mono">{o.tracking_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(parseFloat(o.monto_total||'0'))}</p>
                      <p className="text-[11px] text-gray-500">{(o.estado||'').toLowerCase()}</p>
                    </div>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">→</span>
                  </li>
                )
              })}
          </ul>
        )}
      </div>

      {/* Quick Actions */}
      {/* <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Package className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Nueva Orden</p>
              <p className="text-sm text-gray-500">Crear orden manual</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Clientes</p>
              <p className="text-sm text-gray-500">Gestionar clientes</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Reportes</p>
              <p className="text-sm text-gray-500">Ver estadísticas</p>
            </div>
          </button>
        </div>
      </div> */}
    </div>
  )
}
