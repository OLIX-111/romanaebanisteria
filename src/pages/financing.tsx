"use client"

import type React from "react"
import InputMask from "react-input-mask"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"

const openSans = Open_Sans({ subsets: ["latin"] })

type Currency = "DOP" | "USD" | "EUR"

const bankOptions = [
  "Banco Popular Dominicano",
  "Banco BHD León",
  "Banco de Reservas",
  "Scotiabank",
  "Banco Santa Cruz",
  "Banco Promerica",
  "Banco Vimenca",
  "Banco Ademi",
  "Banco Caribe",
  "Banco López de Haro",
]

interface FormData {
  saleAmount: string
  saleCurrency: Currency | ""
  downPayment: string
  idType: string
  idNumber: string
  fullName: string
  birthDate: string
  email: string
  phone: string
  monthlyIncome: string
  incomeCurrency: Currency | ""
  country: string
  bankOption1: string
  bankOption2: string
  acceptTerms: boolean
  certifyInfo: boolean
}

interface FormErrors {
  [key: string]: string
}

interface CartItemSummary {
  productId: number
  name: string
  qty: number
  price: number
  subtotal: number
  currency?: string
  image?: string
}

export default function FinancingPage() {
  const router = useRouter()
  const { amount, down, currency } = router.query

  const [form, setForm] = useState<FormData>({
    saleAmount: "",
    saleCurrency: (currency as Currency) || "",
    downPayment: "",
    idType: "",
    idNumber: "",
    fullName: "",
    birthDate: "",
    email: "",
    phone: "",
    monthlyIncome: "",
    incomeCurrency: (currency as Currency) || "",
    country: "",
    bankOption1: "",
    bankOption2: "",
    acceptTerms: false,
    certifyInfo: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cartItems, setCartItems] = useState<CartItemSummary[]>([])

  useEffect(() => {
    if (typeof amount === "string") {
      setForm((prev) => ({ ...prev, saleAmount: formatNumber(amount) }))
    }
    if (typeof down === "string") {
      setForm((prev) => ({ ...prev, downPayment: formatNumber(down) }))
    }
    if (typeof currency === "string") {
      setForm((prev) => ({
        ...prev,
        saleCurrency: currency as Currency,
        incomeCurrency: currency as Currency,
      }))
    }
    // Detectar fuente de financiamiento (producto vs carrito) y cargar items
    try {
      const source = typeof window !== "undefined" ? sessionStorage.getItem("financing_source") : null
      if (source === "product") {
        const rawItem = sessionStorage.getItem("product_financing_item")
        if (rawItem) {
          const item = JSON.parse(rawItem) as CartItemSummary
          if (item && item.name) setCartItems([item])
        }
      } else if (source === "cart") {
        const rawCart = sessionStorage.getItem("financing_cart_items")
        if (rawCart) {
          const items = JSON.parse(rawCart) as CartItemSummary[]
          if (Array.isArray(items)) setCartItems(items)
        }
      } else {
        // Fallback si no hay source: priorizar item de producto si existe
        const rawItem = sessionStorage.getItem("product_financing_item")
        if (rawItem) {
          const item = JSON.parse(rawItem) as CartItemSummary
          if (item && item.name) setCartItems([item])
        } else {
          const rawCart = sessionStorage.getItem("financing_cart_items")
          if (rawCart) {
            const items = JSON.parse(rawCart) as CartItemSummary[]
            if (Array.isArray(items)) setCartItems(items)
          }
        }
      }
    } catch {}
  }, [amount, down, currency])

  const formatNumber = (value: string | number): string => {
    const numeric = String(value).replace(/[^0-9]/g, "")
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const parseNumber = (value: string): number => {
    const n = Number(String(value).replace(/[^0-9.]/g, ""))
    return isNaN(n) ? 0 : n
  }

  const handleNumberInput = (key: keyof FormData) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: formatNumber(e.target.value) }))
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: "" }))
      }
    }
  }

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, phone: e.target.value }))
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }))
  }

  const handleInputChange = (key: keyof FormData) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value
      setForm((prev) => ({ ...prev, [key]: value as never }))
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: "" }))
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!derivedSaleAmount) {
      newErrors.saleAmount = "El monto solicitado es requerido"
    }
    if (!form.saleCurrency) {
      newErrors.saleCurrency = "La moneda es requerida"
    }
    if (!parseNumber(form.downPayment)) {
      newErrors.downPayment = "El pago inicial es requerido"
    }
    if (!form.idType) {
      newErrors.idType = "El tipo de identificación es requerido"
    }
    if (!form.idNumber.trim()) {
      newErrors.idNumber = "El número de identificación es requerido"
    }
    if (!form.fullName.trim()) {
      newErrors.fullName = "El nombre completo es requerido"
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.birthDate) || form.birthDate >= "2006-01-01") {
      newErrors.birthDate = "Selecciona una fecha válida anterior a 2006"
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Ingresa un correo electrónico válido"
    }
    if (!/^\+1\s\d{3}-\d{3}-\d{4}$/.test(form.phone)) {
      newErrors.phone = "Formato requerido: +1 809-XXX-XXXX"
    }
    if (!parseNumber(form.monthlyIncome)) {
      newErrors.monthlyIncome = "El ingreso mensual es requerido"
    }
    if (!form.incomeCurrency) {
      newErrors.incomeCurrency = "La moneda de ingreso es requerida"
    }
    if (!form.country.trim()) {
      newErrors.country = "El país de residencia es requerido"
    }
    if (!form.bankOption1) {
      newErrors.bankOption1 = "Selecciona la opción de banco 1"
    }
    if (!form.bankOption2) {
      newErrors.bankOption2 = "Selecciona la opción de banco 2"
    }
    if (form.bankOption1 && form.bankOption2 && form.bankOption1 === form.bankOption2) {
      newErrors.bankOption2 = "El banco 2 debe ser distinto al banco 1"
    }
    if (!form.acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los Términos de uso y la Política de privacidad"
    }
    if (!form.certifyInfo) {
      newErrors.certifyInfo = "Debes certificar que la información es correcta y autorizas la consulta"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const payload = {
        saleAmount: derivedSaleAmount,
        saleCurrency: form.saleCurrency,
        downPayment: parseNumber(form.downPayment),
        financedAmount: Math.max(0, derivedSaleAmount - parseNumber(form.downPayment)),
        idType: form.idType,
        idNumber: form.idNumber,
        fullName: form.fullName,
        birthDate: form.birthDate,
        email: form.email,
        phone: form.phone,
        monthlyIncome: parseNumber(form.monthlyIncome),
        incomeCurrency: form.incomeCurrency,
        country: form.country,
        bankOption1: form.bankOption1,
        bankOption2: form.bankOption2,
        acceptTerms: form.acceptTerms,
        certifyInfo: form.certifyInfo,
        cartItems,
      }

      const res = await fetch("/api/financing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || "No se pudo enviar la solicitud")
      }

      setSubmitted(true)
      try {
        sessionStorage.removeItem("financing_source")
        sessionStorage.removeItem("product_financing_item")
        sessionStorage.removeItem("financing_cart_items")
      } catch {}
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateFinancedAmount = () => {
    const sale = parseNumber(form.saleAmount)
    const down = parseNumber(form.downPayment)
    return sale - down
  }

  // Derivar automáticamente el monto desde los items (si existen)
  const derivedSaleAmount = cartItems.length
    ? cartItems.reduce((s, it) => s + (Number(it.subtotal) || (Number(it.price) || 0) * (Number(it.qty) || 0)), 0)
    : parseNumber(form.saleAmount)
  const formattedDerivedSaleAmount = formatNumber(derivedSaleAmount)

  return (
    <main className={openSans.className}>
      <Head>
        <title>Solicitud de Financiamiento | Romana Ebanistería</title>
        <meta name="description" content="Solicita financiamiento de manera rápida y segura" />
      </Head>
      <Header />
      <div className="container mx-auto mt-24 px-4 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl pt-12">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              {cartItems.length <= 1 ? "Financiamiento de producto" : "Financiamiento de carrito"}
            </h1>
            <p className="mt-2 text-sm text-gray-600">Completa el formulario para evaluar tu solicitud. Te contactaremos en 24 horas.</p>
          </div>

          {submitted ? (
            <div className="border border-gray-200 p-12 text-center">
              <h2 className="text-2xl font-semibold text-gray-900">¡Solicitud enviada!</h2>
              <p className="mt-4 text-sm text-gray-600">Hemos recibido tu información. Nuestro equipo la revisará y te contactará pronto.</p>
              <button onClick={() => router.push("/")} className="mt-8 bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40">Volver al inicio</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              {/* Form Fields */}
              <div className="lg:col-span-8 space-y-10">
                {/* Financial Information */}
                <section className="border border-gray-200 p-8 bg-white">
                  <h2 className="text-sm font-semibold tracking-wide text-gray-800">Información financiera</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Monto solicitado *</label>
                        <input
                          type="text"
                          value={formattedDerivedSaleAmount}
                          readOnly
                          placeholder="250,000"
                          className={`w-full border px-3 py-2.5 text-sm bg-gray-50 text-gray-700 focus:outline-none ${
                            errors.saleAmount ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors.saleAmount && <p className="text-sm text-red-600">{errors.saleAmount}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Moneda *</label>
                        <select
                          value={form.saleCurrency}
                          onChange={handleInputChange("saleCurrency")}
                          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            errors.saleCurrency ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
                          }`}
                        >
                          <option value="">Seleccionar moneda</option>
                          <option value="DOP">Peso Dominicano (DOP)</option>
                          <option value="USD">Dólar Estadounidense (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                        </select>
                        {errors.saleCurrency && <p className="text-sm text-red-600">{errors.saleCurrency}</p>}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700">Pago inicial *</label>
                        <input
                          type="text"
                          value={form.downPayment}
                          onChange={handleNumberInput("downPayment")}
                          placeholder="50,000"
                          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            errors.downPayment ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
                          }`}
                        />
                        <p className="text-xs text-gray-500">Recomendado: 20% del precio de venta</p>
                        {errors.downPayment && <p className="text-sm text-red-600">{errors.downPayment}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Opción de banco 1 *</label>
                        <select
                          value={form.bankOption1}
                          onChange={handleInputChange("bankOption1")}
                          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            errors.bankOption1 ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
                          }`}
                        >
                          <option value="">Seleccionar banco</option>
                          {bankOptions.map((bank) => (
                            <option key={bank} value={bank}>
                              {bank}
                            </option>
                          ))}
                        </select>
                        {errors.bankOption1 && <p className="text-sm text-red-600">{errors.bankOption1}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Opción de banco 2 *</label>
                        <select
                          value={form.bankOption2}
                          onChange={handleInputChange("bankOption2")}
                          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            errors.bankOption2 ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
                          }`}
                        >
                          <option value="">Seleccionar banco</option>
                          {bankOptions.map((bank) => (
                            <option key={bank} value={bank} disabled={form.bankOption1 === bank}>
                              {bank}
                            </option>
                          ))}
                        </select>
                        {errors.bankOption2 && <p className="text-sm text-red-600">{errors.bankOption2}</p>}
                      </div>
                    </div>
                  </section>

                  {/* Personal Information */}
                  <section className="border border-gray-200 p-8 bg-white">
                    <h2 className="text-sm font-semibold tracking-wide text-gray-800 mb-2">Información personal</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Tipo de identificación *</label>
                        <select
                          value={form.idType}
                          onChange={handleInputChange("idType")}
                          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            errors.idType ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
                          }`}
                        >
                          <option value="">Seleccionar tipo</option>
                          <option value="cedula">Cédula de Identidad</option>
                          <option value="pasaporte">Pasaporte</option>
                        </select>
                        {errors.idType && <p className="text-sm text-red-600">{errors.idType}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Número de identificación *</label>
                        <input
                          type="text"
                          value={form.idNumber}
                          onChange={handleInputChange("idNumber")}
                          placeholder="000-0000000-0"
                          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            errors.idNumber ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
                          }`}
                        />
                        {errors.idNumber && <p className="text-sm text-red-600">{errors.idNumber}</p>}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700">Nombre completo *</label>
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={handleInputChange("fullName")}
                          placeholder="Juan Pérez García"
                          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            errors.fullName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
                          }`}
                        />
                        {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Fecha de nacimiento *</label>
                        <input
                          type="date"
                          value={form.birthDate}
                          onChange={handleInputChange("birthDate")}
                          max="2005-12-31"
                          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            errors.birthDate ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
                          }`}
                        />
                        {errors.birthDate && <p className="text-sm text-red-600">{errors.birthDate}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">País de residencia *</label>
                        <select
                          value={form.country}
                          onChange={handleInputChange("country")}
                          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            errors.country ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
                          }`}
                        >
                          <option value="">Seleccionar país</option>
                          <option value="República Dominicana">República Dominicana</option>
                          <option value="Estados Unidos">Estados Unidos</option>
                        </select>
                        {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
                      </div>
                    </div>
                  </section>

                  {/* Contact & Income Information */}
                  <section className="border border-gray-200 p-8 bg-white">
                    <h2 className="text-sm font-semibold tracking-wide text-gray-800 mb-2">Contacto e ingresos</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Correo electrónico *</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={handleInputChange("email")}
                          placeholder="nombre@correo.com"
                          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
                          }`}
                        />
                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Número de contacto *</label>
                        <InputMask
                          mask="+1 999-999-9999"
                          value={form.phone}
                          onChange={handlePhoneInput}
                        >
                          {(inputProps: any) => (
                            <input
                              {...inputProps}
                              type="text"
                              placeholder="+1 809-XXX-XXXX"
                              className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                                errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
                              }`}
                            />
                          )}
                        </InputMask>
                        {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Ingreso mensual *</label>
                        <input
                          type="text"
                          value={form.monthlyIncome}
                          onChange={handleNumberInput("monthlyIncome")}
                          placeholder="50,000"
                          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            errors.monthlyIncome ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
                          }`}
                        />
                        {errors.monthlyIncome && <p className="text-sm text-red-600">{errors.monthlyIncome}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Moneda de ingreso *</label>
                        <select
                          value={form.incomeCurrency}
                          onChange={handleInputChange("incomeCurrency")}
                          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            errors.incomeCurrency ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
                          }`}
                        >
                          <option value="">Seleccionar moneda</option>
                          <option value="DOP">Peso Dominicano (DOP)</option>
                          <option value="USD">Dólar Estadounidense (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                        </select>
                        {errors.incomeCurrency && <p className="text-sm text-red-600">{errors.incomeCurrency}</p>}
                      </div>
                    </div>
                  </section>

                  {/* Consents */}
                  <section className="border border-gray-200 p-8 bg-white">
                    <h2 className="text-sm font-semibold tracking-wide text-gray-800 mb-2">Consentimientos</h2>
                    <div className="space-y-6">
                      <label className="flex items-start gap-3 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={form.acceptTerms}
                          onChange={handleInputChange("acceptTerms")}
                          className={`mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${
                            errors.acceptTerms ? "border-red-500" : ""
                          }`}
                        />
                        <span>
                          Acepto los <a className="underline" href="/terms" target="_blank" rel="noopener noreferrer">Términos de uso</a> y la <a className="underline" href="/privacy" target="_blank" rel="noopener noreferrer">Política de privacidad</a>.
                        </span>
                      </label>
                      {errors.acceptTerms && <p className="text-sm text-red-600">{errors.acceptTerms}</p>}

                      <label className="flex items-start gap-3 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={form.certifyInfo}
                          onChange={handleInputChange("certifyInfo")}
                          className={`mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${
                            errors.certifyInfo ? "border-red-500" : ""
                          }`}
                        />
                        <span>
                          Certifico que la información proporcionada anteriormente es correcta, autorizo a nosotros y a las entidades de intermediación financiera a validarla y consultar mi historial crediticio en las bases de datos de los burós de información nacionales o internacionales que considere.
                        </span>
                      </label>
                      {errors.certifyInfo && <p className="text-sm text-red-600">{errors.certifyInfo}</p>}
                    </div>
                  </section>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-4">
                  <div className="sticky top-8">
                    <div className="border border-gray-200 p-8 bg-white">
                      <h3 className="text-sm font-semibold tracking-wide text-gray-800">Resumen de solicitud</h3>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Monto solicitado</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {form.saleCurrency} {formattedDerivedSaleAmount || "—"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Pago inicial</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {form.saleCurrency} {form.downPayment || "—"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-3">
                          <span className="text-sm text-gray-600">Monto a financiar</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {form.saleCurrency}{" "}
                            {(() => {
                              const financed = Math.max(0, derivedSaleAmount - parseNumber(form.downPayment))
                              return financed > 0 ? formatNumber(financed.toString()) : "—"
                            })()}
                          </span>
                        </div>
                        {cartItems.length > 0 && (
                          <div className="mt-4 border-t border-gray-100 pt-4">
                            <h4 className="text-xs font-semibold tracking-wide text-gray-700 mb-3">Carrito a financiar</h4>
                            <ul className="space-y-2">
                              {cartItems.slice(0, 5).map((ci, idx) => (
                                <li key={idx} className="flex items-center justify-between text-xs text-gray-700">
                                  <span className="truncate pr-2">{ci.name} × {ci.qty}</span>
                                  <span className="font-medium">
                                    {new Intl.NumberFormat("es-DO", { style: "currency", currency: form.saleCurrency || "DOP" }).format(ci.subtotal || (ci.price || 0) * (ci.qty || 0))}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            {cartItems.length > 5 && (
                              <p className="mt-2 text-[11px] text-gray-500">y {cartItems.length - 5} más…</p>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="mt-6 text-xs text-gray-500">Tus datos serán utilizados únicamente para evaluar tu solicitud.</p>

                      <button type="submit" disabled={isSubmitting} className={`mt-8 w-full bg-primary px-6 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary/40 ${isSubmitting ? "opacity-50" : "hover:bg-primary/90"}`}>
                        {isSubmitting ? "Enviando solicitud..." : "Enviar solicitud"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
