"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Credenciales fijas para el admin único
  const ADMIN_CREDENTIALS = {
    email: 'admin@romanaebanisteria.com',
    password: 'admin123'
  }

  // Verificar si ya está autenticado
  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('ebadmin_authenticated') === 'true'
      const adminEmail = localStorage.getItem('ebadmin_email')

      if (isAuthenticated && adminEmail === ADMIN_CREDENTIALS.email) {
        router.push('/ebadmin')
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Verificar credenciales fijas
      if (form.email === ADMIN_CREDENTIALS.email && form.password === ADMIN_CREDENTIALS.password) {
        // Guardar autenticación en localStorage
        localStorage.setItem('ebadmin_authenticated', 'true')
        localStorage.setItem('ebadmin_email', form.email)
        localStorage.setItem('ebadmin_login_time', new Date().toISOString())

        router.push('/ebadmin')
      } else {
        setError('Credenciales inválidas. Contacta al administrador del sistema.')
      }
    } catch (err) {
      setError('Error al iniciar sesión. Inténtalo nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login | La Fabbrica</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Admin La Fabbrica
            </h1>
            <p className="text-gray-600">
              Acceso al panel de administración
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  placeholder="admin@romanaebanisteria.com"
                />
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, email: ADMIN_CREDENTIALS.email })}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Usar email por defecto
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, password: ADMIN_CREDENTIALS.password })}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Usar contraseña por defecto
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    Iniciar sesión
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              ¿Olvidaste tu contraseña?{' '}
              <button className="text-primary hover:underline font-medium">
                Contacta al administrador
              </button>
            </p>

            <div className="border-t border-gray-200 pt-4">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-4"
              >
                ← Volver al sitio web
              </Link>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-2">Credenciales de Admin</p>
                <div className="space-y-1 text-blue-700">
                  <p><strong>Email:</strong> admin@romanaebanisteria.com</p>
                  <p><strong>Contraseña:</strong> admin123</p>
                </div>
                <p className="text-blue-700 mt-2 text-xs">
                  Estas son las credenciales únicas del sistema. Si necesitas cambiarlas, contacta al desarrollador.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
