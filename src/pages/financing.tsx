"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"

const openSans = Open_Sans({ subsets: ["latin"] })

type Currency = "DOP" | "USD" | "EUR"

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
}

interface FormErrors {
  [key: string]: string
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
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    const digits = e.target.value.replace(/\D/g, "")
    let formatted = "+1 "
    if (digits.length > 0) formatted += digits.substring(0, 3)
    if (digits.length > 3) formatted += "-" + digits.substring(3, 6)
    if (digits.length > 6) formatted += "-" + digits.substring(6, 10)

    setForm((prev) => ({ ...prev, phone: formatted }))
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }))
    }
  }

  const handleInputChange = (key: keyof FormData) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: "" }))
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!parseNumber(form.saleAmount)) {
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
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.birthDate)) {
      newErrors.birthDate = "Formato requerido: dd/mm/yyyy"
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setSubmitted(true)
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
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Solicitud de financiamiento</h1>
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
                          value={form.saleAmount}
                          onChange={handleNumberInput("saleAmount")}
                          placeholder="250,000"
                          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            errors.saleAmount ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
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
                          <option value="USD">Dólar Americano (USD)</option>
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
                          type="text"
                          value={form.birthDate}
                          onChange={handleInputChange("birthDate")}
                          placeholder="dd/mm/yyyy"
                          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            errors.birthDate ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
                          }`}
                        />
                        {errors.birthDate && <p className="text-sm text-red-600">{errors.birthDate}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">País de residencia *</label>
                        <input
                          type="text"
                          value={form.country}
                          onChange={handleInputChange("country")}
                          placeholder="República Dominicana"
                          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            errors.country ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
                          }`}
                        />
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
                        <input
                          type="text"
                          value={form.phone}
                          onChange={handlePhoneInput}
                          placeholder="+1 809-XXX-XXXX"
                          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-900"
                          }`}
                        />
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
                          <option value="USD">Dólar Americano (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                        </select>
                        {errors.incomeCurrency && <p className="text-sm text-red-600">{errors.incomeCurrency}</p>}
                      </div>
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
                            {form.saleCurrency} {form.saleAmount || "—"}
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
                            {calculateFinancedAmount() > 0 ? formatNumber(calculateFinancedAmount().toString()) : "—"}
                          </span>
                        </div>
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
