"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Plus, ChevronDown, ChevronRight } from "lucide-react"
import type { LocalProduct, ProductVariant } from "@/data/localProducts"

interface LeftColumnProps {
  search: string
  setSearch: (v: string) => void
  filteredProducts: LocalProduct[]
  onAdd: (p: LocalProduct, variant?: ProductVariant) => void
}

export default function LeftColumn({ search, setSearch, filteredProducts, onAdd }: LeftColumnProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [selectedProduct, setSelectedProduct] = useState<LocalProduct | null>(null)

  const productsByCategory = filteredProducts.reduce(
    (acc, product) => {
      const category = product.type
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(product)
      return acc
    },
    {} as Record<string, LocalProduct[]>,
  )

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const handleProductClick = (product: LocalProduct) => {
    if (selectedProduct?.id === product.id) {
      setSelectedProduct(null)
    } else {
      setSelectedProduct(product)
    }
  }

  const handleAddProduct = (product: LocalProduct, variant?: ProductVariant) => {
    if (variant) {
      const productWithVariant = {
        ...product,
        name: `${product.name} - ${variant.name}`,
        price: variant.price,
        id: Number.parseInt(`${product.id}${variant.id.split("-")[1]}`), // Create unique ID
      }
      onAdd(productWithVariant)
    } else {
      onAdd(product)
    }
    setSelectedProduct(null)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-12 pr-4 py-4 text-base border-0 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Catálogo de Productos</h2>
          <p className="text-sm text-gray-500 mt-1">{filteredProducts.length} productos disponibles</p>
        </div>

        <div className="max-h-[70vh] overflow-auto">
          {Object.keys(productsByCategory).length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-3">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-base text-gray-600">No hay productos con esos criterios.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {Object.entries(productsByCategory).map(([category, products]) => (
                <div key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium text-gray-900">{category}</span>
                      <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                        {products.length}
                      </span>
                    </div>
                    {expandedCategories.has(category) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedCategories.has(category) && (
                    <div className="bg-gray-25">
                      {products.map((product) => (
                        <div key={product.id} className="border-t border-gray-100">
                          <div className="p-6 hover:bg-gray-50 transition-colors duration-150">
                            <div className="flex gap-6 items-start">
                              <div className="w-24 h-24 flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                                <Image
                                  src={product.image || "/placeholder.svg"}
                                  alt={product.name}
                                  width={96}
                                  height={96}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-gray-900 mb-2" title={product.name}>
                                  {product.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                                <p className="text-sm text-gray-500 mb-3">Proveedor: {product.vendor}</p>
                                <div className="flex gap-2">
                                  {product.variants && product.variants.length > 0 ? (
                                    <button
                                      onClick={() => handleProductClick(product)}
                                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary border border-primary rounded-md hover:bg-primary/90 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Añadir
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleAddProduct(product)}
                                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary border border-primary rounded-md hover:bg-primary/90 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Añadir
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {selectedProduct?.id === product.id && product.variants && (
                              <div className="mt-6 pt-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                                  Selecciona una variante:
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {product.variants.map((variant) => (
                                    <div
                                      key={variant.id}
                                      className="group p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all duration-200 bg-white"
                                    >
                                      <div className="flex items-center justify-between mb-3">
                                        <h5 className="text-sm font-semibold text-gray-900">{variant.name}</h5>
                                        <span className="text-sm font-bold text-primary">
                                          {new Intl.NumberFormat("es-DO", {
                                            style: "currency",
                                            currency: "DOP",
                                          }).format(variant.price)}
                                        </span>
                                      </div>
                                      {variant.description && (
                                        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                                          {variant.description}
                                        </p>
                                      )}
                                      <button
                                        onClick={() => handleAddProduct(product, variant)}
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary border border-primary rounded-md hover:bg-primary/90 hover:shadow-md group-hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                                      >
                                        <Plus className="w-4 h-4" />
                                        Añadir esta variante
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
