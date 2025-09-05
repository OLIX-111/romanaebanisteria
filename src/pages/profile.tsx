"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { supabase } from "@/utils/supabase"
import Link from "next/link"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])

  // Require login via Supabase
  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      if (!data?.user) {
        router.replace("/login?returnTo=/profile")
        return
      }
      setUser(data.user)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) {
        router.replace("/login?returnTo=/profile")
      } else {
        setUser(session.user)
      }
    })
    return () => { mounted = false; sub?.subscription.unsubscribe() }
  }, [router])

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        // Load optional profile info via existing API if available
        try {
          const ns = localStorage.getItem('falitech_user_ns')
          if (ns) {
            const res = await fetch(`/api/ecommerce/subscriber-info?user_ns=${encodeURIComponent(ns)}`)
            const json = await res.json()
            setInfo(json?.data || null)
          }
        } catch {}

        // Load recent orders from local snapshot for now
        try {
          const snapRaw = localStorage.getItem('cardnet_order_snapshot')
          if (snapRaw) {
            const snap = JSON.parse(snapRaw)
            setOrders([{ id: snap.orderId, total: snap.totals?.grandTotal, createdAt: snap.createdAt }])
          } else {
            setOrders([])
          }
        } catch { setOrders([]) }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) return <div className="mt-24 text-center">Cargando...</div>

  return (
    <main className={openSans.className}>
      <Header />
      <div className="container mx-auto mt-24 px-4 py-12 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Mi perfil</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="border border-gray-200 p-6">
            <h2 className="text-sm font-semibold tracking-wide text-gray-800">Sesión</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-700 sm:grid-cols-2">
              <div className="border border-gray-200 p-4"><span className="text-gray-500">Email</span><div className="mt-1 font-medium">{user?.email}</div></div>
              <div className="border border-gray-200 p-4"><span className="text-gray-500">Nombre</span><div className="mt-1 font-medium">{user?.user_metadata?.nombre || '—'}</div></div>
            </div>
            <div className="mt-4">
              <button
                onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
                className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50"
              >Cerrar sesión</button>
            </div>
          </section>
        </div>

        <section className="mt-8 border border-gray-200 p-6">
          <h2 className="text-sm font-semibold tracking-wide text-gray-800 mb-4">Órdenes recientes</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-600">No hay órdenes registradas aún.</p>
          ) : (
            <div className="divide-y border border-gray-200">
              {orders.map(o => (
                <div key={o.id} className="p-4 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Pedido {o.id}</p>
                    <p className="text-gray-600">{new Date(o.createdAt).toLocaleString('es-DO')}</p>
                  </div>
                  <div className="text-gray-900 font-semibold">{Number(o.total||0).toLocaleString('es-DO',{ style:'currency', currency:'DOP' })}</div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link href="/store" className="inline-block px-4 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800">Seguir comprando</Link>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}


