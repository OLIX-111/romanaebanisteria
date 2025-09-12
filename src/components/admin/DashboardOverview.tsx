"use client"

import { useEffect, useState } from 'react'
import {
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  avgOrderValue: number
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    avgOrderValue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos - en producción vendrían de la API
    const loadDashboardData = async () => {
      try {
        // Aquí iría la llamada a la API
        // const response = await fetch('/api/admin/dashboard')
        // const data = await response.json()

        // Datos simulados
        setStats({
          totalOrders: 127,
          totalRevenue: 2847500,
          pendingOrders: 8,
          processingOrders: 23,
          shippedOrders: 15,
          deliveredOrders: 78,
          cancelledOrders: 3,
          avgOrderValue: 22402
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Órdenes',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'blue',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Ingresos Totales',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'green',
      change: '+18%',
      changeType: 'positive'
    },
    {
      title: 'Valor Promedio',
      value: formatCurrency(stats.avgOrderValue),
      icon: TrendingUp,
      color: 'purple',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Órdenes Pendientes',
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: 'orange',
      change: '-2',
      changeType: 'negative'
    }
  ]

  const orderStatusCards = [
    {
      title: 'En Proceso',
      value: stats.processingOrders,
      icon: Package,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Enviadas',
      value: stats.shippedOrders,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Entregadas',
      value: stats.deliveredOrders,
      icon: CheckCircle,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    {
      title: 'Canceladas',
      value: stats.cancelledOrders,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Resumen general de Romana Ebanistería
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

      {/* Order Status Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Estado de Órdenes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {orderStatusCards.map((status, index) => {
            const Icon = status.icon
            return (
              <div key={index} className={`${status.bgColor} rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-5 h-5 ${status.textColor}`} />
                  <span className="text-2xl font-bold text-gray-900">{status.value}</span>
                </div>
                <p className={`text-sm font-medium ${status.textColor}`}>{status.title}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Actividad Reciente</h2>
        <div className="space-y-4">
          {[
            {
              action: 'Nueva orden creada',
              order: 'ORD-2024001-00001',
              customer: 'María Rodríguez',
              time: 'Hace 5 minutos',
              type: 'order'
            },
            {
              action: 'Estado actualizado',
              order: 'ORD-2024001-00002',
              customer: 'Juan Pérez',
              time: 'Hace 15 minutos',
              type: 'status'
            },
            {
              action: 'Pago confirmado',
              order: 'ORD-2024001-00003',
              customer: 'Ana García',
              time: 'Hace 30 minutos',
              type: 'payment'
            },
            {
              action: 'Orden enviada',
              order: 'ORD-2024001-00004',
              customer: 'Carlos López',
              time: 'Hace 1 hora',
              type: 'shipping'
            }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'order' ? 'bg-blue-500' :
                  activity.type === 'status' ? 'bg-green-500' :
                  activity.type === 'payment' ? 'bg-yellow-500' : 'bg-purple-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    {activity.order} • {activity.customer}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
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
