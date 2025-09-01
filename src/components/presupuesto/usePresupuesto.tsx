"use client"

import { useEffect, useMemo, useState } from "react"
import { localProducts, LocalProduct } from "@/data/localProducts"

const ITBIS_RATE = 0.18

export function usePresupuesto() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<LocalProduct[]>([])
  const [filters, setFilters] = useState<Record<string, string[]>>({ type: [], vendor: [] })
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Record<number, LocalProduct & { qty: number }>>({})

  useEffect(() => {
    try {
      setLoading(true)
      setProducts(localProducts)
    } catch (e: any) {
      console.error(e)
      setError("No se pudieron cargar los productos")
    } finally {
      setLoading(false)
    }
  }, [])

  const uniqueTypes = useMemo(
    () => Array.from(new Set(products.map((p) => p.type).filter(Boolean))),
    [products]
  )
  const uniqueVendors = useMemo(
    () => Array.from(new Set(products.map((p) => p.vendor).filter(Boolean))),
    [products]
  )

  const filteredProducts = useMemo(() => {
    let list = products
      .filter((p: any) => {
        const status = (p.status || '').toString().toLowerCase()
        const isUnavailable = status.includes('unavailable') || status.includes('out') || status.includes('agot')
        const hasStock = p.track_stock ? (Number(p.total_qty) > 0) : true
        return !isUnavailable && hasStock
      })
    if (filters.type.length) list = list.filter((p) => filters.type.includes(p.type))
    if (filters.vendor.length) list = list.filter((p) => filters.vendor.includes(p.vendor))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
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

  const addItem = (p: LocalProduct) => {
    setSelected((prev) => {
      const existing = prev[p.id]
      const qty = (existing?.qty || 0) + 1
      return { ...prev, [p.id]: { ...p, qty } }
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
  const subtotal = useMemo(
    () => selectedList.reduce((s, it) => s + it.price * it.qty, 0),
    [selectedList]
  )
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

    let y = 28
    doc.setFontSize(12); doc.text("Items", 10, y); y += 6
    doc.setFontSize(10)
    selectedList.forEach((it, idx) => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.text(`${idx + 1}. ${it.name}`, 10, y); y += 5
      doc.text(`Cantidad: ${it.qty}`, 12, y)
      doc.text(`Precio: ${formatCurrency(it.price)}`, 70, y)
      doc.text(`Subtotal: ${formatCurrency(it.price * it.qty)}`, 120, y)
      y += 6
    })
    y += 4; line(y); y += 8
    doc.setFontSize(12)
    doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 140, y); y += 6
    doc.text(`Impuesto (18%): ${formatCurrency(tax)}`, 140, y); y += 6
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
      try { window.dispatchEvent(new Event("cart-updated")) } catch {}
      window.location.href = "/store/cart"
    } catch (e) {
      console.error("No se pudo proceder a comprar:", e)
      alert("Hubo un problema al preparar el carrito.")
    }
  }

  return {
    // state
    loading, error,
    products, filters, search,
    selectedList, subtotal, tax, total,
    uniqueTypes, uniqueVendors, counts,
    filteredProducts,
    // actions
    setSearch, onFilterChange, addItem, removeItem, changeQty, clearSelected,
    exportPDF, proceedToBuy,
  }
}

export function formatCurrency(n: number, currency: string = "DOP") {
  try {
    return new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(n)
  } catch {
    return `RD$ ${n.toFixed(2)}`
  }
}
