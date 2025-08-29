"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/router"
import { Loader2 } from "lucide-react"

const openSans = Open_Sans({ subsets: ["latin"] })

interface CartItem {
  id: number
  name: string
  image: string
  price: number
  num: number
  variant_id: number
}

interface FormErrors {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  address?: string
  suburb?: string
  state?: string
  postcode?: string
  country?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [userNs, setUserNs] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [cart, setCart] = useState<{ items: CartItem[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [placing, setPlacing] = useState(false)

  const [shippingMethod, setShippingMethod] = useState("delivery")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    suburb: "",
    state: "",
    postcode: "",
    country: "",
  })

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "first_name":
        if (!value.trim()) return "El nombre es requerido"
        if (value.trim().length < 2) return "El nombre debe tener al menos 2 caracteres"
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "El nombre solo puede contener letras"
        return undefined

      case "last_name":
        if (!value.trim()) return "El apellido es requerido"
        if (value.trim().length < 2) return "El apellido debe tener al menos 2 caracteres"
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "El apellido solo puede contener letras"
        return undefined

      case "email":
        if (!value.trim()) return "El email es requerido"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return "Ingresa un email válido"
        return undefined

      case "phone":
        if (!value.trim()) return "El teléfono es requerido"
        const phoneRegex = /^[\d\s\-+$$$$]+$/
        if (!phoneRegex.test(value)) return "Ingresa un teléfono válido"
        if (value.replace(/\D/g, "").length < 10) return "El teléfono debe tener al menos 10 dígitos"
        return undefined

      case "address":
        if (!value.trim()) return "La dirección es requerida"
        if (value.trim().length < 5) return "La dirección debe tener al menos 5 caracteres"
        return undefined

      case "suburb":
        if (!value.trim()) return "El sector es requerido"
        if (value.trim().length < 2) return "El sector debe tener al menos 2 caracteres"
        return undefined

      case "state":
        if (!value.trim()) return "La provincia/estado es requerida"
        if (value.trim().length < 2) return "La provincia/estado debe tener al menos 2 caracteres"
        return undefined

      case "postcode":
        if (!value.trim()) return "El código postal es requerido"
        if (!/^\d{5}(-\d{4})?$/.test(value)) return "Ingresa un código postal válido (ej: 12345)"
        return undefined

      case "country":
        if (!value.trim()) return "El país es requerido"
        if (value.trim().length < 2) return "El país debe tener al menos 2 caracteres"
        return undefined

      default:
        return undefined
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key as keyof typeof form])
      if (error) newErrors[key as keyof FormErrors] = error
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))

    // Real-time validation for touched fields
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, form[name as keyof typeof form])
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  useEffect(() => {
    const ns = localStorage.getItem("falitech_user_ns")
    if (!ns) {
      router.replace("/login?returnTo=/checkout")
      return
    }
    setUserNs(ns)
  }, [router])

  useEffect(() => {
    async function load() {
      if (!userNs) return
      try {
        // Fetch only user info from API; cart is read from localStorage
        const userRes = await fetch(`/api/ecommerce/subscriber-info?user_ns=${encodeURIComponent(userNs)}`)
        const userJson = userRes.ok ? await userRes.json() : null
        const u = userJson?.data
        setUser(u)
        setForm((f) => ({
          ...f,
          first_name: u?.first_name || "",
          last_name: u?.last_name || "",
          email: u?.email || "",
          phone: u?.phone || "",
          address: u?.address || "",
          suburb: u?.suburb || "",
          state: u?.state || "",
          postcode: u?.postcode || "",
          country: u?.country || "",
        }))
        // Load cart from localStorage
        try {
          const raw = localStorage.getItem("cart_items")
          const items: any[] = raw ? JSON.parse(raw) : []
          setCart({ items: items as any })
        } catch {
          setCart({ items: [] as any })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userNs])

  const summary = useMemo(() => {
    const subtotal = (cart?.items || []).reduce((s, it) => s + it.price * it.num, 0)
    const delivery = shippingMethod === "delivery" ? 0 : 0
    const total = subtotal + delivery
    return { subtotal, delivery, total }
  }, [cart, shippingMethod])

  async function placeOrder() {
    if (!cart || placing) return

    if (!validateForm()) {
      // Mark all fields as touched to show errors
      const allTouched = Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      setTouched(allTouched)
      return
    }

    setPlacing(true)
    // Simulate payment/order using local cart
    const orderNo = Math.floor(1000 + Math.random() * 9000)
    const subtotal = (cart.items || []).reduce((s, it) => s + it.price * it.num, 0)
    const data = {
      data: {
        order_no: orderNo,
        subtotal,
        discount_total: 0,
        total: subtotal,
        currency: "DOP",
        contact_email: form.email,
        items: (cart.items || []).map((it: any) => ({
          id: it.variant_id || it.id,
          variant_id: it.variant_id || it.id,
          product_id: it.product_id || it.id,
          name: it.name,
          desc: it.desc || "",
          image: it.image,
          price: it.price,
          currency: "DOP",
          num: it.num,
          subtotal: it.price * it.num,
          sku: it.sku || "",
        })),
      },
      status: "ok",
    }
    try {
      sessionStorage.setItem("last_order", JSON.stringify(data))
      // Clear local cart on successful simulation
      localStorage.removeItem("cart_items")
      // Fire email notifications (best-effort)
      try {
        await fetch("/api/ecommerce/send-order-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: data, toEmail: form.email || user?.email || "" }),
        })
      } catch {}
      router.replace("/order-confirmation")
    } catch (e) {
      alert("No se pudo procesar el pago simulado")
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return <div className="mt-24 text-center">Cargando...</div>

  return (
    <main className={openSans.className}>
      <Header />
      <div className="container mx-auto mt-24 px-4 py-12 lg:px-8 max-w-7xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-800 mb-2">Finalizar Compra</h1>
          <p className="text-lg text-gray-600">Complete su información para procesar el pedido</p>
        </div>

        <div className="grid gap-16 lg:grid-cols-3">
          <div className={`lg:col-span-2 space-y-12 ${placing ? 'opacity-60 pointer-events-none' : ''}`} aria-busy={placing}>
            {/* Contact Information */}
            <section className="bg-white border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Información de Contacto</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    onBlur={() => handleBlur("first_name")}
                    className={`w-full border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      errors.first_name && touched.first_name
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary focus:ring-primary"
                    }`}
                    placeholder="Ingresa tu nombre"
                  />
                  {errors.first_name && touched.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellido *</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    onBlur={() => handleBlur("last_name")}
                    className={`w-full border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      errors.last_name && touched.last_name
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary focus:ring-primary"
                    }`}
                    placeholder="Ingresa tu apellido"
                  />
                  {errors.last_name && touched.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={`w-full border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      errors.email && touched.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary focus:ring-primary"
                    }`}
                    placeholder="ejemplo@correo.com"
                  />
                  {errors.email && touched.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    onBlur={() => handleBlur("phone")}
                    className={`w-full border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      errors.phone && touched.phone
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary focus:ring-primary"
                    }`}
                    placeholder="(809) 123-4567"
                  />
                  {errors.phone && touched.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section className="bg-white border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Dirección de Envío</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    onBlur={() => handleBlur("address")}
                    className={`w-full border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      errors.address && touched.address
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary focus:ring-primary"
                    }`}
                    placeholder="Calle, número, apartamento"
                  />
                  {errors.address && touched.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sector *</label>
                  <input
                    type="text"
                    value={form.suburb}
                    onChange={(e) => handleInputChange("suburb", e.target.value)}
                    onBlur={() => handleBlur("suburb")}
                    className={`w-full border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      errors.suburb && touched.suburb
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary focus:ring-primary"
                    }`}
                    placeholder="Nombre del sector"
                  />
                  {errors.suburb && touched.suburb && <p className="mt-1 text-sm text-red-600">{errors.suburb}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provincia/Estado *</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    onBlur={() => handleBlur("state")}
                    className={`w-full border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      errors.state && touched.state
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary focus:ring-primary"
                    }`}
                    placeholder="Santo Domingo, Santiago, etc."
                  />
                  {errors.state && touched.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal *</label>
                  <input
                    type="text"
                    value={form.postcode}
                    onChange={(e) => handleInputChange("postcode", e.target.value)}
                    onBlur={() => handleBlur("postcode")}
                    className={`w-full border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      errors.postcode && touched.postcode
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary focus:ring-primary"
                    }`}
                    placeholder="10101"
                  />
                  {errors.postcode && touched.postcode && (
                    <p className="mt-1 text-sm text-red-600">{errors.postcode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">País *</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    onBlur={() => handleBlur("country")}
                    className={`w-full border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      errors.country && touched.country
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary focus:ring-primary"
                    }`}
                    placeholder="República Dominicana"
                  />
                  {errors.country && touched.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
                </div>
              </div>
            </section>

            {/* Shipping & Payment Methods */}
            <section className="bg-white border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Métodos de Envío y Pago</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Método de Envío</label>
                  <select
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                  >
                    <option value="pickup">Retiro en tienda</option>
                    <option value="delivery">Entrega a domicilio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                  >
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-gray-50 border border-gray-200 p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Resumen del Pedido</h2>

                <div className="space-y-4 mb-6">
                  {(cart?.items || []).map((it) => (
                    <div
                      key={it.id}
                      className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
                    >
                      <div className="w-16 h-16 border border-gray-200 bg-white flex-shrink-0">
                        <Image
                          src={it.image || "/placeholder.svg"}
                          alt={it.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{it.name}</h3>
                        <p className="text-sm text-gray-600">Cantidad: {it.num}</p>
                        <p className="text-sm font-semibold text-gray-800 mt-1">
                          {new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
                            it.price * it.num,
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>
                      {new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(summary.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Envío</span>
                    <span>{shippingMethod === "delivery" ? "Incluido" : "—"}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-gray-800 pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span>
                      {new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(summary.total)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className={`w-full px-6 py-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors ${placing ? 'bg-gray-400' : 'bg-primary hover:bg-gray-800'}`}
                >
                  {placing ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Procesando pago...
                    </span>
                  ) : (
                    'Realizar Pedido'
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Al realizar el pedido, aceptas nuestros términos y condiciones
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </main>
  )
}
