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
// Integración CardNet eliminada: solo creación de orden sin pago online
import { createOrder } from '@/lib/orders'
import { getCartToken } from '@/lib/cart'
import { useAuth } from '@/context/AuthContext'
import { File, CreditCard, ShieldCheck, CheckCircle2, Lock } from "lucide-react"
// (Se removieron imports y lógica de CardNet)

type CardFormState = {
  cardNumber: string
  name: string
  expMonth: string
  expYear: string
  cvv: string
  email: string
}

const sanitizeCardNumber = (value: string) => value.replace(/\D/g, "").slice(0, 19)

const formatCardNumber = (value: string) => {
  const sanitized = sanitizeCardNumber(value)
  return sanitized.replace(/(\d{1,4})/g, "$1 ").trim()
}

const maskCardNumber = (value: string) => {
  const sanitized = sanitizeCardNumber(value)
  if (sanitized.length <= 4) return sanitized
  const maskedSection = sanitized.slice(0, -4).replace(/\d/g, "•")
  return `${maskedSection}${sanitized.slice(-4)}`.replace(/(.{4})/g, "$1 ").trim()
}

const luhnCheck = (value: string) => {
  const digits = sanitizeCardNumber(value)
  if (!digits) return false
  let sum = 0
  let shouldDouble = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10)
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

const extractXmlTagValue = (xml: string | undefined, tag: string): string | null => {
  if (!xml) return null
  const regex = new RegExp(`<${tag}>(.*?)<\\/${tag}>`)
  const match = xml.match(regex)
  return match ? match[1] : null
}

const validateCardForm = (values: CardFormState) => {
  const errors: Partial<Record<keyof CardFormState, string>> = {}
  const numberDigits = sanitizeCardNumber(values.cardNumber)
  if (!numberDigits) {
    errors.cardNumber = "Ingresa el número de la tarjeta"
  } else if (numberDigits.length < 13 || numberDigits.length > 19 || !luhnCheck(numberDigits)) {
    errors.cardNumber = "Número de tarjeta inválido"
  }

  if (!values.name.trim()) {
    errors.name = "Nombre requerido"
  }

  const month = parseInt(values.expMonth, 10)
  if (!values.expMonth) {
    errors.expMonth = "Mes requerido"
  } else if (Number.isNaN(month) || month < 1 || month > 12) {
    errors.expMonth = "Mes inválido"
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  if (!values.expYear) {
    errors.expYear = "Año requerido"
  } else {
    const normalizedYear = values.expYear.length === 2 ? Number(`20${values.expYear}`) : Number(values.expYear)
    if (Number.isNaN(normalizedYear) || normalizedYear < currentYear) {
      errors.expYear = "Año inválido"
    } else if (normalizedYear === currentYear && month < currentMonth) {
      errors.expMonth = "La tarjeta está vencida"
    }
  }

  if (!values.cvv) {
    errors.cvv = "CVV requerido"
  } else if (!/^\d{3,4}$/.test(values.cvv)) {
    errors.cvv = "CVV inválido"
  }

  if (!values.email) {
    errors.email = "Correo requerido"
  } else if (!/^.+@.+\..+$/.test(values.email)) {
    errors.email = "Correo inválido"
  }

  return errors
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"))
const YEAR_OPTIONS = Array.from({ length: 12 }, (_, index) => String(new Date().getFullYear() + index))

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
    cedula: "",
    paymentMethod: "tarjeta", // transferencia | tarjeta
    valorFiscal: false,
    rnc: "",
    comentarioPago: "",
    voucherFile: undefined as File | undefined,
    voucherPreview: "", // base64 para enviar
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  // Solo flujo de orden manual (sin pasarela)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [orderResult, setOrderResult] = useState<any>(null) // mantenido solo si en futuro se reusa
  const [orderError, setOrderError] = useState<string | null>(null)
  const { token: authToken } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)
  const [voucherError, setVoucherError] = useState<string | null>(null)
  const [voucherDragging, setVoucherDragging] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const [cardForm, setCardForm] = useState<CardFormState>({
    cardNumber: "",
    name: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    email: "",
  })
  const [cardErrors, setCardErrors] = useState<Partial<Record<keyof CardFormState, string>>>({})
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentReceipt, setPaymentReceipt] = useState<any>(null)
  type BankAccount = {
    id: string
    currency: string
    tipo: string
    numero: string
    banco: string
    nombre: string
    rnc: string
  }

  const bankAccounts: BankAccount[] = [
    { id: 'usd-ahorro-popular', currency: 'USD', tipo: 'Cuenta de Ahorro', numero: '797745478', banco: 'Banco Popular', nombre: 'La Fabbrica', rnc: '131132359' },
    { id: 'dop-ahorro-popular', currency: 'DOP', tipo: 'Cuenta de Ahorro', numero: '0786475814', banco: 'Banco Popular', nombre: 'La Fabbrica S.R.L', rnc: '131132359' },
    { id: 'dop-corriente-reservas', currency: 'DOP', tipo: 'Cuenta Corriente', numero: '3850000860', banco: 'Banco Reservas RD', nombre: 'La Fabbrica', rnc: '131132359' }
  ]

  useEffect(() => {
    const fullName = `${form.firstName} ${form.lastName}`.trim()
    setCardForm(prev => {
      let changed = false
      let next = prev

      if (form.email && prev.email !== form.email) {
        next = { ...next, email: form.email }
        changed = true
      }

      if (fullName && !prev.name.trim()) {
        next = { ...next, name: fullName }
        changed = true
      }

      return changed ? next : prev
    })
  }, [form.firstName, form.lastName, form.email])

  useEffect(() => {
    if (form.paymentMethod === 'tarjeta') {
      setCardErrors(validateCardForm(cardForm))
    } else {
      setCardErrors({})
    }
  }, [cardForm, form.paymentMethod])

  function copyToClipboard(label: string, value: string) {
    try {
      navigator.clipboard.writeText(value)
      setCopiedField(label + value)
      setTimeout(() => setCopiedField(null), 2500)
    } catch (e) {
      console.warn('No se pudo copiar', e)
    }
  }

  const MAX_VOUCHER_SIZE = 5 * 1024 * 1024 // 5MB

  const [uploading, setUploading] = useState(false)

  async function handleVoucherFile(file: File | undefined) {
    if (!file) {
      setVoucherError(null)
      setForm(f => ({ ...f, voucherFile: undefined, voucherPreview: '' }))
      return
    }
    // Validaciones básicas
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    if (!allowed.includes(file.type)) {
      setVoucherError('Formato no soportado. Usa JPG, PNG, WEBP, GIF o PDF.')
      setForm(f => ({ ...f, voucherFile: undefined, voucherPreview: '' }))
      return
    }
    if (file.size > MAX_VOUCHER_SIZE) {
      setVoucherError('El archivo excede el tamaño máximo de 5MB.')
      setForm(f => ({ ...f, voucherFile: undefined, voucherPreview: '' }))
      return
    }
    setVoucherError(null)
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/uplaod-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir el archivo');
      }

      const { url } = await response.json();
      setForm(f => ({ ...f, voucherFile: file, voucherPreview: url }));
    } catch (error) {
      console.error('Error uploading file:', error);
      setVoucherError('Error al subir el archivo. Intenta de nuevo.');
      setForm(f => ({ ...f, voucherFile: undefined, voucherPreview: '' }));
    } finally {
      setUploading(false);
    }
  }

  const baseFormValid = Boolean(
    form.firstName &&
    form.lastName &&
    form.email &&
    form.phone &&
    form.address &&
    form.city &&
    form.province &&
    form.cedula &&
    (!form.valorFiscal || (form.valorFiscal && form.rnc))
  )

  const isCardValid = form.paymentMethod !== 'tarjeta' || Object.keys(cardErrors).length === 0

  const isValid = baseFormValid && isCardValid

  // Eliminado flujo de pago con tarjeta.

  // Handle info-only submission (original behavior)
  async function handleCustomerInfoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || count === 0) return

    setSubmitting(true)
    setOrderError(null)
    setPaymentError(null)

    const amountString = subtotal.toFixed(2)
    let paymentMeta: {
      responseCode: string
      authCode?: string | null
      rrn?: string | null
      maskedPan?: string | null
      pnRef?: string | null
      invoiceNumber?: string | null
    } | null = null

    try {
      if (!isValid) return

      if (form.paymentMethod === 'tarjeta') {
        const errors = validateCardForm(cardForm)
        setCardErrors(errors)
        if (Object.keys(errors).length > 0) {
          throw new Error('Corrige los datos de la tarjeta antes de continuar.')
        }

        setProcessingPayment(true)
        const paymentResponse = await fetch('/api/payments/card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardNumber: sanitizeCardNumber(cardForm.cardNumber),
            expMonth: cardForm.expMonth,
            expYear: cardForm.expYear,
            cvv: cardForm.cvv,
            name: cardForm.name,
            email: cardForm.email || form.email,
            amount: amountString,
          })
        })

        if (!paymentResponse.ok) {
          const errorBody = await paymentResponse.json().catch(() => null)
          const errorMessage = errorBody?.error || errorBody?.message || errorBody?.details?.message || 'No se pudo procesar el pago con tarjeta.'
          throw new Error(errorMessage)
        }

        const paymentData = await paymentResponse.json()
        const data = paymentData?.data || {}
        const transaction = data?.transaction || {}
        const approvalCode = extractXmlTagValue(data?.raw_body, 'approval-code')

        paymentMeta = {
          responseCode: transaction?.responseCode || data?.responseCode || '00',
          authCode: approvalCode,
          rrn: data?.reference_number || null,
          maskedPan: maskCardNumber(cardForm.cardNumber),
          pnRef: transaction?.pnRef || data?.pnRef || null,
          invoiceNumber: data?.invoice_number || null,
        }

        setPaymentReceipt({
          message: data?.message || 'Pago aprobado',
          amount: data?.transaction?.amount || amountString,
          reference: data?.reference_number || transaction?.pnRef,
          approvalCode,
        })

        setProcessingPayment(false)
      } else {
        setPaymentReceipt(null)
      }

      setCreatingOrder(true)
      const carrito_token = getCartToken()
      if (!carrito_token) throw new Error('No hay carrito activo')

      const payload = {
        carrito_token,
        payment_method: form.paymentMethod,
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
          telefono: form.phone,
          cedula: form.cedula,
          valor_fiscal: form.valorFiscal,
          rnc: form.rnc || null,
          comentario_pago: form.comentarioPago || null,
          voucher: form.paymentMethod === 'transferencia' ? form.voucherPreview || null : null
        }
      }

      const resp = await createOrder(payload, authToken)
      const data = resp.data
      const tracking = data.tracking_number || data.order_number

      try {
        await fetch('/api/payments/process-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: String(data.order_number || Date.now()),
            trackingNumber: tracking,
            transactionId: paymentMeta?.pnRef || undefined,
            sessionId: paymentMeta?.invoiceNumber || undefined,
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
              metodo: form.paymentMethod,
              valorFiscal: form.valorFiscal,
              rnc: form.rnc || null,
              cedula: form.cedula,
              comentario: form.comentarioPago || null,
              voucher: form.paymentMethod === 'transferencia' ? form.voucherPreview || null : null,
              tarjetaDisponible: form.paymentMethod === 'tarjeta',
              responseCode: paymentMeta?.responseCode || '00',
              authCode: paymentMeta?.authCode || null,
              rrn: paymentMeta?.rrn || null,
              maskedPan: paymentMeta?.maskedPan || null,
            }
          })
        }).catch(err => console.warn('Fallo simulando process-order:', err))
      } catch (simErr) {
        console.warn('No se pudo simular el pago / enviar emails:', simErr)
      }

      if (form.paymentMethod === 'tarjeta') {
        setCardForm({
          cardNumber: '',
          name: '',
          expMonth: '',
          expYear: '',
          cvv: '',
          email: form.email,
        })
      }

      try { await clear() } catch (clrErr) { console.warn('No se pudo vaciar el carrito después de crear la orden', clrErr) }
      setRedirecting(true)
      router.replace(`/store/checkout/success/${tracking}?just_created=1`)
      return
    } catch (error: any) {
      console.error('Error procesando checkout:', error)
      if (form.paymentMethod === 'tarjeta' && (!paymentMeta || error?.message?.includes('tarjeta'))) {
        setPaymentError(error?.message || 'No se pudo procesar el pago con tarjeta.')
        setOrderError(null)
        setPaymentReceipt(null)
      } else {
        setOrderError(error?.message || 'No se pudo crear la orden')
      }
    } finally {
      setProcessingPayment(false)
      setCreatingOrder(false)
      setSubmitting(false)
    }
  }

  return (
    <main className={openSans.className}>
      <Head>
        <title>Checkout | La Fabbrica</title>
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
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-sm font-medium text-slate-700">Cédula *</label>
                          <input
                            className="w-full border border-slate-200 rounded-sm px-4 py-3.5 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors duration-200 placeholder:text-slate-400"
                            placeholder="000-0000000-0"
                            value={form.cedula}
                            onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                            required
                          />
                        </div>

                        {/* Campos adicionales para pasarela eliminados */}
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




                    {/* Métodos de pago */}
                    <section className="bg-white rounded-lg border border-slate-200/60 p-8 shadow-sm">
                      <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-8 pb-4 border-b border-slate-100">Pago</h2>

                      <div className="space-y-6">

                        <div className="flex items-center gap-2">
                          <input id="valorFiscal" type="checkbox" checked={form.valorFiscal} onChange={(e) => setForm({ ...form, valorFiscal: e.target.checked })} />
                          <label htmlFor="valorFiscal" className="text-sm text-slate-700">¿Requieres comprobante con valor fiscal?</label>
                        </div>
                        {form.valorFiscal && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">RNC *</label>
                            <input
                              className="w-full border border-slate-200 rounded-sm px-4 py-3.5 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0"
                              placeholder="RNC"
                              value={form.rnc}
                              onChange={(e) => setForm({ ...form, rnc: e.target.value })}
                              required={form.valorFiscal}
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Comentario del pago</label>
                          <textarea
                            className="w-full border border-slate-200 rounded-sm px-4 py-3 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 resize-none"
                            rows={3}
                            placeholder="Información adicional sobre el pago."
                            value={form.comentarioPago}
                            onChange={(e) => setForm({ ...form, comentarioPago: e.target.value })}
                          />
                        </div>

                        <div className="space-y-3">
                          <p className="text-sm font-medium text-slate-700">Método de pago</p>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className={`border rounded-sm p-4 cursor-pointer flex items-start gap-3 transition ${form.paymentMethod === 'tarjeta' ? 'border-slate-900 ring-1 ring-slate-900 bg-slate-900/5' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="tarjeta"
                                className="mt-1"
                                checked={form.paymentMethod === 'tarjeta'}
                                onChange={() => {
                                  setForm({ ...form, paymentMethod: 'tarjeta' })
                                  setPaymentError(null)
                                  setPaymentReceipt(null)
                                }}
                              />
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                  <CreditCard className="w-4 h-4 text-slate-900" />
                                  Tarjeta de crédito / débito
                                </p>
                                <p className="text-xs text-slate-600">Pago seguro en línea. Procesado al instante.</p>
                              </div>
                            </label>

                            <label className={`border rounded-sm p-4 cursor-pointer flex items-start gap-3 transition ${form.paymentMethod === 'transferencia' ? 'border-slate-900 ring-1 ring-slate-900 bg-slate-50/60' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="transferencia"
                                className="mt-1"
                                checked={form.paymentMethod === 'transferencia'}
                                onChange={() => {
                                  setForm({ ...form, paymentMethod: 'transferencia' })
                                  setPaymentError(null)
                                  setPaymentReceipt(null)
                                }}
                              />
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                  Transferencia bancaria
                                </p>
                                <p className="text-xs text-slate-600">Adjunta el comprobante (voucher) para acelerar la verificación.</p>
                              </div>
                            </label>
                            
                          </div>
                        </div>

                        {form.paymentMethod === 'tarjeta' && (
                          <div className="rounded-lg border border-slate-900/10 bg-slate-900/[0.02] p-6 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">Detalles de la tarjeta</p>
                                <p className="text-xs text-slate-600">El cargo se procesará por <span className="font-medium">{subtotal.toLocaleString("es-DO", { style: "currency", currency: "DOP" })}</span>.</p>
                              </div>
                              <div className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-500">
                                <Lock className="w-3.5 h-3.5 text-slate-500" /> Pago cifrado y seguro
                              </div>
                            </div>

                            <div className="grid gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Número de tarjeta</label>
                                <input
                                  inputMode="numeric"
                                  autoComplete="cc-number"
                                  className={`w-full border rounded-sm px-4 py-3 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition ${cardErrors.cardNumber ? 'border-red-400' : 'border-slate-200'}`}
                                  placeholder="0000 0000 0000 0000"
                                  value={formatCardNumber(cardForm.cardNumber)}
                                  onChange={(e) => setCardForm(prev => ({ ...prev, cardNumber: sanitizeCardNumber(e.target.value) }))}
                                />
                                {cardErrors.cardNumber && <p className="text-[11px] text-red-600">{cardErrors.cardNumber}</p>}
                              </div>

                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Nombre en la tarjeta</label>
                                  <input
                                    autoComplete="cc-name"
                                    className={`w-full border rounded-sm px-4 py-3 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition ${cardErrors.name ? 'border-red-400' : 'border-slate-200'}`}
                                    placeholder="Como aparece en la tarjeta"
                                    value={cardForm.name}
                                    onChange={(e) => setCardForm(prev => ({ ...prev, name: e.target.value }))}
                                  />
                                  {cardErrors.name && <p className="text-[11px] text-red-600">{cardErrors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Correo de recibo</label>
                                  <input
                                    type="email"
                                    autoComplete="email"
                                    className={`w-full border rounded-sm px-4 py-3 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition ${cardErrors.email ? 'border-red-400' : 'border-slate-200'}`}
                                    placeholder="email@dominio.com"
                                    value={cardForm.email}
                                    onChange={(e) => setCardForm(prev => ({ ...prev, email: e.target.value }))}
                                  />
                                  {cardErrors.email && <p className="text-[11px] text-red-600">{cardErrors.email}</p>}
                                </div>
                              </div>

                              <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Mes</label>
                                  <select
                                    className={`w-full border rounded-sm px-4 py-3 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition ${cardErrors.expMonth ? 'border-red-400' : 'border-slate-200'}`}
                                    value={cardForm.expMonth}
                                    onChange={(e) => setCardForm(prev => ({ ...prev, expMonth: e.target.value }))}
                                  >
                                    <option value="">MM</option>
                                    {MONTH_OPTIONS.map(month => (
                                      <option key={month} value={month}>{month}</option>
                                    ))}
                                  </select>
                                  {cardErrors.expMonth && <p className="text-[11px] text-red-600">{cardErrors.expMonth}</p>}
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Año</label>
                                  <select
                                    className={`w-full border rounded-sm px-4 py-3 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition ${cardErrors.expYear ? 'border-red-400' : 'border-slate-200'}`}
                                    value={cardForm.expYear}
                                    onChange={(e) => setCardForm(prev => ({ ...prev, expYear: e.target.value }))}
                                  >
                                    <option value="">AAAA</option>
                                    {YEAR_OPTIONS.map(year => (
                                      <option key={year} value={year}>{year}</option>
                                    ))}
                                  </select>
                                  {cardErrors.expYear && <p className="text-[11px] text-red-600">{cardErrors.expYear}</p>}
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">CVV</label>
                                  <input
                                    inputMode="numeric"
                                    autoComplete="cc-csc"
                                    className={`w-full border rounded-sm px-4 py-3 text-sm bg-white focus:border-slate-400 focus:outline-none focus:ring-0 transition ${cardErrors.cvv ? 'border-red-400' : 'border-slate-200'}`}
                                    placeholder="000"
                                    maxLength={4}
                                    value={cardForm.cvv}
                                    onChange={(e) => setCardForm(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                                  />
                                  {cardErrors.cvv && <p className="text-[11px] text-red-600">{cardErrors.cvv}</p>}
                                </div>
                              </div>
                            </div>

                            {paymentError && (
                              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 font-medium">
                                {paymentError}
                              </div>
                            )}

                            {paymentReceipt && !paymentError && (
                              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{paymentReceipt.message}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {form.paymentMethod === 'transferencia' && (
                          <>
                            {/* Cuentas bancarias */}
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                Cuentas bancarias para transferencia
                                <span className="text-[10px] font-medium tracking-wide text-slate-500 uppercase">Confirma que el nombre coincida</span>
                              </h3>
                              <div className="grid gap-4 sm:grid-cols-2">
                                {bankAccounts.map(acc => (
                                  <div
                                    onClick={() => copyToClipboard('numero', acc.numero)}
                                    key={acc.id} className={` cursor-pointer relative rounded-md border p-4 bg-white shadow-sm hover:shadow transition group`}>
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="space-y-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-900 flex items-center gap-1">
                                          {acc.tipo}
                                          <span className="inline-block px-1.5 py-0.5 text-[10px] rounded bg-slate-100 text-slate-600 font-normal">{acc.currency}</span>
                                        </p>
                                        <button
                                          type="button"
                                          className="text-[11px] font-mono tracking-wide text-slate-800 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 hover:bg-slate-100 flex items-center gap-1"
                                          title="Copiar número de cuenta"
                                        >
                                          {acc.numero}
                                          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-9 8h10a2 2 0 002-2V8a2 2 0 00-2-2h-5l-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </button>
                                        <p className="text-[11px] text-slate-600 truncate" title={acc.banco}>{acc.banco}</p>
                                        <p className="text-[11px] text-slate-600 truncate" title={acc.nombre}>{acc.nombre}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                          <span className="text-[10px] text-slate-500">RNC:</span>
                                          <button
                                            type="button"
                                            onClick={() => copyToClipboard('rnc', acc.rnc)}
                                            className="text-[10px] font-medium text-slate-700 hover:text-slate-900 flex items-center gap-0.5"
                                            title="Copiar RNC"
                                          >
                                            {acc.rnc}
                                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-9 8h10a2 2 0 002-2V8a2 2 0 00-2-2h-5l-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    {copiedField && (copiedField === 'numero' + acc.numero || copiedField === 'rnc' + acc.rnc) && (
                                      <div className="absolute top-2 right-2 text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-sm font-medium shadow">Copiado</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed">
                                Una vez realices la transferencia, adjunta el comprobante o puedes enviarlo luego respondiendo al correo de confirmación. Verificaremos el pago y actualizaremos el estado de tu orden.
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                Voucher / Comprobante
                                <span className="text-xs font-normal text-slate-400">(imagen o PDF, máx 5MB)</span>
                              </label>

                              <div
                                className={`mt-1 rounded-md border text-sm transition relative ${voucherDragging ? 'border-slate-900 bg-slate-50' : 'border-dashed border-slate-300 hover:border-slate-400 bg-white'}`}
                                onDragOver={e => { e.preventDefault(); setVoucherDragging(true) }}
                                onDragLeave={() => setVoucherDragging(false)}
                                onDrop={e => {
                                  e.preventDefault();
                                  setVoucherDragging(false)
                                  const file = e.dataTransfer.files?.[0]
                                  handleVoucherFile(file)
                                }}
                              >
                                <input
                                  id="voucherInput"
                                  type="file"
                                  accept="image/*,application/pdf"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  onChange={e => handleVoucherFile(e.target.files?.[0])}
                                />
                                {!form.voucherFile && (
                                  <div className="flex flex-col items-center justify-center px-6 py-10 text-center select-none">
                                    <div className="">
                                      <File className="mb-2 opacity-35" />
                                    </div>
                                    <p className="text-slate-600 font-medium">Arrastra y suelta el archivo aquí</p>
                                    <p className="text-xs text-slate-500 mt-1">o haz clic para seleccionar</p>
                                    <p className="mt-3 text-[10px] uppercase tracking-wide text-slate-400">JPG · PNG · WEBP · PDF · Máx 5MB</p>
                                  </div>
                                )}
                                {form.voucherFile && (
                                  <div className="flex items-center gap-4 p-4">
                                    <div className="w-16 h-16 border border-slate-200 rounded-sm flex items-center justify-center overflow-hidden bg-slate-50">
                                      {form.voucherFile.type === 'application/pdf' ? (
                                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h10M7 12h10M7 17h6" />
                                        </svg>
                                      ) : (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={form.voucherPreview}
                                          alt="Voucher preview"
                                          className="object-cover w-full h-full"
                                        />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                      <p className="text-xs font-medium text-slate-900 truncate">{form.voucherFile.name}</p>
                                      <p className="text-[11px] text-slate-500">{Math.round(form.voucherFile.size / 1024)} KB • {form.voucherFile.type === 'application/pdf' ? 'PDF' : 'Imagen'}</p>
                                      <button
                                        type="button"
                                        onClick={() => handleVoucherFile(undefined)}
                                        className="text-[11px] font-medium text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Quitar
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {voucherError && <p className="mt-2 text-xs text-red-600 font-medium">{voucherError}</p>}
                              {!voucherError && form.voucherFile && (
                                <p className="mt-2 text-[11px] text-emerald-600 font-medium">Archivo listo para enviar.</p>
                              )}
                              <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                                Adjuntar el comprobante ayuda a acelerar la validación de tu pago por transferencia.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </section>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!isValid || submitting || creatingOrder || processingPayment}
                        className="inline-flex items-center gap-3 px-12 py-4 bg-slate-900 text-white font-semibold tracking-tight disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-all duration-200 rounded-sm shadow-sm hover:shadow-md"
                      >
                        {processingPayment ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando pago...
                          </>
                        ) : submitting || creatingOrder ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creando orden...
                          </>
                        ) : (
                          <>Crear orden</>
                        )}
                      </button>
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
                        <>
                          <p className="font-medium text-slate-700 mb-1">Creación de orden sin pago</p>
                          <p>Se generará una orden con tus datos para coordinar el pago y la entrega posteriormente.</p>
                        </>
                      </div>
                    </div>

                    {/* Información de pasarela eliminada */}
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
