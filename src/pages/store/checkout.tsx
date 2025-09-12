"use client"
import Head from "next/head"
import type React from "react"

import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useCart } from "@/hook/useCart"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
// CardNet flujo real restaurado: se pre-crea la orden y luego se redirige al gateway
import { createOrder } from '@/lib/orders'
import { getCartToken } from '@/lib/cart'
import { useAuth } from '@/context/AuthContext'
// NEW imports for CardNet session
// We'll assume an API route exists: /api/payments/cardnet/session returning { formUrl, fields }
// If not, adapt accordingly.

const openSans = Open_Sans({ subsets: ["latin"] })

export default function CheckoutPage() {
  // Include clear to vaciar el carrito tras crear la orden
  const { items, subtotal, count, clear } = useCart()
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    workPhone: "",
    homePhone: "",
    address: "", 
    city: "",
    province: "",
    postalCode: "",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"order" | "cardnet">("order")
  const [processingPayment, setProcessingPayment] = useState(false)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [orderResult, setOrderResult] = useState<any>(null) // mantenido solo si en futuro se reusa
  const [orderError, setOrderError] = useState<string | null>(null)
  const { token: authToken } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  const isValid =
    form.firstName && form.lastName && form.email && form.phone && form.address && form.city && form.province

  // Eliminado gateway real: no se necesita postToGateway

  // Handle CardNet payment
  async function handleCardNetPayment() {
    if (!isValid || count === 0) return
    setProcessingPayment(true)
    setOrderError(null)
    try {
      const carrito_token = getCartToken()
      if (!carrito_token) throw new Error('No hay carrito activo')

      // 1. Pre-crear la orden en backend (igual que flujo crear orden)
      const orderPayload = {
        carrito_token,
        direccion_envio: {
          calle: form.address,
          ciudad: form.city,
          provincia: form.province,
          pais: 'DO',
          codigo_postal: form.postalCode || ''
        },
        contacto: {
          nombre: form.firstName,
          apellido: form.lastName,
          correo: form.email,
          telefono: form.phone
        }
      }
      const created = await createOrder(orderPayload as any, authToken)
      const createdData = created.data || {}
      const tracking = createdData.tracking_number || createdData.order_number
      if (!tracking) throw new Error('No se obtuvo tracking de la orden creada')

      // 2. Solicitar sesión CardNet al backend
      const sessionResp = await fetch('/api/payments/cardnet/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: subtotal,
          currency: 'DOP',
          tracking_number: tracking,
          // Pasar algunos datos para 3DS si backend los usa
          customer: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            province: form.province,
            postalCode: form.postalCode,
          }
        })
      })
      if (!sessionResp.ok) {
        const errJson = await sessionResp.json().catch(()=>null)
        throw new Error(errJson?.error || 'No se pudo iniciar sesión de pago')
      }
      const sessionData = await sessionResp.json()
      if (!sessionData?.formUrl || !sessionData?.fields) {
        throw new Error('Respuesta de sesión de pago inválida')
      }

      // 3. Guardar snapshot en sessionStorage para notify/success
      try {
        const snapshot = {
          order_precreated: true,
          tracking_number: tracking,
          orderId: String(createdData.order_number || tracking),
          sessionId: sessionData.fields?.SESSION || sessionData.sessionId,
          transactionId: sessionData.fields?.TransactionID || sessionData.transactionId || 'T' + Date.now(),
          subtotal,
          items: items.map(it => ({ id: String(it.id), nombre: it.name, cantidad: it.quantity, price: it.price })),
          form,
        }
        sessionStorage.setItem('pending_order', JSON.stringify(snapshot))
      } catch (e) { console.warn('No se pudo guardar pending_order', e) }

      // 4. Construir y enviar formulario POST automático a CardNet
      const formUrl: string = sessionData.formUrl
      const fields: Record<string,string> = sessionData.fields
      // Ya no usamos marcador __TRACKING__; el backend entrega la URL final.

      const gatewayFormId = 'cardnet-auto-form'
      let existing = document.getElementById(gatewayFormId) as HTMLFormElement | null
      if (existing) existing.remove()

      const f = document.createElement('form')
      f.method = 'POST'
      f.action = formUrl
      f.id = gatewayFormId
      Object.entries(fields).forEach(([k,v]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = k
        input.value = String(v)
        f.appendChild(input)
      })
      document.body.appendChild(f)
      f.submit()
    } catch (error:any) {
      console.error('Error iniciando pago con tarjeta:', error)
      setOrderError(error?.message || 'No se pudo iniciar el pago con tarjeta')
    } finally {
      setProcessingPayment(false)
    }
  }

  // Handle info-only submission (original behavior)
  async function handleCustomerInfoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || count === 0) return
    setSubmitting(true)

    try {
      if (!isValid) return
      if (paymentMethod === 'order') {
        setCreatingOrder(true)
        setOrderError(null)
        try {
          const carrito_token = getCartToken()
          if (!carrito_token) throw new Error('No hay carrito activo')
          const payload = {
            carrito_token,
            direccion_envio: {
              calle: form.address,
              ciudad: form.city,
              provincia: form.province,
              pais: 'DO',
              codigo_postal: form.postalCode || ''
            },
            contacto: {
              nombre: form.firstName,
              apellido: form.lastName,
              correo: form.email,
              telefono: form.phone
            }
          }
          const resp = await createOrder(payload, authToken)
          const data = resp.data
          const tracking = data.tracking_number || data.order_number

          // Simular pago inmediatamente y disparar emails con QR reutilizando el tracking real
          try {
            await fetch('/api/payments/process-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: String(data.order_number || Date.now()),
                trackingNumber: tracking,
                items: items.map(it => ({ id: String(it.id), name: it.name, quantity: it.quantity, price: it.price, image: it.image })),
                customer: {
                  firstName: form.firstName,
                  lastName: form.lastName,
                  email: form.email,
                  phone: form.phone,
                  address: form.address,
                  city: form.city,
                  province: form.province,
                  postalCode: form.postalCode,
                  notes: form.notes,
                },
                totals: { subtotal, tax: 0, total: subtotal },
                payment: {
                  responseCode: '00', // forzamos éxito
                  authCode: 'SIMULATED',
                  rrn: 'SIM-' + Math.random().toString(36).slice(2,8).toUpperCase(),
                  maskedPan: '411111******1111'
                }
              })
            }).catch(err => console.warn('Fallo simulando process-order:', err))
          } catch (simErr) {
            console.warn('No se pudo simular el pago / enviar emails:', simErr)
          }

          try { await clear() } catch (clrErr) { console.warn('No se pudo vaciar el carrito después de crear la orden', clrErr) }
          setRedirecting(true)
          router.replace(`/store/checkout/success/${tracking}?just_created=1`)
          return
        } catch (er: any) {
          console.error('Error creando orden:', er)
          setOrderError(er?.message || 'No se pudo crear la orden')
        } finally {
          setCreatingOrder(false)
        }
      } else {
        // fallback info-only path if ever re-enabled
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Error en validación:', error)
      alert('Error al procesar la información. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={openSans.className}>
      <Head>
        <title>Checkout | Romana Ebanistería</title>
      </Head>
      <Header />

      <div className="min-h-screen bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
          <nav className="mb-16 text-sm text-slate-500 flex items-center gap-3">
            <Link href="/store" className="hover:text-slate-800 transition-colors duration-200 font-medium">
              Tienda
            </Link>
            <span className="text-slate-300">→</span>
            <Link href="/store/cart" className="hover:text-slate-800 transition-colors duration-200 font-medium">
              Carrito
            </Link>
            <span className="text-slate-300">→</span>
            <span className="text-slate-800 font-semibold">Información del cliente</span>
          </nav>

          {count === 0 ? (
            <div className="text-center py-32 bg-white rounded-lg border border-slate-200/60 shadow-sm">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tu carrito está vacío</h1>
                <p className="text-slate-600 leading-relaxed">
                  Explora nuestra colección de muebles artesanales y encuentra la pieza perfecta para tu hogar.
                </p>
                <Link
                  href="/store"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-semibold tracking-tight hover:bg-slate-800 transition-all duration-200 rounded-sm shadow-sm hover:shadow-md"
                >
                  Explorar productos
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-16 lg:grid-cols-3">
              {/* Form Section */}
              <div className="lg:col-span-2">
                {submitted ? (
                  <div className="space-y-8">
                    <header className="space-y-3">
                      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Datos recibidos</h1>
                      <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
                        Hemos recibido tu información. Nos pondremos en contacto para coordinar el pago y entrega.
                      </p>
                    </header>
                    <div className="bg-white rounded-lg border border-slate-200/60 p-8 shadow-sm space-y-4">
                      <p className="text-sm text-slate-600">Nombre: <span className="font-medium text-slate-900">{form.firstName} {form.lastName}</span></p>
                      <p className="text-sm text-slate-600">Correo: <span className="font-medium text-slate-900">{form.email}</span></p>
                      <p className="text-sm text-slate-600">Teléfono: <span className="font-medium text-slate-900">{form.phone}</span></p>
                      <p className="text-sm text-slate-600">Dirección: <span className="font-medium text-slate-900">{form.address}, {form.city}, {form.province} {form.postalCode}</span></p>
                      {form.notes && <p className="text-sm text-slate-600">Notas: <span className="font-medium text-slate-900">{form.notes}</span></p>}
                      <div className="pt-4">
                        <Link href="/store" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
                          ← Seguir comprando
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCustomerInfoSubmit} className="space-y-12">
                    <header className="space-y-3">
                      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Información del cliente</h1>
                      <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
                        Completa tus datos para coordinar el envío. Te contactaremos para confirmar los detalles.
                      </p>
                    </header>

                    <section className="bg-white rounded-lg border border-slate-200/60 p-8 shadow-sm">
                      <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-8 pb-4 border-b border-slate-100">
                        Información personal
                      </h2>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Nombre *</label>
                          <input
                            className="w-full border border-slate-200 rounded-sm px-4 py-3.5 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors duration-200 placeholder:text-slate-400"
                            placeholder="Tu nombre"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Apellido *</label>
                          <input
                            className="w-full border border-slate-200 rounded-sm px-4 py-3.5 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors duration-200 placeholder:text-slate-400"
                            placeholder="Tu apellido"
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Correo electrónico *</label>
                          <input
                            type="email"
                            className="w-full border border-slate-200 rounded-sm px-4 py-3.5 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors duration-200 placeholder:text-slate-400"
                            placeholder="tu@email.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Teléfono móvil *</label>
                          <input
                            className="w-full border border-slate-200 rounded-sm px-4 py-3.5 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors duration-200 placeholder:text-slate-400"
                            placeholder="(809) 000-0000"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            required
                          />
                        </div>
                        
                        {paymentMethod === "cardnet" && (
                          <>
                            <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                              <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-blue-900 mb-1">Información adicional requerida para pago seguro</p>
                                  <p className="text-xs text-blue-700">Los bancos requieren números de teléfono adicionales para validar tu identidad y procesar el pago de forma segura.</p>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">Teléfono del trabajo</label>
                              <input
                                className="w-full border border-slate-200 rounded-sm px-4 py-3.5 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors duration-200 placeholder:text-slate-400"
                                placeholder="(809) 000-0000 (opcional)"
                                value={form.workPhone}
                                onChange={(e) => setForm({ ...form, workPhone: e.target.value })}
                              />
                              <p className="text-xs text-slate-500">Si no tienes teléfono del trabajo, se usará tu móvil</p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">Teléfono de casa</label>
                              <input
                                className="w-full border border-slate-200 rounded-sm px-4 py-3.5 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors duration-200 placeholder:text-slate-400"
                                placeholder="(809) 000-0000 (opcional)"
                                value={form.homePhone}
                                onChange={(e) => setForm({ ...form, homePhone: e.target.value })}
                              />
                              <p className="text-xs text-slate-500">Si no tienes teléfono de casa, se usará tu móvil</p>
                            </div>
                          </>
                        )}
                      </div>
                    </section>

                    <section className="bg-white rounded-lg border border-slate-200/60 p-8 shadow-sm">
                      <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-8 pb-4 border-b border-slate-100">
                        Dirección de envío
                      </h2>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Dirección completa *</label>
                          <input
                            className="w-full border border-slate-200 rounded-sm px-4 py-3.5 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors duration-200 placeholder:text-slate-400"
                            placeholder="Calle, número, sector"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-6 sm:grid-cols-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Ciudad *</label>
                            <input
                              className="w-full border border-slate-200 rounded-sm px-4 py-3.5 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors duration-200 placeholder:text-slate-400"
                              placeholder="Santo Domingo"
                              value={form.city}
                              onChange={(e) => setForm({ ...form, city: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Provincia *</label>
                            <input
                              className="w-full border border-slate-200 rounded-sm px-4 py-3.5 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors duration-200 placeholder:text-slate-400"
                              placeholder="Distrito Nacional"
                              value={form.province}
                              onChange={(e) => setForm({ ...form, province: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Código postal</label>
                            <input
                              className="w-full border border-slate-200 rounded-sm px-4 py-3.5 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors duration-200 placeholder:text-slate-400"
                              placeholder="10101"
                              value={form.postalCode}
                              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Notas adicionales</label>
                          <textarea
                            className="w-full border border-slate-200 rounded-sm px-4 py-3.5 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors duration-200 placeholder:text-slate-400 resize-none"
                            rows={4}
                            placeholder="Instrucciones especiales para la entrega, referencias del lugar, etc."
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                          />
                        </div>
                      </div>
                    </section>

                    {/* Payment Method Selection */}
                    <section className="bg-white rounded-lg border border-slate-200/60 p-8 shadow-sm">
                      <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-8 pb-4 border-b border-slate-100">
                        Método / tipo de finalización
                      </h2>
                      
                      <div className="space-y-4">
                        <label className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="order"
                            checked={paymentMethod === "order"}
                            onChange={(e) => setPaymentMethod(e.target.value as "order")}
                            className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M10 14h10M4 18h10" />
                              </svg>
                              <span className="font-semibold text-slate-900">Crear orden (sin pagar ahora)</span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">Manual</span>
                            </div>
                            <p className="text-sm text-slate-600">
                              Genera una orden con tus datos. Te contactaremos para coordinar el pago y entrega.
                            </p>
                          </div>
                        </label>
                       {/*  <label className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="info"
                            checked={paymentMethod === "info"}
                            onChange={(e) => setPaymentMethod(e.target.value as "info")}
                            className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="font-semibold text-slate-900">Solo enviar información</span>
                            </div>
                            <p className="text-sm text-slate-600">
                              Enviaremos tu información y nos contactaremos contigo para coordinar el pago y entrega.
                            </p>
                          </div>
                        </label> */}

                        <label className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cardnet"
                            checked={paymentMethod === "cardnet"}
                            onChange={(e) => setPaymentMethod(e.target.value as "cardnet")}
                            className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              <span className="font-semibold text-slate-900">Pagar con tarjeta ahora</span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                Seguro
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">
                              Paga de forma segura con tu tarjeta de crédito o débito a través de CardNet.
                            </p>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Encriptación SSL</span>
                              </div>
                              <span>•</span>
                              <span>Visa, Mastercard, American Express</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </section>

                    <div className="flex justify-end">
                      {paymentMethod === "cardnet" ? (
                        <button
                          type="button"
                          onClick={handleCardNetPayment}
                          disabled={!isValid || processingPayment}
                          className="inline-flex items-center gap-3 px-12 py-4 bg-primary text-white font-semibold tracking-tight disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-all duration-200 rounded-sm shadow-sm hover:shadow-md"
                        >
                          {processingPayment ? (
                            <>
                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Procesando pago...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              Pagar ahora
                            </>
                          )}
                        </button>
            ) : (
                        <button
                          type="submit"
              disabled={!isValid || submitting || creatingOrder}
                          className="inline-flex items-center gap-3 px-12 py-4 bg-slate-900 text-white font-semibold tracking-tight disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-all duration-200 rounded-sm shadow-sm hover:shadow-md"
                        >
              {submitting || creatingOrder ? (
                            <>
                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              {paymentMethod === 'order' ? 'Creando orden...' : 'Enviando...'}
                            </>
                          ) : (
                            <>{paymentMethod === 'order' ? 'Crear orden' : 'Enviar información'}</>
                          )}
                        </button>
                      )}
                      {orderError && (
                        <p className="mt-4 text-sm text-red-600">{orderError}</p>
                      )}
                    </div>
                  </form>
                )}
              </div>

              <aside className="lg:sticky lg:top-8 h-fit">
                <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">Resumen del pedido</h2>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      {items.map((it) => (
                        <div key={it.id} className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-sm">
                          <div className="w-16 h-16 bg-white border border-slate-200 rounded-sm overflow-hidden flex items-center justify-center flex-shrink-0">
                            {it.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={it.image || "/placeholder.svg"}
                                alt={it.name}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <svg
                                className="w-6 h-6 text-slate-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <h3 className="font-medium text-slate-900 text-sm leading-tight">{it.name}</h3>
                            <p className="text-xs text-slate-500 font-medium">Cantidad: {it.quantity}</p>
                            <p className="text-sm font-semibold text-slate-900">
                              {(it.price * it.quantity).toLocaleString("es-DO", { style: "currency", currency: "DOP" })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-medium text-slate-900">
                          {subtotal.toLocaleString("es-DO", { style: "currency", currency: "DOP" })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Envío</span>
                        <span className="font-medium text-emerald-600">Gratis</span>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between">
                        <span className="text-lg font-semibold text-slate-900">Total</span>
                        <span className="text-lg font-bold text-slate-900">
                          {subtotal.toLocaleString("es-DO", { style: "currency", currency: "DOP" })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <div className="text-xs text-slate-600 leading-relaxed">
            {paymentMethod === "cardnet" ? (
                          <>
                            <p className="font-medium text-slate-700 mb-1">Pago seguro con CardNet</p>
                            <p>Serás redirigido a la plataforma segura de CardNet para completar tu pago con tarjeta.</p>
                          </>
            ) : (
                          <>
              <p className="font-medium text-slate-700 mb-1">Creación de orden sin pago</p>
              <p>Se generará una orden con tus datos para coordinar el pago y la entrega posteriormente.</p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {paymentMethod === "cardnet" && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Procesado por CardNet</span>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Certificado SSL</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
      <Footer />
      {redirecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-8 bg-white border border-slate-200 rounded-md shadow-sm">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium text-slate-700">Orden creada. Redirigiendo…</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>No cierres esta ventana</span>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
