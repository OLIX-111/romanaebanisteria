"use client"

import { useState } from "react"
import { Open_Sans } from "next/font/google"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { useRouter } from "next/router"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const returnTo = (router.query.returnTo as string) || "/store"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/ecommerce/subscriber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      const user_ns = data?.data?.user_ns
      if (!user_ns) throw new Error("No user_ns returned")
      localStorage.setItem("falitech_user_ns", String(user_ns))
      router.replace(returnTo)
    } catch (err: any) {
      setError(err.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={openSans.className}>
      <Header />
      <div className="container mx-auto mt-24 px-4 py-12 lg:px-8">
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Acceder</h1>
          <p className="mt-2 text-sm text-gray-600">Crea tu perfil para una compra rápida.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="text-xs text-gray-700">
                Nombre
                <input
                  type="text"
                  required
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </label>
              <label className="text-xs text-gray-700">
                Apellido
                <input
                  type="text"
                  required
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="text-xs text-gray-700">
                Email
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </label>
              <label className="text-xs text-gray-700">
                Teléfono
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="text-xs text-gray-700">
                Género
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  <option value="">Seleccionar</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                </select>
              </label>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex items-center gap-3">
              <button disabled={loading} className={`px-6 py-3 text-sm font-semibold text-white ${loading ? "bg-gray-400" : "bg-primary hover:bg-primary/90"} focus:outline-none focus:ring-2 focus:ring-primary/40`}>
                {loading ? "Creando..." : "Continuar"}
              </button>
              <span className="text-xs text-gray-500">Serás redirigido a {returnTo}</span>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </main>
  )
}


