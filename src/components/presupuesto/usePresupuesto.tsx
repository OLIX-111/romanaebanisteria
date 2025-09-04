"use client"

import { useEffect, useMemo, useState } from "react"
import { type LocalProduct, type ProductVariant, type CustomizationAttribute, type CustomizationOption, type CustomizationSubOption, type CustomizationImage } from "@/data/localProducts"

const ITBIS_RATE = 0.18

export function usePresupuesto() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<LocalProduct[]>([])
  const [filters, setFilters] = useState<Record<string, string[]>>({ type: [], vendor: [] })
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Record<number, LocalProduct & { qty: number }>>({})

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set("page", "1")
        params.set("limit", "200")
        const res = await fetch(`/api/presupuesto/products?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        })
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const json = await res.json()
        const list: LocalProduct[] = (json.data || []).map((item: any) => {
          const id = hashStringToNumber(String(item.product_id ?? item.id ?? item.name))
          const image = item.main_image?.image_url || item.image || ""
          const customizationAttributes: CustomizationAttribute[] | undefined = Array.isArray(item.customization_attributes)
            ? item.customization_attributes.map((attr: any) => ({
                attribute_id: attr.attribute_id,
                attribute_name: attr.attribute_name,
                selection_type: attr.selection_type,
                options: Array.isArray(attr.options)
                  ? attr.options.map((opt: any): CustomizationOption => ({
                      value_id: opt.value_id,
                      name: opt.name,
                      price_adjustment: opt.price_adjustment,
                      is_default: opt.is_default,
                      image: opt.image
                        ? ({ id: opt.image.id, alt_text: opt.image.alt_text, image_url: opt.image.image_url } as CustomizationImage)
                        : null,
                      sub_options: Array.isArray(opt.sub_options)
                        ? opt.sub_options.map((sub: any): CustomizationSubOption => ({
                            value_id: sub.value_id,
                            name: sub.name,
                            price_adjustment: sub.price_adjustment,
                            is_default: sub.is_default,
                            image: sub.image
                              ? ({ id: sub.image.id, alt_text: sub.image.alt_text, image_url: sub.image.image_url } as CustomizationImage)
                              : null,
                          }))
                        : undefined,
                    }))
                  : [],
              }))
            : undefined

          return {
            id,
            name: item.name,
            image,
            price: Number(item.price ?? 0),
            description: item.description ?? "",
            type: item.category ?? item.type ?? "",
            vendor: item.vendor ?? "Romana",
            status: item.status ?? "available",
            track_stock: Boolean(item.track_stock ?? false),
            total_qty: Number(item.total_qty ?? 0),
            customizationAttributes,
          }
        })
        setProducts(list)
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error(e)
          setError("No se pudieron cargar los productos")
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [])

  // Hidratar seleccionados desde localStorage en el primer render
  useEffect(() => {
    try {
      const raw = localStorage.getItem("presu_selected")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          setSelected(parsed)
        }
      }
    } catch {}
  }, [])

  // Persistir seleccionados en localStorage
  useEffect(() => {
    try { localStorage.setItem("presu_selected", JSON.stringify(selected)) } catch {}
  }, [selected])

  function hashStringToNumber(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i)
      hash = (hash << 5) - hash + chr
      hash |= 0 // Convert to 32bit integer
    }
    // Ensure positive and add a large offset to reduce collisions when concatenating with variant ids
    return Math.abs(hash) + 1_000_000
  }

  const uniqueTypes = useMemo(() => Array.from(new Set(products.map((p) => p.type).filter(Boolean))), [products])
  const uniqueVendors = useMemo(() => Array.from(new Set(products.map((p) => p.vendor).filter(Boolean))), [products])

  const filteredProducts = useMemo(() => {
    let list = products.filter((p: any) => {
      const status = (p.status || "").toString().toLowerCase()
      const isUnavailable = status.includes("unavailable") || status.includes("out") || status.includes("agot")
      const hasStock = p.track_stock ? Number(p.total_qty) > 0 : true
      return !isUnavailable && hasStock
    })
    if (filters.type.length) list = list.filter((p) => filters.type.includes(p.type))
    if (filters.vendor.length) list = list.filter((p) => filters.vendor.includes(p.vendor))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q),
      )
    }
    return list
  }, [products, filters, search])

  const counts: Record<string, number> = useMemo(() => {
    const out: Record<string, number> = {}
    for (const p of products) {
      if (p.type) out[`type:${p.type}`] = (out[`type:${p.type}`] || 0) + 1
      if (p.vendor) out[`vendor:${p.vendor}`] = (out[`vendor:${p.vendor}`] || 0) + 1
    }
    return out
  }, [products])

  const onFilterChange = (type: string, value: string) => {
    setFilters((prev) => {
      const set = new Set(prev[type] || [])
      set.has(value) ? set.delete(value) : set.add(value)
      return { ...prev, [type]: Array.from(set) }
    })
  }

  const addItem = (p: LocalProduct, variant?: ProductVariant) => {
    const productToAdd = variant
      ? {
          ...p,
          name: `${p.name} - ${variant.name}`,
          price: variant.price,
          id: Number.parseInt(`${p.id}${variant.id.split("-")[1]}`),
        }
      : p

    setSelected((prev) => {
      const existing = prev[productToAdd.id]
      const qty = (existing?.qty || 0) + 1
      return { ...prev, [productToAdd.id]: { ...productToAdd, qty } }
    })
  }

  const removeItem = (id: number) => {
    setSelected((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  const changeQty = (id: number, qty: number) => {
    if (qty <= 0) return removeItem(id)
    setSelected((prev) => ({ ...prev, [id]: { ...prev[id], qty } }))
  }

  const clearSelected = () => setSelected({})

  const selectedList = useMemo(() => Object.values(selected), [selected])
  const subtotal = useMemo(() => selectedList.reduce((s, it) => s + it.price * it.qty, 0), [selectedList])
  const tax = useMemo(() => subtotal * ITBIS_RATE, [subtotal])
  const total = useMemo(() => subtotal + tax, [subtotal, tax])

  const exportPDF = async () => {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()
    const line = (y: number) => doc.line(10, y, 200, y)

    // Intentar dibujar logo en la parte superior izquierda
    try {
      const logoPath = encodeURI("/RomanaEbanistería.png")
      const dataUrl = await loadImageAsDataURL(logoPath)
      // x, y, width, height (mm)
      doc.addImage(dataUrl, "PNG", 10, 8, 28, 12)
    } catch {}

    // Título y fecha
    doc.setFontSize(16)
    doc.text("Presupuesto", 44, 15)
    doc.setFontSize(10)
    doc.text(new Date().toLocaleString(), 190, 15, { align: "right" })
    line(20)

    // Datos del cliente (si existen en localStorage)
    let y = 26
    try {
      const raw = localStorage.getItem('presu_customer')
      if (raw) {
        const c = JSON.parse(raw)
        doc.setFontSize(11)
        doc.text(`Cliente: ${c.nombre || ''}`, 10, y)
        doc.text(`Tipo: ${c.tipo || ''}`, 100, y)
        y += 5
        doc.setFontSize(10)
        if (c.numero) doc.text(`Tel: ${c.numero}`, 10, y)
        if (c.email) doc.text(`Email: ${c.email}`, 60, y)
        if (c.tipo === 'Desarrollador' && c.empresa) doc.text(`Empresa: ${c.empresa}`, 120, y)
        y += 5
        if (c.tipo === 'Desarrollador' && c.website) { doc.text(`Website: ${c.website}`, 10, y); y += 5 }
        if (c.tipo === 'Agente del codia' && c.codia) { doc.text(`CODIA: ${c.codia}`, 10, y); y += 5 }
      }
    } catch {}
    if (y < 28) y = 28
    doc.setFontSize(12)
    doc.text("Items", 10, y)
    y += 6
    doc.setFontSize(10)
    selectedList.forEach((it, idx) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(`${idx + 1}. ${it.name}`, 10, y)
      y += 5
      doc.text(`Cantidad: ${it.qty}`, 12, y)
      doc.text(`Precio: ${formatCurrency(it.price)}`, 70, y)
      doc.text(`Subtotal: ${formatCurrency(it.price * it.qty)}`, 120, y)
      y += 6
    })
  y += 4
  line(y)
  y += 8
  doc.setFontSize(12)
  doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 140, y)
  y += 6
  doc.text(`Impuesto (18%): ${formatCurrency(tax)}`, 140, y)
  y += 6
  doc.setFontSize(13)
  doc.text(`Total: ${formatCurrency(total)}`, 140, y)
    doc.save(`presupuesto-${Date.now()}.pdf`)
  }

  // Utilidad: carga una imagen y la convierte a dataURL para jsPDF
  function loadImageAsDataURL(src: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          const ctx = canvas.getContext("2d")
          if (!ctx) return reject(new Error("No ctx"))
          ctx.drawImage(img, 0, 0)
          const dataUrl = canvas.toDataURL("image/png")
          resolve(dataUrl)
        } catch (e) {
          reject(e)
        }
      }
      img.onerror = (e) => reject(e)
      img.src = src
    })
  }

  const proceedToBuy = () => {
    try {
      const localRaw = localStorage.getItem("cart_items")
      const items: any[] = localRaw ? JSON.parse(localRaw) : []
      for (const it of selectedList) {
        const idx = items.findIndex((x) => (x.variant_id || x.id) === it.id)
        const base = {
          id: it.id,
          variant_id: it.id,
          product_id: it.id,
          name: it.name,
          desc: it.description || "",
          image: it.image,
          price: it.price,
          compare_price: 0,
          currency: "DOP",
          num: it.qty,
          subtotal: it.qty * it.price,
        }
        if (idx >= 0) {
          const updated = { ...items[idx] }
          updated.num = (updated.num || 0) + it.qty
          updated.subtotal = (updated.price || it.price) * updated.num
          items[idx] = updated
        } else {
          items.push(base)
        }
      }
      localStorage.setItem("cart_items", JSON.stringify(items))
      try {
        window.dispatchEvent(new Event("cart-updated"))
      } catch {}
      window.location.href = "/store/cart"
    } catch (e) {
      console.error("No se pudo proceder a comprar:", e)
      alert("Hubo un problema al preparar el carrito.")
    }
  }

  return {
    // state
    loading,
    error,
    products,
    filters,
    search,
    selectedList,
    subtotal,
    tax,
    total,
    uniqueTypes,
    uniqueVendors,
    counts,
    filteredProducts,
    // actions
    setSearch,
    onFilterChange,
    addItem,
    removeItem,
    changeQty,
    clearSelected,
    exportPDF,
    proceedToBuy,
  }
}

export function formatCurrency(n: number, currency = "DOP") {
  try {
    return new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(n)
  } catch {
    return `RD$ ${n.toFixed(2)}`
  }
}
