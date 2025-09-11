"use client"
import Head from "next/head"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/router"
import { loginUser, getAuth } from "@/lib/auth"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function LoginPage() {
  const router = useRouter()
  const returnTo = (router.query.returnTo as string) || "/store"
  const [form, setForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEmailValid = useMemo(() => /.+@.+\..+/.test(form.email), [form.email])
  const isPasswordValid = useMemo(() => form.password.trim().length >= 6, [form.password])
  const formValid = isEmailValid && isPasswordValid

  useEffect(() => {
    const auth = getAuth()
    if (auth?.user) router.replace(returnTo)
    try {
      const remembered = localStorage.getItem("romana_last_email")
      if (remembered) setForm((f) => ({ ...f, email: remembered }))
    } catch {}
  }, [returnTo, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid) return
    setSubmitting(true)
    setError(null)
    try {
      await loginUser({ correo: form.email, password: form.password })
      try {
        localStorage.setItem("romana_last_email", form.email)
        localStorage.setItem("romana_flash", "Has iniciado sesión correctamente.")
      } catch {}
      router.replace("/profile")
    } catch (e: any) {
      setError(e?.message || "No se pudo iniciar sesión")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={openSans.className}>
      <Head>
        <title>Iniciar sesión | Romana Ebanistería</title>
      </Head>
      <Header />

      <div className="min-h-screen bg-slate-50/30">
        <div className="max-w-4xl mx-auto px-6 pt-28 pb-24 grid md:grid-cols-2 gap-10">
          <nav className="mb-10 text-sm text-slate-500">
            <Link href="/store" className="hover:text-slate-800">Tienda</Link>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">Iniciar sesión</span>
          </nav>

          <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm p-8 md:col-span-1 order-2 md:order-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Bienvenido de nuevo</h1>
            <p className="text-slate-600 mb-8">Accede para continuar con tu compra y ver tus pedidos.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Correo</label>
                <input
                  type="email"
                  className="w-full border border-slate-200 rounded-sm px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  aria-invalid={!isEmailValid}
                  aria-describedby="email-help"
                />
                {!isEmailValid && form.email && (
                  <p id="email-help" className="text-[12px] text-red-600">Ingresa un correo válido.</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full border border-slate-200 rounded-sm px-4 py-3 pr-12 text-sm focus:border-slate-400 focus:outline-none"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    aria-invalid={!isPasswordValid}
                    aria-describedby="pass-help"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                {!isPasswordValid && form.password && (
                  <p id="pass-help" className="text-[12px] text-red-600">Mínimo 6 caracteres.</p>
                )}
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <button
                type="submit"
                disabled={submitting || !formValid}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold tracking-tight disabled:opacity-50 hover:bg-slate-800 transition-colors rounded-sm"
              >
                {submitting ? "Ingresando..." : "Iniciar sesión"}
              </button>
            </form>

            <p className="text-sm text-slate-600 mt-6">
              ¿No tienes cuenta? <Link href="/register" className="text-slate-900 font-semibold hover:underline">Crea una cuenta</Link>
            </p>
          </div>

          <aside className="order-1 md:order-2 bg-gradient-to-br from-primary/10 to-white border border-slate-200/60 p-8 rounded-lg">
            <h2 className="text-xl font-semibold text-slate-900">Beneficios de tu cuenta</h2>
            <ul className="mt-4 space-y-3 text-slate-700 text-sm">
              <li>• Seguimiento de pedidos y compras anteriores</li>
              <li>• Experiencia de compra más rápida</li>
              <li>• Ofertas y novedades personalizadas</li>
            </ul>
            <div className="mt-8 text-xs text-slate-500">
              Al continuar aceptas nuestros términos y políticas.
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  )
}


