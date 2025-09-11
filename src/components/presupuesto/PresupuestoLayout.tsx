"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import LeftColumn from "./LeftColumn"
import RightColumn from "./RightColumn"
import { usePresupuesto } from "./usePresupuesto"
import { useEffect, useState } from "react"

export default function PresupuestoLayout() {
  const {
    loading,
    error,
    search,
    setSearch,
    filteredProducts,
    addItem,
    selectedList,
    subtotal,
    tax,
    total,
    changeQty,
    removeItem,
    clearSelected,
    exportPDF,
  } = usePresupuesto()

  // Gate de acceso a cotización
  const [gateData, setGateData] = useState<null | {
    nombre: string
    numero: string
    email: string
    tipo?: string
    tipoDesarrollador?: boolean
    tipoCodia?: boolean
    empresa?: string
    website?: string
  codia?: string
  }>(null)
  // Control explícito del modal: si no hay gateData, se mostrará igual aunque esto sea false
  const [showGateModal, setShowGateModal] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    numero: '',
    email: '',
    tipoDesarrollador: false,
    tipoCodia: false,
    empresa: '',
    website: '',
  codia: '',
  })
  const [submitted, setSubmitted] = useState(false)

  // Cargar datos persistidos en primer render
  useEffect(() => {
    try {
      const raw = localStorage.getItem('presu_customer')
      if (raw) {
        const parsed = JSON.parse(raw)
        setGateData(parsed)
        // Prefill formulario
        setForm({
          nombre: parsed.nombre || '',
          numero: parsed.numero || '',
          email: parsed.email || '',
          tipoDesarrollador: Boolean(parsed.tipoDesarrollador) || (parsed.tipo === 'Desarrollador' || parsed.tipo === 'Desarrollador y Agente del codia'),
          tipoCodia: Boolean(parsed.tipoCodia) || (parsed.tipo === 'Agente del codia' || parsed.tipo === 'Desarrollador y Agente del codia'),
          empresa: parsed.empresa || '',
          website: parsed.website || '',
          codia: parsed.codia || '',
        })
      } else {
        // Si no hay datos, mostrar modal de entrada
        setShowGateModal(true)
      }
    } catch {}
  }, [])

  const onSubmitGate = (e: React.FormEvent) => {
    e.preventDefault()
    // Validación simple
    if (!form.nombre.trim() || !form.numero.trim() || !form.email.trim()) return
    if (form.tipoDesarrollador && !form.empresa.trim()) return
    if (form.tipoCodia && !form.codia.trim()) return
  const payload = {
      nombre: form.nombre.trim(),
      numero: form.numero.trim(),
      email: form.email.trim(),
      tipo: form.tipoDesarrollador && form.tipoCodia
        ? 'Desarrollador y Agente del codia'
        : form.tipoDesarrollador
        ? 'Desarrollador'
        : form.tipoCodia
        ? 'Agente del codia'
        : undefined,
      tipoDesarrollador: form.tipoDesarrollador || undefined,
      tipoCodia: form.tipoCodia || undefined,
      empresa: form.tipoDesarrollador ? form.empresa.trim() : undefined,
      website: form.tipoDesarrollador ? form.website.trim() : undefined,
      codia: form.tipoCodia ? form.codia.trim() : undefined,
  }
  setGateData(payload)
  try { localStorage.setItem('presu_customer', JSON.stringify(payload)) } catch {}
    setSubmitted(true)
  setShowGateModal(false)
  }

  if (loading) {
    return (
      <main>
        <Header />
        <div className="container mx-auto px-4 py-12 mt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <Header />
        <div className="container mx-auto px-4 py-12 mt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="bg-gray-50 min-h-screen relative">
      <Header />
      <div className="container mx-auto px-4 py-8 mt-24">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Presupuesto</h1>
              <p className="text-gray-600">Selecciona productos y genera tu presupuesto personalizado</p>
              {gateData && (
                <div className="mt-2 text-sm text-gray-700">
          <span className="font-medium">Cliente:</span> {gateData.nombre}
          {gateData.tipo ? <> • {gateData.tipo}</> : null}
          {(gateData.tipoDesarrollador || gateData.tipo?.includes('Desarrollador')) && gateData.empresa ? (
                    <> • {gateData.empresa}{gateData.website ? ` (${gateData.website})` : ''}</>
                  ) : null}
          {(gateData.tipoCodia || gateData.tipo?.includes('Agente del codia')) && gateData.codia ? (
                    <> • CODIA: {gateData.codia}</>
                  ) : null}
                </div>
              )}
            </div>
            {gateData && (
              <div className="flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowGateModal(true)}
                  className="inline-flex items-center gap-2 border px-4 py-2 text-sm rounded-md hover:bg-gray-50"
                >
                  Editar datos
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <LeftColumn search={search} setSearch={setSearch} filteredProducts={filteredProducts} onAdd={addItem} />
          </div>
          <div className="lg:col-span-2">
            <RightColumn
              items={selectedList as any}
              subtotal={subtotal}
              tax={tax}
              total={total}
              onQtyChange={changeQty}
              onRemove={removeItem}
              onClear={clearSelected}
              onDownload={exportPDF}
            />
          </div>
        </div>
      </div>
      {/* Overlay del formulario de inicio/edición */}
      {(!gateData || showGateModal) && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onKeyDown={(e)=>{
          if(e.key==='Escape' && gateData){ setShowGateModal(false) }
        }}>
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-xl p-6" role="dialog" aria-modal="true">
            {gateData && (
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setShowGateModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-900 mb-2">Crear cotización</h2>
            <p className="text-gray-600 mb-5">Completa tus datos para continuar</p>
            <form onSubmit={onSubmitGate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nombre completo</label>
                <input value={form.nombre} onChange={(e)=>setForm(prev=>({...prev, nombre: e.target.value}))} className="w-full border rounded-md px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Número</label>
                <input value={form.numero} onChange={(e)=>setForm(prev=>({...prev, numero: e.target.value}))} className="w-full border rounded-md px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Correo electrónico</label>
                <input type="email" value={form.email} onChange={(e)=>setForm(prev=>({...prev, email: e.target.value}))} className="w-full border rounded-md px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">¿Qué tipo de cliente eres? <span className="text-gray-500">(opcional)</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={form.tipoDesarrollador}
                      onChange={(e) => setForm((prev) => ({ ...prev, tipoDesarrollador: e.target.checked }))}
                      className="h-4 w-4 border-gray-300"
                    />
                    Desarrollador
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={form.tipoCodia}
                      onChange={(e) => setForm((prev) => ({ ...prev, tipoCodia: e.target.checked }))}
                      className="h-4 w-4 border-gray-300"
                    />
                    Agente del codia
                  </label>
                </div>
              </div>
              {form.tipoDesarrollador && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Nombre de la empresa</label>
                    <input value={form.empresa} onChange={(e)=>setForm(prev=>({...prev, empresa: e.target.value}))} className="w-full border rounded-md px-3 py-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">URL del website (opcional)</label>
                    <input value={form.website} onChange={(e)=>setForm(prev=>({...prev, website: e.target.value}))} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="https://..." />
                  </div>
                </div>
              )}
              {form.tipoCodia && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Número de identificación del CODIA</label>
                  <input value={form.codia} onChange={(e)=>setForm(prev=>({...prev, codia: e.target.value}))} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Ej. CODIA-12345" />
                </div>
              )}
              <div className="pt-2 flex justify-end gap-3">
                <button type="submit" className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 text-sm rounded-md hover:bg-primary/90">Continuar</button>
              </div>
              {submitted && !gateData && (
                <p className="text-xs text-red-600">Revisa los campos requeridos.</p>
              )}
            </form>
          </div>
        </div>
      )}
      <Footer />
    </main>
  )
}
