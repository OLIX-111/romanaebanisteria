"use client"
import Head from "next/head"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useState } from "react"
import { supabase } from "@/utils/supabase"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", nombre: "" })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setMessage(null)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { nombre: form.nombre },
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/store` : undefined,
        },
      })
      if (error) {
        setError(error.message)
        return
      }
      if (data?.user) {
        setMessage("Registro exitoso. Revisa tu correo para confirmar la cuenta.")
      } else {
        setMessage("Revisa tu correo para confirmar la cuenta.")
      }
    } catch (e: any) {
      setError(e?.message || "No se pudo completar el registro")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={openSans.className}>
      <Head>
        <title>Crear cuenta | Romana Ebanistería</title>
      </Head>
      <Header />

      <div className="min-h-screen bg-slate-50/30">
        <div className="max-w-xl mx-auto px-6 pt-32 pb-24">
          <nav className="mb-10 text-sm text-slate-500">
            <Link href="/store" className="hover:text-slate-800">Tienda</Link>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">Crear cuenta</span>
          </nav>

          <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm p-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Crear cuenta</h1>
            <p className="text-slate-600 mb-8">Regístrate para dar seguimiento a tus pedidos y acceder a beneficios.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nombre</label>
                <input
                  className="w-full border border-slate-200 rounded-sm px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                  placeholder="Tu nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Correo</label>
                <input
                  type="email"
                  className="w-full border border-slate-200 rounded-sm px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Contraseña</label>
                <input
                  type="password"
                  className="w-full border border-slate-200 rounded-sm px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}
              {message && <div className="text-sm text-emerald-700">{message}</div>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold tracking-tight disabled:opacity-50 hover:bg-slate-800 transition-colors rounded-sm"
              >
                {submitting ? "Creando..." : "Crear cuenta"}
              </button>
            </form>

            <p className="text-sm text-slate-600 mt-6">
              ¿Ya tienes cuenta? <Link href="/login" className="text-slate-900 font-semibold hover:underline">Inicia sesión</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}


