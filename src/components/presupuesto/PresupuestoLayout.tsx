"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import LeftColumn from "./LeftColumn"
import RightColumn from "./RightColumn"
import { usePresupuesto } from "./usePresupuesto"
import { useEffect, useState, useRef } from "react"
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

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
  // Se gestiona ahora mediante Formik (initialValues dinámica)
  // CODIA validation states
  const [codiaStatus, setCodiaStatus] = useState<'idle' | 'validating' | 'valid' | 'not_found' | 'error'>('idle')
  const [codiaData, setCodiaData] = useState<null | { nombre?: string; regional?: string; delegacion?: string; nucleo?: string }>(null)
  const lastValidatedRef = useRef<string>('')
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'posting' | 'success' | 'error'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Cargar datos persistidos en primer render
  useEffect(() => {
    try {
      const raw = localStorage.getItem('presu_customer')
      if (raw) {
        const parsed = JSON.parse(raw)
        setGateData(parsed)
        // Prefill formulario
      } else {
        // Si no hay datos, mostrar modal de entrada
        setShowGateModal(true)
      }
    } catch { }
  }, [])

  // Reset CODIA validation when number changes
  // Esta lógica se moverá dentro del efecto disparado por valores de Formik (ver más abajo)

  const validateCodia = async (codiaValue: string) => {
    if (!codiaValue.trim()) return
    setCodiaStatus('validating')
    setCodiaData(null)
    try {
      const res = await fetch(`/api/codia/${encodeURIComponent(codiaValue.trim())}`)
      const data = await res.json()
      if (data.ok) {
        setCodiaStatus('valid')
        setCodiaData(data.data)
        lastValidatedRef.current = codiaValue.trim()
      } else if (data.reason === 'not_found') {
        setCodiaStatus('not_found')
      } else {
        setCodiaStatus('error')
      }
    } catch {
      setCodiaStatus('error')
    }
  }

  // Schema Yup
  const schema = Yup.object({
    nombre: Yup.string().trim().min(2, 'Muy corto').required('Requerido'),
    numero: Yup.string().trim().min(3, 'Muy corto').required('Requerido'),
    email: Yup.string().email('Email inválido').required('Requerido'),
    tipoDesarrollador: Yup.boolean(),
    tipoCodia: Yup.boolean(),
    empresa: Yup.string().when('tipoDesarrollador', {
      is: true,
      then: s => s.trim().min(2, 'Muy corta').required('Requerido'),
      otherwise: s => s.strip()
    }),
    website: Yup.string().when('tipoDesarrollador', {
      is: true,
      then: s => s.trim().url('URL inválida').optional(),
      otherwise: s => s.strip()
    }),
    codia: Yup.string().when('tipoCodia', {
      is: true,
      then: s => s.trim().matches(/^\d+$/, 'Sólo números').min(3, 'Muy corto').required('Requerido'),
      otherwise: s => s.strip()
    }),
  }).test('codia-validado', 'Debes validar el número CODIA.', (values) => {
    if ((values as any).tipoCodia) {
      return codiaStatus === 'valid' && (values as any).codia?.trim() === lastValidatedRef.current
    }
    return true
  })

  const initialValues = {
    nombre: gateData?.nombre || '',
    numero: gateData?.numero || '',
    email: gateData?.email || '',
    tipoDesarrollador: Boolean(gateData?.tipoDesarrollador) || (gateData?.tipo === 'Desarrollador' || gateData?.tipo === 'Desarrollador y Agente del codia'),
    tipoCodia: Boolean(gateData?.tipoCodia) || (gateData?.tipo === 'Agente del codia' || gateData?.tipo === 'Desarrollador y Agente del codia'),
    empresa: gateData?.empresa || '',
    website: gateData?.website || '',
    codia: gateData?.codia || '',
  }

  const handleSubmit = async (values: typeof initialValues) => {
    const payload = {
      nombre: values.nombre.trim(),
      numero: values.numero.trim(),
      correo: values.email.trim(),
      tipoUsuario: values.tipoDesarrollador && values.tipoCodia
        ? 'Desarrollador y Agente del codia'
        : values.tipoDesarrollador
          ? 'Desarrollador'
          : values.tipoCodia
            ? 'Agente del codia'
            : 'Particular',
      tipoDesarrollador: values.tipoDesarrollador || undefined,
      tipoCodia: values.tipoCodia || undefined,
      empresa: values.tipoDesarrollador ? values.empresa.trim() : undefined,
      website: values.tipoDesarrollador ? values.website.trim() : undefined,
      datos_codia: values.tipoCodia ? {
        codiaNumero: values.codia.trim(),
        codiaValidated: true,
        codiaNombre: codiaData?.nombre,
        codiaRegional: codiaData?.regional,
        codiaDelegacion: codiaData?.delegacion,
        codiaNucleo: codiaData?.nucleo,
      } : undefined,
    }
    setSubmitStatus('posting')
    setSubmitError(null)
    try {
      const base = process.env.BASE_URL || 'https://romana-ebanisteria-api-production.up.railway.app/api/v1'
      const res = await fetch(`${base}/presupuestos/user`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 5|7yud9D0naVbdhuHOtTHRo6zM9AZAZAgER8AsVy3n17ded992'
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || 'Error enviando datos')
      }
      setSubmitStatus('success')
  setGateData(payload as any)
  try { localStorage.setItem('presu_customer', JSON.stringify(payload)) } catch { }
      // Cerrar modal tras un pequeño delay para mostrar feedback
      setTimeout(() => {
        setShowGateModal(false)
        setSubmitStatus('idle')
      }, 800)
    } catch (e: any) {
      setSubmitStatus('error')
      setSubmitError(e?.message || 'Fallo desconocido')
    }
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
            {/* Gate form only blocks product selection area */}
            {(!gateData || showGateModal) ? (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 relative">
                {gateData && (
                  <button
                    type="button"
                    aria-label="Cerrar edición"
                    onClick={() => setShowGateModal(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
                <h2 className="text-xl font-bold text-gray-900 mb-2">{gateData ? 'Editar datos del cliente' : 'Crear cotización'}</h2>
                <p className="text-gray-600 mb-5">Completa tus datos para continuar</p>
                <Formik
                  initialValues={initialValues}
                  enableReinitialize
                  validationSchema={schema}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, setFieldValue, isSubmitting, handleSubmit }) => {
                    // Sincronizar lógica de validación CODIA con cambios de Formik
                    useEffect(() => {
                      if (!values.tipoCodia) {
                        setCodiaStatus('idle')
                        setCodiaData(null)
                        lastValidatedRef.current = ''
                        return
                      }
                      if (!values.codia.trim()) {
                        setCodiaStatus('idle')
                        setCodiaData(null)
                        lastValidatedRef.current = ''
                        return
                      }
                      if (lastValidatedRef.current && values.codia.trim() !== lastValidatedRef.current) {
                        setCodiaStatus('idle')
                      }
                    }, [values.tipoCodia, values.codia])

                    return (
                      <Form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Nombre completo</label>
                    <Field name="nombre" className="w-full border rounded-md px-3 py-2 text-sm" />
                    {touched.nombre && errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Número de teléfono</label>
                    <Field name="numero" className="w-full border rounded-md px-3 py-2 text-sm" />
                    {touched.numero && errors.numero && <p className="text-xs text-red-600 mt-1">{errors.numero}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Correo electrónico</label>
                    <Field type="email" name="email" className="w-full border rounded-md px-3 py-2 text-sm" />
                    {touched.email && errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">¿Qué tipo de cliente eres? <span className="text-gray-500">(opcional)</span></label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 text-sm text-gray-800">
                        <Field type="checkbox" name="tipoDesarrollador" className="h-4 w-4 border-gray-300" />
                        Desarrollador
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-800">
                        <Field type="checkbox" name="tipoCodia" className="h-4 w-4 border-gray-300" />
                        Agente del codia
                      </label>
                    </div>
                  </div>
                  {values.tipoDesarrollador && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Nombre de la empresa</label>
                        <Field name="empresa" className="w-full border rounded-md px-3 py-2 text-sm" />
                        {touched.empresa && errors.empresa && <p className="text-xs text-red-600 mt-1">{errors.empresa}</p>}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">URL del website (opcional)</label>
                        <Field name="website" placeholder="https://..." className="w-full border rounded-md px-3 py-2 text-sm" />
                        {touched.website && errors.website && <p className="text-xs text-red-600 mt-1">{errors.website}</p>}
                      </div>
                    </div>
                  )}
                  {values.tipoCodia && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 flex items-center gap-2">Número de identificación del CODIA
                        {codiaStatus === 'valid' && <span className="text-green-600 text-xs font-medium">Válido</span>}
                        {codiaStatus === 'not_found' && <span className="text-red-600 text-xs font-medium">No encontrado</span>}
                        {codiaStatus === 'error' && <span className="text-orange-600 text-xs font-medium">Error</span>}
                      </label>
                      <div className="flex gap-2">
                        <Field name="codia" placeholder="Ej. 48433" inputMode="numeric" className="w-full border rounded-md px-3 py-2 text-sm" />
                        <button
                          type="button"
                          onClick={() => validateCodia(values.codia)}
                          disabled={codiaStatus === 'validating' || !values.codia.trim() || (codiaStatus === 'valid' && lastValidatedRef.current === values.codia.trim())}
                          className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {codiaStatus === 'validating' ? '...' : codiaStatus === 'valid' ? 'Revalidar' : 'Validar'}
                        </button>
                      </div>
                      {touched.codia && errors.codia && <p className="text-xs text-red-600 mt-1">{errors.codia}</p>}
                      {codiaStatus === 'validating' && <p className="mt-1 text-xs text-gray-500">Validando...</p>}
                      {codiaStatus === 'not_found' && <p className="mt-1 text-xs text-red-600">Número no encontrado.</p>}
                      {codiaStatus === 'error' && <p className="mt-1 text-xs text-orange-600">No se pudo validar. Intenta de nuevo.</p>}
                      {codiaStatus === 'valid' && codiaData && (
                        <div className="mt-2 rounded border bg-green-50 border-green-200 p-2 text-xs text-green-800 space-y-0.5">
                          {codiaData.nombre && <p><span className="font-medium">Nombre:</span> {codiaData.nombre}</p>}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                            {codiaData.regional && <p><span className="font-medium">Regional:</span> {codiaData.regional}</p>}
                            {codiaData.delegacion && <p><span className="font-medium">Delegación:</span> {codiaData.delegacion}</p>}
                            {codiaData.nucleo && <p className="sm:col-span-2"><span className="font-medium">Núcleo:</span> {codiaData.nucleo}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="pt-2 flex justify-end gap-3">
                    {gateData && (
                      <button
                        type="button"
                        onClick={() => setShowGateModal(false)}
                        className="inline-flex items-center gap-2 border px-4 py-2 text-sm rounded-md hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    )}
                    <button type="submit" disabled={isSubmitting || submitStatus==='posting' || (values.tipoCodia && (codiaStatus !== 'valid' || values.codia.trim() !== lastValidatedRef.current))} className="inline-flex items-center gap-2 bg-primary disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 text-sm rounded-md hover:bg-primary/90">
                      {submitStatus === 'posting' ? 'Enviando...' : (gateData ? 'Guardar' : 'Continuar')}
                    </button>
                  </div>
                  {values.tipoCodia && codiaStatus !== 'valid' && touched.codia && !errors.codia && (
                    <p className="text-xs text-red-600">Debes validar el número CODIA.</p>
                  )}
                  {submitStatus === 'success' && <p className="text-xs text-green-600">Guardado correctamente.</p>}
                  {submitStatus === 'error' && <p className="text-xs text-red-600">{submitError}</p>}
                </Form>
                    )
                  }}
                </Formik>
              </div>
            ) : (
              <div className={showGateModal ? 'pointer-events-none opacity-40' : ''}>
                <LeftColumn search={search} setSearch={setSearch} filteredProducts={filteredProducts} onAdd={addItem} />
              </div>
            )}
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
      <Footer />
    </main>
  )
}
