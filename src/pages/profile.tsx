"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function ProfilePage() {
  const router = useRouter()
  const [userNs, setUserNs] = useState<string | null>(null)
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Require login
  useEffect(() => {
    const ns = localStorage.getItem("falitech_user_ns")
    if (!ns) {
      router.replace("/login?returnTo=/profile")
      return
    }
    setUserNs(ns)
  }, [router])

  useEffect(() => {
    async function fetchInfo() {
      if (!userNs) return
      try {
        const res = await fetch(`/api/ecommerce/subscriber-info?user_ns=${encodeURIComponent(userNs)}`)
        const json = await res.json()
        setInfo(json?.data || null)
      } finally {
        setLoading(false)
      }
    }
    fetchInfo()
  }, [userNs])

  if (loading) return <div className="mt-24 text-center">Cargando...</div>

  return (
    <main className={openSans.className}>
      <Header />
      <div className="container mx-auto mt-24 px-4 py-12 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Mi perfil</h1>
        {!info ? (
          <p className="mt-4 text-sm text-gray-600">No se encontró información del usuario.</p>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <section className="border border-gray-200 p-6">
              <h2 className="text-sm font-semibold tracking-wide text-gray-800">Información personal</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-700 sm:grid-cols-2">
                <div className="border border-gray-200 p-4"><span className="text-gray-500">Nombre</span><div className="mt-1 font-medium">{info.first_name} {info.last_name}</div></div>
                <div className="border border-gray-200 p-4"><span className="text-gray-500">Email</span><div className="mt-1 font-medium">{info.email || "—"}</div></div>
                <div className="border border-gray-200 p-4"><span className="text-gray-500">Teléfono</span><div className="mt-1 font-medium">{info.phone || "—"}</div></div>
                <div className="border border-gray-200 p-4"><span className="text-gray-500">Género</span><div className="mt-1 font-medium">{info.gender || "—"}</div></div>
              </div>
            </section>
            <section className="border border-gray-200 p-6">
              <h2 className="text-sm font-semibold tracking-wide text-gray-800">Dirección</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-700 sm:grid-cols-2">
                <div className="border border-gray-200 p-4"><span className="text-gray-500">Dirección</span><div className="mt-1 font-medium">{info.address || "—"}</div></div>
                <div className="border border-gray-200 p-4"><span className="text-gray-500">Sector</span><div className="mt-1 font-medium">{info.suburb || "—"}</div></div>
                <div className="border border-gray-200 p-4"><span className="text-gray-500">Provincia/Estado</span><div className="mt-1 font-medium">{info.state || "—"}</div></div>
                <div className="border border-gray-200 p-4"><span className="text-gray-500">Código Postal</span><div className="mt-1 font-medium">{info.postcode || "—"}</div></div>
                <div className="border border-gray-200 p-4"><span className="text-gray-500">País</span><div className="mt-1 font-medium">{info.country || "—"}</div></div>
              </div>
            </section>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}


