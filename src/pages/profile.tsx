"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { fetchOrders } from '@/lib/orders'

const openSans = Open_Sans({ subsets: ["latin"] })

export default function ProfilePage() {
  const router = useRouter()
  const [flash, setFlash] = useState<string | null>(null)
  const { user, loading, error, logout, refreshUser, token } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user && !error) {
      // Not authenticated -> redirect
      router.replace('/login?returnTo=/profile')
    }
  }, [loading, user, error, router])

  // Optionally could trigger refresh on mount
  useEffect(() => { if (user) refreshUser() }, [])

  // Fetch orders when user & token available
  useEffect(() => {
    let active = true
    async function load() {
      if (!user || !token) return
      setOrdersLoading(true)
      setOrdersError(null)
      try {
        const resp = await fetchOrders(token)
        if (!active) return
        setOrders(resp.data || [])
      } catch (e:any) {
        if (!active) return
        setOrdersError(e?.message || 'No se pudieron cargar las órdenes')
      } finally {
        if (active) setOrdersLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [user, token])

  // Read and clear flash message from localStorage
  useEffect(() => {
    try {
      const f = localStorage.getItem('romana_flash')
      if (f) {
        setFlash(f)
        localStorage.removeItem('romana_flash')
      }
    } catch {}
  }, [])

  if (loading) return <div className="mt-24 text-center">Cargando...</div>

  if (error) {
    return (
      <main className={openSans.className}>
        <Header />
        <div className="container mx-auto mt-24 px-4 py-12 lg:px-8">
          <div className="mb-6 p-3 border border-red-300 bg-red-50 text-red-800 text-sm">{error}</div>
          <button
            onClick={() => router.replace('/login?returnTo=/profile')}
            className="px-4 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800"
          >Ir a iniciar sesión</button>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className={openSans.className}>
      <Header />
      <div className="container mx-auto mt-24 px-4 py-12 lg:px-8">
        {flash && (
          <div className="mb-6 p-3 border border-emerald-300 bg-emerald-50 text-emerald-800 text-sm">
            {flash}
          </div>
        )}
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Mi perfil</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="border border-gray-200 p-6">
            <h2 className="text-sm font-semibold tracking-wide text-gray-800">Sesión</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-700 sm:grid-cols-2">
              <div className="border border-gray-200 p-4"><span className="text-gray-500">Email</span><div className="mt-1 font-medium">{user?.correo}</div></div>
              <div className="border border-gray-200 p-4"><span className="text-gray-500">Nombre</span><div className="mt-1 font-medium">{user?.nombre || '—'}</div></div>
            </div>
            <div className="mt-4">
              <button
                onClick={async () => { logout(); router.push('/') }}
                className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50"
              >Cerrar sesión</button>
            </div>
          </section>
        </div>

        <section className="mt-8 border border-gray-200 p-6">
          <h2 className="text-sm font-semibold tracking-wide text-gray-800 mb-4">Órdenes recientes</h2>
          {ordersLoading ? (
            <p className="text-sm text-gray-600">Cargando órdenes...</p>
          ) : ordersError ? (
            <p className="text-sm text-red-600">{ordersError}</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-gray-600">No hay órdenes registradas aún.</p>
          ) : (
            <div className="overflow-hidden border border-gray-200 divide-y">
              {orders.map(o => (
                <div key={o.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">Orden #{o.order_number || o.id.slice(0,8)}</p>
                    <p className="text-gray-600">{new Date(o.created_at).toLocaleString('es-DO')}</p>
                    <p className="text-xs text-gray-500 mt-1">Estado: <span className="font-medium text-gray-700">{o.estado}</span></p>
                  </div>
                  <div className="text-gray-900 font-semibold whitespace-nowrap">{Number(o.monto_total||0).toLocaleString('es-DO',{ style:'currency', currency:'DOP' })}</div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex items-center gap-4">
            <Link href="/store" className="inline-block px-4 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800">Seguir comprando</Link>
            <button
              onClick={() => {
                if (!token) return
                setOrdersLoading(true)
                fetchOrders(token).then(r=> setOrders(r.data||[])).catch(e=> setOrdersError(e?.message||'Error refrescando')).finally(()=> setOrdersLoading(false))
              }}
              className="text-xs px-3 py-2 border border-gray-300 hover:bg-gray-50"
            >Refrescar</button>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}


