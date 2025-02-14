"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Package, Truck, Tag } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface Product {
  id: number
  name: string
  image: string
  price: number
  description: string
  type: string
  vendor: string
  variants: {
    id: number
    name: string
    price: number
    image: string
    sku: string
  }[]
}

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || product)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/store" className="mb-8 inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a productos
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
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
            <p className="mt-2 text-xl font-semibold text-gray-900">RD$ {selectedVariant.price.toLocaleString()}</p>
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

          {product.variants && product.variants.length > 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Variantes</h2>
              <div className="grid grid-cols-2 gap-4">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      variant.id === selectedVariant.id
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 hover:border-primary"
                    }`}
                  >
                    <p className="font-medium">{variant.name}</p>
                    <p className="text-sm">RD$ {variant.price.toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Descripción</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 rounded-lg bg-gray-900 px-8 py-3 text-sm font-medium text-white hover:bg-gray-800">
              Agregar al carrito
            </button>
            <button className="rounded-lg border border-gray-300 px-8 py-3 text-sm font-medium hover:bg-gray-50">
              Comprar ahora
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

