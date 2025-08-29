"use client"

import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import { Open_Sans } from "next/font/google"
import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { X } from "lucide-react"

const openSans = Open_Sans({ subsets: ["latin"] })

interface CartItem {
  id: number
  product_id: number
  name: string
  desc: string
  image: string
  price: number
  compare_price: number
  currency: string
  num: number
  subtotal: number
}

interface Cart {
  id: number
  created_at: string
  updated_at: string
  items: CartItem[]
  num_of_items: number
  total_price: number
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar carrito desde localStorage
  const loadLocalCart = useCallback(() => {
    try {
      const raw = localStorage.getItem("cart_items")
      const items: any[] = raw ? JSON.parse(raw) : []
      const mapped: Cart = {
        id: 0,
        created_at: "",
        updated_at: "",
        items: items as any,
        num_of_items: items.reduce((s, it) => s + (it.num || 0), 0),
        total_price: items.reduce((s, it) => s + (it.subtotal || 0), 0)
      }
      setCart(mapped)
      try { window.dispatchEvent(new Event("cart-updated")) } catch {}
    } catch {
      setCart({ id: 0, created_at: "", updated_at: "", items: [], num_of_items: 0, total_price: 0 })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLocalCart()
  }, [loadLocalCart])

  // Función para remover un ítem (se utiliza product_id como variant_id)
  const removeItem = (variant_id: number) => {
    try {
      const raw = localStorage.getItem("cart_items")
      const items: any[] = raw ? JSON.parse(raw) : []
      const filtered = items.filter(it => (it.variant_id || it.id) !== variant_id)
      localStorage.setItem("cart_items", JSON.stringify(filtered))
      loadLocalCart()
      try { window.dispatchEvent(new Event("cart-updated")) } catch {}
    } catch (e) {
      console.error("Error al remover localmente:", e)
    }
  }

  // Función para vaciar el carrito
  const clearCart = () => {
    try {
      localStorage.removeItem("cart_items")
      loadLocalCart()
      try { window.dispatchEvent(new Event("cart-updated")) } catch {}
    } catch (e) {
      console.error("Error al limpiar carrito local:", e)
    }
  }

  // Calcular resumen del pedido a partir de los ítems del carrito
  const orderSummary = cart
    ? {
        subtotal: cart.items.reduce((sum, item) => sum + item.price * item.num, 0),
        tax: cart.items.reduce((sum, item) => sum + item.price * item.num, 0) * 0.0,
        total: cart.items.reduce((sum, item) => sum + item.price * item.num, 0) * 1.0,
      }
    : { subtotal: 0, tax: 0, total: 0 }

  // Función para proceder al checkout
  const checkout = () => {
    console.log("Procediendo al checkout", { cart, summary: orderSummary })
    // Aquí iría la lógica para redirigir al proceso de pago
    window.location.href = "/checkout" // O la ruta que corresponda
  }

  if (loading) {
    return <div className="text-center mt-8">Cargando carrito...</div>
  }

  // Removed error rendering condition
  // if (error) {
  //   return <div className="text-center mt-8 text-red-500">{error}</div>
  // }

  // Añadir esta constante cerca del inicio de la función del componente
  const isCartEmpty = !cart || cart.items.length === 0

  return (
    <main className={openSans.className}>
      <Header />
      <div className="container mx-auto px-4 py-12 mt-24">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Carrito</h1>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-0 divide-y divide-gray-200 border border-gray-200">
            {cart && cart.items.length > 0 ? (
              cart.items.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-28 h-28 border border-gray-200 flex-shrink-0">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} width={112} height={112} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-sm font-medium text-gray-900 leading-6">{item.name}</h3>
                        <button onClick={() => removeItem(item.product_id)} className="text-gray-500 hover:text-gray-800"><X size={18} /></button>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="text-gray-700">Cantidad: {item.num}</div>
                        <div className="font-semibold text-gray-900">{new Intl.NumberFormat("es-DO", { style: "currency", currency: item.currency || "DOP" }).format(item.price * item.num)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-sm text-gray-600">No hay productos en el carrito.</div>
            )}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 p-6">
              <h2 className="text-sm font-semibold tracking-wide text-gray-800">Resumen</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(orderSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Impuestos</span>
                  <span>{new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(orderSummary.tax)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(orderSummary.total)}</span>
                </div>
              </div>
              <button onClick={checkout} disabled={isCartEmpty} className={`mt-6 w-full ${isCartEmpty ? "bg-gray-400" : "bg-primary hover:bg-primary/90"} px-6 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary/40`}>
                Proceder al pago
              </button>
              <button onClick={clearCart} disabled={isCartEmpty} className={`mt-3 w-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 ${isCartEmpty ? "opacity-50 cursor-not-allowed" : ""}`}>
                Vaciar carrito
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

