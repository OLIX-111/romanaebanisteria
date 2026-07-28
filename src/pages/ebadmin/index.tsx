import Head from 'next/head'
import { useAdminAuth } from '@/components/admin/useAdminAuth'
import AdminLayout from '@/components/admin/AdminLayout'
import DashboardOverview from '@/components/admin/DashboardOverview'

export default function AdminDashboardHome() {
  const { loading, isAdmin, user } = useAdminAuth()

  const handleTabChange = (tab: 'dashboard' | 'orders' | 'clients' | 'services') => {
    switch (tab) {
      case 'dashboard': window.location.href = '/ebadmin'; break
      case 'orders': window.location.href = '/ebadmin/orders'; break
      case 'clients': window.location.href = '/ebadmin/clients'; break
      case 'services': window.location.href = '/ebadmin/services/requests'; break
    }
  }

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
  if (!isAdmin) return null

  return (
    <>
      <Head>
        <title>Admin Dashboard | La Fabbrica</title>
      </Head>
      <AdminLayout activeTab="dashboard" onTabChange={handleTabChange} user={user}>
        <DashboardOverview />
      </AdminLayout>
    </>
  )
}

