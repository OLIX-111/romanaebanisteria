"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Search, Plus, X as XIcon, ChevronDown, ChevronRight } from "lucide-react"
import type { LocalProduct, ProductVariant } from "@/data/localProducts"

interface LeftColumnProps {
  search: string
  setSearch: (v: string) => void
  filteredProducts: LocalProduct[]
  onAdd: (p: LocalProduct, variant?: ProductVariant) => void
}

type SelectionMap = Record<string, { optionId: string; subOptionId?: string }>

export default function LeftColumn({ search, setSearch, filteredProducts, onAdd }: LeftColumnProps) {
  const [selectedProduct, setSelectedProduct] = useState<LocalProduct | null>(null)
  const [selections, setSelections] = useState<SelectionMap>({})
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const productsByCategory = useMemo(() => {
    return filteredProducts.reduce((acc, p) => {
      const key = p.type || "Otros"
      if (!acc[key]) acc[key] = []
      acc[key].push(p)
      return acc
    }, {} as Record<string, LocalProduct[]>)
  }, [filteredProducts])

  const normalizeCat = (s: string) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
  const priorityCats = ["puertas", "cocina", "banos"]
  const orderedCategories = useMemo(() => {
    const cats = Object.keys(productsByCategory)
    cats.sort((a, b) => {
      const an = normalizeCat(a)
      const bn = normalizeCat(b)
      const ai = priorityCats.indexOf(an)
      const bi = priorityCats.indexOf(bn)
      if (ai !== -1 || bi !== -1) {
        if (ai === -1) return 1
        if (bi === -1) return -1
        return ai - bi
      }
      return a.localeCompare(b, "es", { sensitivity: "base" })
    })
    return cats
  }, [productsByCategory])

  // Abrir la primera categoría por defecto cuando cambian los datos
  useEffect(() => {
    if (orderedCategories.length && expandedCategories.size === 0) {
      setExpandedCategories(new Set([orderedCategories[0]]))
    }
  }, [orderedCategories])

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const openModal = (product: LocalProduct) => {
    if (product.customizationAttributes && product.customizationAttributes.length > 0) {
      setSelections({})
    }
    setSelectedProduct(product)
  }

  const closeModal = () => {
    setSelectedProduct(null)
  }

  const handleAddProduct = (product: LocalProduct, variant?: ProductVariant) => {
    onAdd(product, variant)
    setSelectedProduct(null)
    setSelections({})
  }

  const formatDOP = (n: number) => new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(n)

  const computeCustomizedPrice = (product: LocalProduct) => {
    let price = Number(product.price || 0)
    for (const attr of product.customizationAttributes || []) {
      const sel = selections[attr.attribute_id]
      if (!sel) continue
      const opt = attr.options.find((o) => o.value_id === sel.optionId)
      if (opt && Number(opt.price_adjustment)) price += Number(opt.price_adjustment)
      if (opt?.sub_options && sel.subOptionId) {
        const sub = opt.sub_options.find((s) => s.value_id === sel.subOptionId)
        if (sub && Number(sub.price_adjustment)) price += Number(sub.price_adjustment)
      }
    }
    return price
  }

  const buildCustomizedVariant = (product: LocalProduct): ProductVariant | null => {
    if (!product.customizationAttributes || product.customizationAttributes.length === 0) return null
    const parts: string[] = []
    for (const attr of product.customizationAttributes) {
      const sel = selections[attr.attribute_id]
      if (!sel) return null
      const opt = attr.options.find((o) => o.value_id === sel.optionId)
      if (!opt) return null
      const sub = opt.sub_options?.find((s) => s.value_id === sel.subOptionId)
      parts.push(`${attr.attribute_name}: ${opt.name}${sub ? ` / ${sub.name}` : ""}`)
    }
    const price = computeCustomizedPrice(product)
    const idSuffix = Object.values(selections)
      .map((s) => `${s.optionId}${s.subOptionId ? `-${s.subOptionId}` : ""}`)
      .join("_")
    const variant: ProductVariant = {
      id: `${product.id}-cust-${idSuffix || "base"}`,
      name: parts.join(" | "),
      price,
    }
    return variant
  }

  const empty = useMemo(() => filteredProducts.length === 0, [filteredProducts])

  // Cerrar modal con ESC
  useEffect(() => {
    if (!selectedProduct) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedProduct])

  return (
    <section>
      <div className="border border-gray-200 bg-white">
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-semibold text-gray-700">Catálogo de productos</h3>
        </div>
        <div className="p-3">
          {/* Buscador */}
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                defaultValue={search}
                onChange={(e) => {
                  const value = e.target.value
                    // debounce simple
                    ; (window as any)._presuSearchTimer && clearTimeout((window as any)._presuSearchTimer)
                    ; (window as any)._presuSearchTimer = setTimeout(() => setSearch(value), 250)
                }}
                placeholder="Buscar productos..."
                className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Listado por categoría con dropdowns y grilla 3x */}
          {empty ? (
            <div className="text-sm text-gray-600 p-6">No hay productos para mostrar.</div>
          ) : (
            <div>
              {orderedCategories.map((category) => {
                const products = productsByCategory[category] || []
                return (
                  <div key={category} className="border border-gray-200 bg-white">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">{category}</span>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{products.length}</span>
                      </div>
                      {expandedCategories.has(category) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {expandedCategories.has(category) && (
                      <div className="border-t border-gray-200 p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                          <div
                            key={product.id}
                            className="group border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow duration-200"
                          >
                            <div className="aspect-[4/3] bg-gray-50">
                              <Image
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                width={600}
                                height={450}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1" title={product.name}>
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">{product.description}</p>
                              <p className="text-[11px] text-gray-500 mb-3">Proveedor: {product.vendor}</p>
                              <div className="flex gap-2">
                                {(product.variants && product.variants.length > 0) ||
                                (product.customizationAttributes && product.customizationAttributes.length > 0) ? (
                                  <button
                                    onClick={() => openModal(product)}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-primary border border-primary rounded-md hover:bg-primary/90 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Añadir
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleAddProduct(product)}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-primary border border-primary rounded-md hover:bg-primary/90 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Añadir
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Modal de selección (variantes y/o personalización) */}
                            {selectedProduct?.id === product.id && (
                              <div
                                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                                onClick={closeModal}
                              >
                                <div
                                  className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[85vh] overflow-auto"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-semibold text-gray-900">
                                      {product.customizationAttributes?.length ? "Personaliza tu producto" : "Selecciona una variante"}
                                    </h4>
                                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar">
                                      <XIcon className="w-5 h-5" />
                                    </button>
                                  </div>

                                  {/* Bloque de variantes */}
                                  {product.variants && product.variants.length > 0 && (
                                    <div className="mb-6">
                                      <h5 className="text-sm font-semibold text-gray-900 mb-3">Variantes disponibles</h5>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {product.variants.map((variant) => (
                                          <div
                                            key={variant.id}
                                            className="group p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all duration-200 bg-white"
                                          >
                                            <div className="flex items-center justify-between mb-3">
                                              <h6 className="text-sm font-semibold text-gray-900">{variant.name}</h6>
                                              <span className="text-sm font-bold text-primary">{formatDOP(variant.price)}</span>
                                            </div>
                                            {variant.description && (
                                              <p className="text-xs text-gray-600 mb-4 leading-relaxed">{variant.description}</p>
                                            )}
                                            <button
                                              onClick={() => handleAddProduct(product, variant)}
                                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary border border-primary rounded-md hover:bg-primary/90 hover:shadow-md group-hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                                            >
                                              <Plus className="w-4 h-4" /> Añadir esta variante
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Bloque de personalización */}
                                  {product.customizationAttributes && product.customizationAttributes.length > 0 && (
                                    <div className="space-y-6">
                                      {product.customizationAttributes.map((attr) => {
                                        const sel = selections[attr.attribute_id]
                                        return (
                                          <div key={attr.attribute_id} className="border border-gray-200 rounded-md p-4">
                                            <h5 className="text-sm font-semibold text-gray-900 mb-3">{attr.attribute_name}</h5>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                              {attr.options.map((opt) => {
                                                const selected = sel?.optionId === opt.value_id
                                                const thumbSrc =
                                                  opt.image?.image_url ||
                                                  opt.sub_options?.find((s) => s.image?.image_url)?.image?.image_url ||
                                                  product.image ||
                                                  "/placeholder.svg"
                                                return (
                                                  <button
                                                    type="button"
                                                    key={opt.value_id}
                                                    onClick={() =>
                                                      setSelections((prev) => ({
                                                        ...prev,
                                                        [attr.attribute_id]: { optionId: opt.value_id, subOptionId: undefined },
                                                      }))
                                                    }
                                                    className={`group relative rounded-md border overflow-hidden text-left focus:outline-none ${
                                                      selected ? "border-primary ring-2 ring-primary/30" : "border-gray-200"
                                                    }`}
                                                  >
                                                    <div className="aspect-square bg-gray-50">
                                                      <Image
                                                        src={thumbSrc}
                                                        alt={opt.name}
                                                        width={300}
                                                        height={300}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                      />
                                                    </div>
                                                    <div className="p-2">
                                                      <div className="text-xs font-medium text-gray-900 line-clamp-1">{opt.name}</div>
                                                      {Number(opt.price_adjustment) > 0 && (
                                                        <div className="text-[11px] text-primary font-semibold">
                                                          +{formatDOP(Number(opt.price_adjustment))}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </button>
                                                )
                                              })}
                                            </div>

                                            {(() => {
                                              const current = sel?.optionId
                                              const opt = current ? attr.options.find((o) => o.value_id === current) : null
                                              if (!opt || !opt.sub_options || opt.sub_options.length === 0) return null
                                              return (
                                                <div className="mt-3 border border-primary/20 bg-primary/5 rounded-md p-2">
                                                  <div className="flex items-center justify-between text-xs font-medium text-gray-800 mb-2">
                                                    <span>Sub-opciones de {opt.name}</span>
                                                    <button
                                                      type="button"
                                                      aria-label="Cerrar sub-opciones"
                                                      className="text-gray-400 hover:text-gray-600"
                                                      onClick={() =>
                                                        setSelections((prev) => {
                                                          const { [attr.attribute_id]: _omit, ...rest } = prev
                                                          return rest
                                                        })
                                                      }
                                                    >
                                                      ✕
                                                    </button>
                                                  </div>
                                                  <div className="flex flex-wrap justify-center gap-2">
                                                    {opt.sub_options.map((sub) => {
                                                      const selectedSub = sel?.subOptionId === sub.value_id
                                                      const subSrc = sub.image?.image_url || product.image || "/placeholder.svg"
                                                      return (
                                                        <button
                                                          type="button"
                                                          key={sub.value_id}
                                                          onClick={() =>
                                                            setSelections((prev) => ({
                                                              ...prev,
                                                              [attr.attribute_id]: { optionId: opt.value_id, subOptionId: sub.value_id },
                                                            }))
                                                          }
                                                          className={`group relative rounded-md border overflow-hidden text-center focus:outline-none w-28 sm:w-32 ${
                                                            selectedSub ? "border-primary ring-2 ring-primary/30" : "border-gray-200"
                                                          }`}
                                                        >
                                                          <div className="bg-gray-50 h-24 flex items-center justify-center">
                                                            <Image
                                                              src={subSrc}
                                                              alt={sub.name}
                                                              width={200}
                                                              height={96}
                                                              className="w-full h-full object-contain"
                                                            />
                                                          </div>
                                                          <div className="p-2">
                                                            <div className="text-[10px] font-medium text-gray-900 line-clamp-2 min-h-[2rem]">
                                                              {sub.name}
                                                            </div>
                                                            {Number(sub.price_adjustment) > 0 && (
                                                              <div className="text-[10px] text-primary font-semibold">
                                                                +{formatDOP(Number(sub.price_adjustment))}
                                                              </div>
                                                            )}
                                                          </div>
                                                        </button>
                                                      )
                                                    })}
                                                  </div>
                                                </div>
                                              )
                                            })()}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}

                                  {/* Footer con precio y CTA para personalización */}
                                  {product.customizationAttributes && product.customizationAttributes.length > 0 && (
                                    <div className="mt-6 flex items-center justify-between border-t pt-4">
                                      <div className="text-sm text-gray-700">
                                        Precio final:
                                        <span className="ml-2 font-semibold text-gray-900">{formatDOP(computeCustomizedPrice(product))}</span>
                                      </div>
                                      {(() => {
                                        const isComplete = (product.customizationAttributes || []).every((attr) => {
                                          const sel = selections[attr.attribute_id]
                                          if (!sel?.optionId) return false
                                          const opt = attr.options.find((o) => o.value_id === sel.optionId)
                                          if (opt?.sub_options && opt.sub_options.length > 0) {
                                            return !!sel.subOptionId
                                          }
                                          return true
                                        })
                                        return (
                                          <div className="flex items-center gap-3">
                                            {!isComplete && (
                                              <span className="text-xs text-gray-500 hidden sm:inline">Selecciona todas las opciones</span>
                                            )}
                                            <button
                                              onClick={() => {
                                                const v = buildCustomizedVariant(product)
                                                if (v) handleAddProduct(product, v)
                                              }}
                                              disabled={!isComplete}
                                              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 border ${
                                                isComplete
                                                  ? "bg-primary border-primary hover:bg-primary/90"
                                                  : "bg-gray-300 border-gray-300 cursor-not-allowed"
                                              }`}
                                            >
                                              <Plus className="w-4 h-4" /> Añadir configuración
                                            </button>
                                          </div>
                                        )
                                      })()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
