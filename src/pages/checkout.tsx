"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/router"

const openSans = Open_Sans({ subsets: ["latin"] })

interface CartItem { id: number; name: string; image: string; price: number; num: number; variant_id: number }

export default function CheckoutPage() {
  const router = useRouter()
  const [userNs, setUserNs] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [cart, setCart] = useState<{ items: CartItem[] } | null>(null)
  const [loading, setLoading] = useState(true)

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
    country: ""
  })

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
        const [userRes, cartRes] = await Promise.all([
          fetch(`/api/ecommerce/subscriber-info?user_ns=${encodeURIComponent(userNs)}`),
          fetch(`/api/ecommerce/cart?user_ns=${encodeURIComponent(userNs)}`)
        ])
        const userJson = userRes.ok ? await userRes.json() : null
        const cartJson = cartRes.ok ? await cartRes.json() : null
        const u = userJson?.data
        setUser(u)
        setForm(f => ({
          ...f,
          first_name: u?.first_name || "",
          last_name: u?.last_name || "",
          email: u?.email || "",
          phone: u?.phone || "",
          address: u?.address || "",
          suburb: u?.suburb || "",
          state: u?.state || "",
          postcode: u?.postcode || "",
          country: u?.country || ""
        }))
        setCart(cartJson)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userNs])

  const summary = useMemo(() => {
    const subtotal = (cart?.items || []).reduce((s, it) => s + (it.price * it.num), 0)
    const delivery = shippingMethod === "delivery" ? 0 : 0
    const total = subtotal + delivery
    return { subtotal, delivery, total }
  }, [cart, shippingMethod])

  async function placeOrder() {
    if (!userNs || !cart) return
    const payload = {
      user_ns: userNs,
      status: "ordered",
      shipping_method: shippingMethod,
      payment_method: paymentMethod,
      reference_no: "",
      note: "",
      address: form.address,
      suburb: form.suburb,
      state: form.state,
      postcode: form.postcode,
      country: form.country,
      items: cart.items.map(it => ({ variant_id: it.variant_id || it.id, qty: it.num || 1 }))
    }
    const res = await fetch("/api/ecommerce/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      alert("No se pudo crear la orden")
      return
    }
    const data = await res.json()
    sessionStorage.setItem("last_order", JSON.stringify(data))
    router.replace("/order-confirmation")
  }

  if (loading) return <div className="mt-24 text-center">Cargando...</div>

  return (
    <main className={openSans.className}>
      <Header />
      <div className="container mx-auto mt-24 px-4 py-12 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Checkout</h1>
        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          {/* Left: forms */}
          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-semibold tracking-wide text-gray-800">Datos de contacto</h2>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="text-xs text-gray-700">Nombre
                  <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                </label>
                <label className="text-xs text-gray-700">Apellido
                  <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                </label>
                <label className="text-xs text-gray-700">Email
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                </label>
                <label className="text-xs text-gray-700">Teléfono
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                </label>
              </div>
            </section>
            <section>
              <h2 className="text-sm font-semibold tracking-wide text-gray-800">Dirección de envío</h2>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="text-xs text-gray-700">Dirección
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                </label>
                <label className="text-xs text-gray-700">Sector
                  <input value={form.suburb} onChange={(e) => setForm({ ...form, suburb: e.target.value })} className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                </label>
                <label className="text-xs text-gray-700">Provincia/Estado
                  <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                </label>
                <label className="text-xs text-gray-700">Código Postal
                  <input value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                </label>
                <label className="text-xs text-gray-700">País
                  <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                </label>
              </div>
            </section>
            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <label className="text-xs text-gray-700">Método de envío
                <select value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)} className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
                  <option value="pickup">Retiro en tienda</option>
                  <option value="delivery">Entrega a domicilio</option>
                </select>
              </label>
              <label className="text-xs text-gray-700">Método de pago
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                </select>
              </label>
            </section>
          </div>

          {/* Right: summary */}
          <aside>
            <div className="border border-gray-200 p-6">
              <h2 className="text-sm font-semibold tracking-wide text-gray-800">Resumen del pedido</h2>
              <ul className="mt-4 space-y-4">
                {(cart?.items || []).map((it) => (
                  <li key={it.id} className="flex items-center gap-4">
                    <div className="h-16 w-16 border border-gray-200">
                      <Image src={it.image || "/placeholder.svg"} alt={it.name} width={64} height={64} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 line-clamp-1">{it.name}</p>
                      <p className="text-xs text-gray-600">Cantidad: {it.num}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(it.price * it.num)}</div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(summary.subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Envío</span><span>{shippingMethod === "delivery" ? "Incluido" : "—"}</span></div>
                <div className="flex justify-between border-t border-gray-200 pt-3 font-semibold text-gray-900"><span>Total</span><span>{new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(summary.total)}</span></div>
              </div>
              <button onClick={placeOrder} className="mt-6 w-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40">Realizar pedido</button>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </main>
  )
}


