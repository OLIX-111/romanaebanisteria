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
  // const [error, setError] = useState("") // Removed error state

  // Función para obtener el carrito desde la API interna
  const fetchCart = useCallback(async () => {
    const user_ns = localStorage.getItem("falitech_user_ns")
    if (!user_ns) {
      setCart(null)
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`/api/ecommerce/cart?user_ns=${encodeURIComponent(user_ns)}`)
      if (!res.ok) {
        setCart(null)
      } else {
        const data = await res.json()
        setCart(data)
      }
    } catch (err: any) {
      setCart(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Función para remover un ítem (se utiliza product_id como variant_id)
  const removeItem = async (variant_id: number) => {
    const user_ns = localStorage.getItem("falitech_user_ns")
    if (!user_ns) return
    try {
      const res = await fetch("/api/ecommerce/cart-item", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_ns, variant_id }),
      })
      if (!res.ok) {
        console.error("Error al remover el ítem")
      }
      await res.json()
      // Actualizamos el carrito después de remover
      fetchCart()
    } catch (err: any) {
      console.error("Error al remover el ítem:", err.message || "Error desconocido")
      fetchCart() // Actualizamos el carrito de todas formas para mantener la sincronización
    }
  }

  // Función para vaciar el carrito
  const clearCart = async () => {
    const user_ns = localStorage.getItem("falitech_user_ns")
    if (!user_ns) return
    try {
      const res = await fetch("/api/ecommerce/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_ns }),
      })
      if (!res.ok) {
        console.error("Error al vaciar el carrito")
      }
      await res.json()
      fetchCart()
    } catch (err: any) {
      console.error("Error al vaciar el carrito:", err.message || "Error desconocido")
      fetchCart() // Actualizamos el carrito de todas formas para mantener la sincronización
    }
  }

  // Calcular resumen del pedido a partir de los ítems del carrito
  const orderSummary = cart
    ? {
        subtotal: cart.items.reduce((sum, item) => sum + item.price * item.num, 0),
        tax: cart.items.reduce((sum, item) => sum + item.price * item.num, 0) * 0.025, // 2.5% de impuestos
        total: cart.items.reduce((sum, item) => sum + item.price * item.num, 0) * 1.025,
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
      <div className="max-w-6xl mx-auto px-4 py-8 mt-24">
        <h1 className="text-3xl font-bold mb-8 uppercase">CARRITO DE COMPRA</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-6">
            {cart && cart.items.length > 0 ? (
              cart.items.map((item) => (
                <div key={item.id} className="border-b pb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Imagen del producto */}
                    <div className="w-32 h-32 border flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {/* Detalles del producto */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-lg mb-2">{item.name}</h3>
                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="flex justify-between items-center">
                          <div className="text-right">
                            <span className="font-medium">${(item.price * item.num).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div>No hay productos en el carrito.</div>
            )}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="border p-6">
              <h2 className="text-lg font-medium mb-4">RESUMEN DEL PEDIDO</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span>${orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IMPUESTOS</span>
                  <span>${orderSummary.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>TOTAL</span>
                  <span>${orderSummary.total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={checkout}
                disabled={isCartEmpty}
                className={`w-full py-3 uppercase font-medium transition-colors ${
                  isCartEmpty ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                FINALIZAR COMPRA
              </button>
              <button
                onClick={clearCart}
                disabled={isCartEmpty}
                className={`mt-4 w-full border py-3 uppercase font-medium transition-colors ${
                  isCartEmpty ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:bg-gray-50"
                }`}
              >
                Vaciar Carrito
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

