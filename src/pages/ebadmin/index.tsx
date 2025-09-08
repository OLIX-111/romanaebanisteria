"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import AdminLayout from '@/components/admin/AdminLayout'
import DashboardOverview from '@/components/admin/DashboardOverview'
import OrdersManagement from '@/components/admin/OrdersManagement'
import ClientsManagement from '@/components/admin/ClientsManagement'

export default function AdminDashboard() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'clients'>('dashboard')
  const [user, setUser] = useState<any>(null)

  // Credenciales fijas para el admin único
  const ADMIN_CREDENTIALS = {
    email: 'admin@romanaebanisteria.com',
    password: 'admin123'
  }

  // Verificar autenticación de admin
  useEffect(() => {
    const checkAdminAuth = () => {
      try {
        const isAuthenticated = localStorage.getItem('ebadmin_authenticated') === 'true'
        const adminEmail = localStorage.getItem('ebadmin_email')
        const loginTime = localStorage.getItem('ebadmin_login_time')

        if (!isAuthenticated || adminEmail !== ADMIN_CREDENTIALS.email) {
          router.push('/ebadmin/login')
          return
        }

        // Verificar si la sesión ha expirado (24 horas)
        if (loginTime) {
          const loginDate = new Date(loginTime)
          const now = new Date()
          const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60)

          if (hoursDiff > 24) {
            // Sesión expirada, limpiar y redirigir
            localStorage.removeItem('ebadmin_authenticated')
            localStorage.removeItem('ebadmin_email')
            localStorage.removeItem('ebadmin_login_time')
            router.push('/ebadmin/login')
            return
          }
        }

        // Usuario admin válido
        setUser({
          email: adminEmail,
          user_metadata: { role: 'admin' },
          last_sign_in_at: loginTime
        })
        setIsAdmin(true)
      } catch (error) {
        console.error('Error checking admin auth:', error)
        router.push('/ebadmin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando credenciales...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Redirigirá automáticamente
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | Romana Ebanistería</title>
      </Head>

      <AdminLayout activeTab={activeTab} onTabChange={setActiveTab} user={user}>
        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'orders' && <OrdersManagement />}
        {activeTab === 'clients' && <ClientsManagement />}
      </AdminLayout>
    </>
  )
}
