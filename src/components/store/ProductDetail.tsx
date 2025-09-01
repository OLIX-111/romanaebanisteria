"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Package, Truck, Tag } from "lucide-react"
import Link from "next/link"

// --------------------------------------------------
// Definiciones de Tipos
// --------------------------------------------------
interface Variant {
  id: number
  name: string
  price: number
  image: string
  sku: string
}

interface Product {
  id: number
  name: string
  image: string
  price: number
  description: string
  type: string
  vendor: string
  variants: Variant[]
}

interface ProductDetailProps {
  product: Product
}

// --------------------------------------------------
// Componente Principal
// --------------------------------------------------
export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    product.variants && product.variants.length > 0
      ? product.variants[0]
      : // si no hay variants, creamos una 'falsa'
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          sku: ""
        }
  )

  // Manejo de modal (para pedir datos de usuario si no tenemos user_ns)
  const [showModal, setShowModal] = useState(false)
  // Datos del usuario para crear subscriber
  const [userName, setUserName] = useState("")
  const [userPhone, setUserPhone] = useState("")

  // Loading / feedback
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  // --------------------------------------------------
  // Handler: Clic en Agregar al Carrito
  // --------------------------------------------------
  const handleAddToCart = async () => {
    const userNs = localStorage.getItem("falitech_user_ns")
    if (!userNs) {
      // No tenemos user_ns => abrimos modal para registrar subscriber
      setShowModal(true)
    } else {
      // user_ns existe => agregar directamente
      await addProductToCart(userNs)
    }
  }

  // --------------------------------------------------
  // Lógica para crear Subscriber y luego agregar producto
  // --------------------------------------------------
  const handleCreateSubscriber = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg("")

    try {
      // 1) Llamar a nuestro endpoint interno que crea subscriber
      const res = await fetch("/api/ecommerce/subscriber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Falitech requiere phone o email, usaremos phone para el ejemplo
          first_name: userName.trim() || "Cliente",
          last_name: "",
          phone: userPhone.trim()
        })
      })
      if (!res.ok) {
        throw new Error("Error creando subscriber")
      }
      const data = await res.json()
      const userNs = data.data.user_ns
      console.log(data)
      if (!userNs) {
        throw new Error("No se recibió user_ns del servidor")
      }

      // Guardar en localStorage
      localStorage.setItem("falitech_user_ns", userNs)

      // 2) Agregar el producto
      await addProductToCart(userNs)

      // 3) Cerrar modal
      setShowModal(false)
      setUserName("")
      setUserPhone("")
    } catch (err: any) {
      console.error("Error al crear subscriber:", err)
      setErrorMsg(err.message || "Ocurrió un error desconocido")
    } finally {
      setIsSubmitting(false)
    }
  }

  // --------------------------------------------------
  // Función para agregar el producto al carrito
  // --------------------------------------------------
  const addProductToCart = async (userNs: string) => {
    try {
      const res = await fetch("/api/ecommerce/cart-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_ns: userNs,
          variant_id: selectedVariant.id,
          qty: 1
        })
      })
      if (!res.ok) {
        throw new Error("Error al agregar producto al carrito")
      }
      const result = await res.json()
      console.log("Producto agregado con éxito:", result)
      alert(`Se agregó "${selectedVariant.name}" al carrito.`)
    } catch (error: any) {
      console.error("Error addProductToCart:", error)
      alert(error.message || "No se pudo agregar el producto al carrito.")
    }
  }

  // --------------------------------------------------
  // Financiar este producto (llevar a formulario)
  // --------------------------------------------------
  const financeThisProduct = () => {
    try {
      const item = {
        productId: selectedVariant.id,
        name: selectedVariant.name || product.name,
        qty: 1,
        price: selectedVariant.price,
        subtotal: selectedVariant.price,
        currency: "DOP",
        image: selectedVariant.image || product.image
      }
      try {
        sessionStorage.removeItem("financing_cart_items")
        sessionStorage.removeItem("product_financing_item")
        sessionStorage.setItem("financing_source", "product")
        sessionStorage.setItem("product_financing_item", JSON.stringify(item))
      } catch {}

      const amount = Math.round(selectedVariant.price || 0)
      const down = Math.max(0, Math.round(amount * 0.2))
      const params = new URLSearchParams({
        amount: String(amount),
        down: String(down),
        currency: "DOP"
      })
      window.location.href = `/financing/product?${params.toString()}`
    } catch (e) {
      console.error("No se pudo preparar el financiamiento del producto:", e)
    }
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/store"
        className="mb-8 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a productos
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={selectedVariant.image || product.image}
              alt={product.name}
              width={1200}
              height={1200}
              className="h-full w-full object-cover object-center"
              priority
            />
          </div>
          {product.variants && product.variants.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-4">
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className={`aspect-square cursor-pointer overflow-hidden rounded-lg ${
                    variant.id === selectedVariant.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedVariant(variant)}
                >
                  <Image
                    src={variant.image || "/placeholder.svg"}
                    alt={variant.name}
                    width={100}
                    height={100}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-2 text-xl font-semibold text-gray-900">
              RD$ {selectedVariant.price.toLocaleString()}
            </p>
          </div>

          <div className="space-y-4 rounded-lg bg-gray-50 p-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                Tipo: <span className="font-medium">{product.type}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                Vendedor: <span className="font-medium">{product.vendor}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                SKU: <span className="font-medium">{selectedVariant.sku || "N/A"}</span>
              </span>
            </div>
          </div>

          {/* Opcional: selector de variantes (ya se maneja arriba) */}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Descripción</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Botón principal */}
          <div>
            <button
              onClick={handleAddToCart}
              className="rounded-lg bg-gray-900 px-8 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              Agregar al carrito
            </button>
            <button
              onClick={financeThisProduct}
              className="ml-3 rounded-lg border border-primary px-8 py-3 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              Financiar este producto
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modal: pedir datos de usuario si no tenemos user_ns */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-bold">Registrar tus datos</h2>
            {errorMsg && <p className="mb-2 text-red-500">{errorMsg}</p>}

            <form onSubmit={handleCreateSubscriber} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold">Nombre</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded border p-2"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Teléfono</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded border p-2"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setErrorMsg("")
                  }}
                  className="flex-1 rounded border py-2 text-center font-medium hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
                >
                  {isSubmitting ? "Guardando..." : "Guardar y agregar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


