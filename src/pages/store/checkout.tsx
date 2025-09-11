"use client"
import Head from "next/head"
import type React from "react"

import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useCart } from "@/hook/useCart"
import { useEffect, useState } from "react"
import { generateOrderId, generateTransactionId, getProvinceCode, formatPhoneForCardNet } from "@/lib/cardnet"
import { createOrder } from '@/lib/orders'
import { getCartToken } from '@/lib/cart'
import { useAuth } from '@/context/AuthContext'

const openSans = Open_Sans({ subsets: ["latin"] })

export default function CheckoutPage() {
  const { items, subtotal, count } = useCart()
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
  const [orderResult, setOrderResult] = useState<any>(null)
  const [orderError, setOrderError] = useState<string | null>(null)
  const { token: authToken } = useAuth()

  const isValid =
    form.firstName && form.lastName && form.email && form.phone && form.address && form.city && form.province

  // Function to redirect to CardNet payment gateway
  function postToGateway(action: string, sessionId: string, extras?: Record<string, string>) {
    const form = document.createElement("form")
    form.method = "POST"
    form.action = action
    form.target = "_self"
    
    const sessionInput = document.createElement("input")
    sessionInput.type = "hidden"
    sessionInput.name = "SESSION"
    sessionInput.value = sessionId
    form.appendChild(sessionInput)
    
    // Add return URLs as hidden inputs (using debug capture for troubleshooting)
    const returnInput = document.createElement("input")
    returnInput.type = "hidden"
    returnInput.name = "ReturnUrl"
    returnInput.value = `${window.location.origin}/api/debug/cardnet-capture`
    form.appendChild(returnInput)
    
    const cancelInput = document.createElement("input")
    cancelInput.type = "hidden"
    cancelInput.name = "CancelUrl"
    cancelInput.value = `${window.location.origin}/api/debug/cardnet-capture`
    form.appendChild(cancelInput)
    
    if (extras) {
      Object.entries(extras).forEach(([k, v]) => {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = k
        input.value = v
        form.appendChild(input)
      })
    }
    
    document.body.appendChild(form)
    form.submit()
  }

  // Handle CardNet payment
  async function handleCardNetPayment() {
    if (!isValid || count === 0) return
    setProcessingPayment(true)

    try {
      // Prepare 3DS data from form with EXACT CardNet format
      const mobilePhone = formatPhoneForCardNet(form.phone)
      const workPhone = formatPhoneForCardNet(form.workPhone || form.phone)
      const homePhone = formatPhoneForCardNet(form.homePhone || form.phone)
      const billStateCode = getProvinceCode(form.province)
      const shipStateCode = getProvinceCode(form.province) // Same as billing for now
      
      const threeDS = {
        email: form.email,
        mobilePhone: mobilePhone,
        workPhone: workPhone,
        homePhone: homePhone,
        billAddr_line1: form.address.toUpperCase(),
        billAddr_line2: "", // Empty if not provided
        billAddr_line3: form.address.toUpperCase(), // Repeat line1 as per example
        billAddr_city: form.city.toUpperCase(),
        billAddr_state: billStateCode,
        billAddr_country: "214", // Dominican Republic code for CardNet
        billAddr_postcode: form.postalCode || "10111",
        
        // Shipping (use same as billing for now)
        shipAddr_line1: form.address.toUpperCase(),
        shipAddr_line2: "", // Empty if not provided
        shipAddr_line3: form.address.toUpperCase(), // Repeat line1 as per example
        shipAddr_city: form.city.toUpperCase(),
        shipAddr_state: shipStateCode,
        shipAddr_country: "214", // Dominican Republic code for CardNet
        shipAddr_postcode: form.postalCode || "10111",
      }

      const orderId = generateOrderId()
      const transactionId = generateTransactionId()

      const payload = {
        orderId,
        transactionId,
        amount: subtotal,         // in DOP units
        tax: 0,                   // no ITBIS calculation for now
        threeDS,
        useCuotas: false,         // normal payment, not installments
      }

      console.log('Creating CardNet session...', { orderId, amount: subtotal })

      const response = await fetch("/api/payments/cardnet/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${data.details || "Error creating payment session"}`)
      }

      console.log('CardNet session created:', data.sessionId)

      // Store order data for confirmation
      try {
        sessionStorage.setItem("pending_order", JSON.stringify({
          orderId,
          items,
          form,
          subtotal,
          sessionId: data.sessionId,
          transactionId,
        }))
      } catch (e) {
        console.warn("Could not store order data:", e)
      }

      // Redirect to CardNet payment gateway
      postToGateway(data.authorizeUrl, data.sessionId)

    } catch (error: any) {
      console.error('Error creating CardNet session:', error)
      alert(`Error al procesar el pago: ${error.message}`)
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
          setOrderResult(resp.data)
          setSubmitted(true)
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
                {submitted && paymentMethod === 'order' && orderResult ? (
                  <div className="space-y-8">
                    <header className="space-y-3">
                      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Orden creada</h1>
                      <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
                        Tu orden ha sido registrada. Número de orden <span className="font-semibold">#{orderResult.order_number}</span>.
                      </p>
                    </header>
                    <div className="bg-white rounded-lg border border-slate-200/60 p-8 shadow-sm space-y-5">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <p className="text-sm text-slate-600">Estado: <span className="font-medium text-slate-900">{orderResult.estado}</span></p>
                        <p className="text-sm text-slate-600">Total: <span className="font-medium text-slate-900">{orderResult.monto_total}</span></p>
                        <p className="text-sm text-slate-600">Tracking: <span className="font-medium text-slate-900">{orderResult.tracking_number}</span></p>
                        <p className="text-sm text-slate-600">Items: <span className="font-medium text-slate-900">{orderResult.items_count}</span></p>
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-800 mb-3">Contacto</h3>
                        <p className="text-xs text-slate-600">{orderResult.contacto?.nombre} {orderResult.contacto?.apellido} · {orderResult.contacto?.correo} · {orderResult.contacto?.telefono}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-800 mb-3">Dirección</h3>
                        <p className="text-xs text-slate-600">{orderResult.direccion_envio?.calle}, {orderResult.direccion_envio?.ciudad}, {orderResult.direccion_envio?.provincia} {orderResult.direccion_envio?.codigo_postal}</p>
                      </div>
                      {!!orderResult.detalles?.length && (
                        <div className="pt-4 border-t border-slate-200 space-y-2">
                          <h3 className="text-sm font-semibold text-slate-800">Detalles</h3>
                          <ul className="divide-y divide-slate-100 border border-slate-200/60">
                            {orderResult.detalles.map((d: any) => (
                              <li key={d.id} className="p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <span className="font-medium text-slate-700 truncate">{d.producto_nombre} {d.variacion_nombre && <span className="text-slate-400">({d.variacion_nombre})</span>}</span>
                                <span className="text-slate-500">x{d.cantidad} · {d.precio_unitario}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="pt-6 flex gap-4">
                        <Link href="/store" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
                          ← Seguir comprando
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : submitted ? (
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
    </main>
  )
}
