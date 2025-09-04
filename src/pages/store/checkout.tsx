"use client"
import Head from "next/head"
import type React from "react"

import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useCart } from "@/hook/useCart"
import { useState } from "react"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function CheckoutPage() {
  const { items, subtotal, count } = useCart()
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const isValid =
    form.firstName && form.lastName && form.email && form.phone && form.address && form.city && form.province

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || count === 0) return
    setSubmitting(true)
    try {
      const sanitizeDigits = (v: string) => v.replace(/\D/g, '').slice(0, 10) || '8090000000'
      const total = subtotal
      const amount12 = Math.round(total * 100).toString().padStart(12, '0')
      const tax12 = '000000000000'
      const orderId = `ORD${Date.now()}`
      const res = await fetch('/api/cardnet/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount12,
          orderId,
          tax: tax12,
          email: form.email,
          mobilePhone: sanitizeDigits(form.phone),
          workPhone: '8090000001',
          homePhone: '8090000002',
          billAddr_line1: form.address || 'Direccion',
          billAddr_line2: '',
          billAddr_line3: '',
          billAddr_city: form.city || 'Ciudad',
          billAddr_state: form.province || 'Provincia',
          billAddr_country: 'DOP',
          billAddr_postCode: form.postalCode || '00000',
          ipClient: ''
        })
      })
      if (!res.ok) {
        alert('No se pudo iniciar el pago')
        return
      }
      const { SESSION, sessionKey } = await res.json()
      localStorage.setItem('cardnet_session', SESSION)
      localStorage.setItem('cardnet_sessionKey', sessionKey)
      // Guardamos snapshot del pedido antes de redirigir (para mostrar en success incluso si el pago falla)
      try {
        const snapshot = {
          orderId,
          amount: total,
            // Guardamos formato centavos para referencia
          amountMinorUnits: amount12,
          currency: 'DOP',
          createdAt: Date.now(),
          items: items.map(i => ({
            id: i.id,
            productId: i.productId,
            variantId: (i as any).variantId,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            image: (i as any).image || null
          })),
          totals: {
            subtotal: total,
            tax: 0,
            shipping: 0,
            grandTotal: total
          },
          customer: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            province: form.province,
            postalCode: form.postalCode,
            notes: form.notes
          }
        }
        localStorage.setItem('cardnet_order_snapshot', JSON.stringify(snapshot))
      } catch {}
      const formEl = document.createElement('form')
      formEl.action = 'https://lab.cardnet.com.do/authorize'
      formEl.method = 'POST'
      formEl.style.display = 'none'
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = 'SESSION'
      input.value = SESSION
      formEl.appendChild(input)
      document.body.appendChild(formEl)
      formEl.submit()
    } catch (e) {
      console.error(e)
      alert('No se pudo procesar el checkout. Intenta de nuevo.')
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
            <span className="text-slate-800 font-semibold">Checkout</span>
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
                <form onSubmit={handleSubmit} className="space-y-12">
                  <header className="space-y-3">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">Finalizar compra</h1>
                    <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
                      Completa tus datos para coordinar el envío. Te contactaremos para confirmar los detalles y
                      procesar el pago.
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
                        <label className="text-sm font-medium text-slate-700">Teléfono *</label>
                        <input
                          className="w-full border border-slate-200 rounded-sm px-4 py-3.5 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors duration-200 placeholder:text-slate-400"
                          placeholder="(809) 000-0000"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          required
                        />
                      </div>
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

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!isValid || submitting}
                      className="inline-flex items-center gap-3 px-12 py-4 bg-slate-900 text-white font-semibold tracking-tight disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-all duration-200 rounded-sm shadow-sm hover:shadow-md"
                    >
                      {submitting ? (
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
                          Procesando...
                        </>
                      ) : (
                        <>
                          Continuar al pago
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
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
                        <p className="font-medium text-slate-700 mb-1">Compra segura</p>
                        <p>Tus datos están protegidos. El pago se procesará en el siguiente paso de forma segura.</p>
                      </div>
                    </div>
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
