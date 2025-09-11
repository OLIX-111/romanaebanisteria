"use client"
import Head from "next/head"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", password2: "", nombre: "", telefono: "" })
  const { register, loading: authLoading, error: authError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isEmailValid = useMemo(() => /.+@.+\..+/.test(form.email), [form.email])
  const isPasswordValid = useMemo(() => form.password.trim().length >= 6, [form.password])
  const isPasswordMatch = useMemo(() => form.password && form.password === form.password2, [form.password, form.password2])
  const isNameValid = useMemo(() => form.nombre.trim().length >= 2, [form.nombre])
  const formValid = isEmailValid && isPasswordValid && isNameValid && isPasswordMatch

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid) return
    setSubmitting(true)
    setError(null)
    setMessage(null)
    try {
      await register({
        nombre: form.nombre,
        correo: form.email,
        password: form.password,
        password_confirmation: form.password2,
        telefono: form.telefono || undefined
      })
      try { localStorage.setItem('romana_flash', 'Cuenta creada. ¡Bienvenido!') } catch {}
      window.location.href = "/profile"
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
                  aria-invalid={!isNameValid}
                  aria-describedby="name-help"
                />
                {!isNameValid && form.nombre && (
                  <p id="name-help" className="text-[12px] text-red-600">Ingresa tu nombre (mínimo 2 caracteres).</p>
                )}
              </div>
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
                <label className="text-sm font-medium text-slate-700">Teléfono (opcional)</label>
                <input
                  className="w-full border border-slate-200 rounded-sm px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                  placeholder="+1 809 555 0000"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Confirmar contraseña</label>
                <input
                  type="password"
                  className="w-full border border-slate-200 rounded-sm px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                  placeholder="Repite la contraseña"
                  value={form.password2}
                  onChange={(e) => setForm({ ...form, password2: e.target.value })}
                  aria-invalid={!isPasswordMatch}
                  aria-describedby="pass2-help"
                />
                {!isPasswordMatch && form.password2 && (
                  <p id="pass2-help" className="text-[12px] text-red-600">Las contraseñas no coinciden.</p>
                )}
              </div>

              {(error || authError) && <div className="text-sm text-red-600">{error || authError}</div>}
              {message && <div className="text-sm text-emerald-700">{message}</div>}

              <button
                type="submit"
                disabled={submitting || !formValid}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold tracking-tight disabled:opacity-50 hover:bg-slate-800 transition-colors rounded-sm"
              >
                {submitting || authLoading ? "Creando..." : "Crear cuenta"}
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


