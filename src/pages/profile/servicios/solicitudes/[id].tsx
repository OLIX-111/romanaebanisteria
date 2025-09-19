"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, Clock, AlertTriangle, MapPin, User as UserIcon, Calendar } from 'lucide-react'
import { useAuth } from "@/context/AuthContext"
import { fetchUserServiceRequestById, UserServiceRequestDetail } from "@/lib/serviceRequests"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function ServiceRequestDetailPage() {
  const router = useRouter()
  const { id } = router.query as { id?: string }
  const { token, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [item, setItem] = useState<UserServiceRequestDetail | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      if (!id) return
      if (!token) { setError('Debes iniciar sesión para ver esta solicitud.'); setLoading(false); return }
      setLoading(true)
      setError(null)
      try {
        const resp = await fetchUserServiceRequestById(id, token)
        if (!active) return
        setItem(resp.data)
      } catch (e: any) {
        if (!active) return
        const status = e?.response?.status ?? e?.status
        const msg = e?.message || 'No se pudo cargar la solicitud'
        setError(status === 404 ? 'Solicitud no encontrada' : msg)
      } finally {
        if (active) setLoading(false)
      }
    }
    if (!authLoading) load()
    return () => { active = false }
  }, [id, token, authLoading])

  return (
    <main className={openSans.className}>
      <Header />
      <div className="container mx-auto mt-24 px-4 py-12 lg:px-8">
        <div className="mb-6">
          <Link href="/profile" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Volver al perfil
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Cargando solicitud...</div>
        ) : error ? (
          <div className="p-4 border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        ) : item ? (
          <div className="space-y-6">
            {/* Header card with prominent status */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="px-6 py-5 bg-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">Solicitud {item.numero_servicio}</h1>
                    <p className="text-sm text-gray-600 mt-1">Creada: {new Date(item.created_at).toLocaleString('es-DO')}</p>
                  </div>
                  <div>
                    {(() => {
                      const map: Record<string, string> = {
                        pendiente: 'bg-amber-100 text-amber-800',
                        en_proceso: 'bg-blue-100 text-blue-700',
                        completado: 'bg-emerald-100 text-emerald-700',
                        cancelado: 'bg-rose-100 text-rose-700',
                      }
                      const cls = map[item.estado] || 'bg-gray-200 text-gray-700'
                      const Icon = item.estado === 'completado' ? CheckCircle : item.estado === 'pendiente' ? Clock : item.estado === 'cancelado' ? AlertTriangle : Clock
                      const label = item.estado.replace('_', ' ')
                      return (
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium ${cls}`}>
                          <Icon className="w-4 h-4" /> {label}
                        </span>
                      )
                    })()}
                  </div>
                </div>
              </div>
              {/* Key info bar */}
              <div className="grid gap-4 md:grid-cols-3 border-t border-gray-100 bg-gray-50 px-6 py-4 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">Fecha deseada</p>
                    <p className="font-medium text-gray-900">{item.fecha_deseada ? new Date(item.fecha_deseada).toLocaleDateString('es-DO') : '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UserIcon className="w-4 h-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">Contacto</p>
                    <p className="font-medium text-gray-900">{item.contacto?.nombre_completo}</p>
                    <p className="text-gray-700">{item.contacto?.correo} · {item.contacto?.telefono}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">Dirección</p>
                    {item.direccion ? (
                      <p className="font-medium text-gray-900">
                        {item.direccion.calle}, {item.direccion.sector}, {item.direccion.estado} {item.direccion.codigo_postal}
                      </p>
                    ) : (
                      <p className="text-gray-700">—</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Service and description */}
            <div className="border border-gray-200 rounded-md p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Servicio</p>
                  <p className="font-medium text-gray-900">{item.nombre_servicio}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Descripción del proyecto</p>
                  <p className="text-gray-800 mt-1 whitespace-pre-wrap">{item.descripcion_proyecto || '—'}</p>
                </div>
              </div>
            </div>

            {/* Timeline / Progress */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-800">Historial de estados</h2>
              </div>
              {item.historial_estados && item.historial_estados.length > 0 ? (
                <ol className="divide-y divide-gray-100">
                  {item.historial_estados.map((h, idx) => (
                    <li key={h.id} className="p-4 text-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className={`mt-0.5 inline-flex h-2.5 w-2.5 rounded-full ${h.estado === 'completado' ? 'bg-emerald-500' : h.estado === 'pendiente' ? 'bg-amber-500' : h.estado === 'cancelado' ? 'bg-rose-500' : 'bg-blue-500'}`}/>
                          <div>
                            <p className="font-medium text-gray-900 capitalize">{h.estado.replace('_',' ')}</p>
                            {h.nota && <p className="text-gray-700">{h.nota}</p>}
                            {h.usuario?.nombre && <p className="text-xs text-gray-500">Por: {h.usuario.nombre}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{new Date(h.fecha_cambio).toLocaleString('es-DO')}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="p-4 text-sm text-gray-600">Sin historial disponible.</div>
              )}
            </div>
          </div>
        ) : null}
      </div>
      <Footer />
    </main>
  )
}
