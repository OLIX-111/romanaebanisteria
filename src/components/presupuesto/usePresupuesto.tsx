"use client"

import { useEffect, useMemo, useState } from "react"
import { type LocalProduct, type ProductVariant, type CustomizationAttribute, type CustomizationOption, type CustomizationSubOption, type CustomizationImage } from "@/data/localProducts"

const ITBIS_RATE = 0.18

function generateQuoteNumber(): string {
  return `COT-${Date.now().toString().slice(-6)}`;
}

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

  const exportPDF = async (options: { download: boolean; email: boolean } = { download: true, email: false }) => {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [279, 432] })
    // Tamaños de fuente base (más pequeño)
    const FS_BASE = 9
    // medidas de página y márgenes
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 12
    const headerH = 24
    const line = (y: number) => doc.line(margin, y, pageWidth - margin, y)

    // Encabezado con color #434343, separado de los bordes
    doc.setFillColor(67, 67, 67)
    doc.rect(margin, margin, pageWidth - margin * 2, headerH, "F")

    // Intentar dibujar logo en la parte superior izquierda (dentro del encabezado)
    let logoDataUrl: string | null = null
    try {
      const logoPath = encodeURI("/romanaEbanistería_alt.png")
      const dataUrl = await loadImageAsDataURL(logoPath)
      if (dataUrl) {
        logoDataUrl = dataUrl
        // x, y, width, height (mm)
        doc.addImage(dataUrl, "PNG", margin + 6, margin + 6, 28, 12)
      }
    } catch {}

    // Línea separadora bajo el encabezado
    line(margin + headerH)

    // Datos del cliente + fecha en la misma línea, bajo el encabezado
    let y = margin + headerH + 8
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(FS_BASE) // antes 10
    let customerName = ""
    try {
      const raw = localStorage.getItem('presu_customer')
      if (raw) {
        const c = JSON.parse(raw)
        customerName = c?.nombre || ""
      }
    } catch {}
    const todayStr = new Date().toLocaleDateString()
    doc.text(`Cliente: ${customerName}`, margin, y)
    doc.text(todayStr, pageWidth - margin - 2, y, { align: "right" })

    // PRESUPUESTO #<número>
    y += 6
    doc.setFontSize(FS_BASE) // antes 10
    const presupuestoNumber = Math.floor(100000 + Math.random() * 900000)
    doc.setFontSize(10) // igual tamaño que contacto
    doc.text(`PRESUPUESTO #${presupuestoNumber}`, margin, y)

    // Contacto y validez
    y += 6
    doc.setFontSize(FS_BASE) // antes 10
    doc.setFont("helvetica", "bold")
    doc.text("Contacto: Romana Ebanisteria", margin, y)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(157, 84, 33) // #9d5421
    doc.text("COTIZACION VALIDA POR 5 DIAS", pageWidth - margin - 2, y, { align: "right" })
    doc.setTextColor(0, 0, 0)

    // Teléfono y Email
    y += 5
    doc.setFont("helvetica", "bold")
    doc.text("Tel#: +1 (829) 222-2483   Email: info@grupochavon.com", margin, y)
    doc.setFont("helvetica", "normal")

    // Barra fina separadora con color #9d5421
    y += 8
    doc.setFillColor(157, 84, 33)
    doc.rect(margin, y, pageWidth - margin * 2, 3, "F")
    y += 8

    // Título de productos (removido)

    const contentWidth = pageWidth - margin * 2
    const colWidths = [
      contentWidth * 0.08,
      contentWidth * 0.12,
      contentWidth * 0.12,
      contentWidth * 0.40,
      contentWidth * 0.14,
      contentWidth * 0.14,
    ]

    // Reducir alturas mínimas de filas
    const rowHeights = { h1: 7, h2: 7, h3: 7, h4: 9 }

    // Helper para salto de página
    const ensureSpace = (needed: number) => {
      if (y + needed > pageHeight - margin - 12) {
        doc.addPage()
        const pw = doc.internal.pageSize.getWidth()
        // Re-dibujar encabezado
        doc.setFillColor(67, 67, 67)
        doc.rect(margin, margin, pw - margin * 2, headerH, "F")
        if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", margin + 6, margin + 6, 28, 12)
        // Línea bajo encabezado y barra fina
        doc.setDrawColor(0)
        doc.setLineWidth(0.2)
        doc.line(margin, margin + headerH, pw - margin, margin + headerH)
        doc.setFillColor(157, 84, 33)
        doc.rect(margin, margin + headerH + 8, pw - margin * 2, 3, "F")
        y = margin + headerH + 18
      }
    }

    doc.setFontSize(FS_BASE)
    doc.setFont("helvetica", "normal")

    for (let idx = 0; idx < selectedList.length; idx++) {
      const it = selectedList[idx]

      // Preparar configuración desde el nombre (parte después de " - ") y calcular altura dinámica
      const fullName = it.name || ""
      const parts = fullName.split(" - ")
      const configPart = parts.length > 1 ? parts.slice(1).join(" - ") : ""
      let cfgDisplay = configPart.trim()
      if (cfgDisplay && !cfgDisplay.startsWith("-")) cfgDisplay = `- ${cfgDisplay}`
      const cfgLines = doc.splitTextToSize(cfgDisplay || "Configuración: (según selección)", contentWidth - 4)
      const lineH = 4 // antes 5, compensa fuente más pequeña
      const dynH2 = Math.max(rowHeights.h2, 4 + cfgLines.length * lineH)

      // Preparar valores y calcular altura dinámica de la última fila (h4)
      const qty = it.qty
      const ancho = Math.floor(60 + Math.random() * 60) // 60-120 cm
      const alto = Math.floor(180 + Math.random() * 40) // 180-220 cm
      const desc = `Fabricación de "${it.name}"`
      const unit = formatCurrency(it.price)
      const totalP = formatCurrency(it.price * it.qty)
      const values = [String(qty), `${ancho} cm`, `${alto} cm`, desc, unit, totalP]
      const linesPerCol = values.map((v, i) => doc.splitTextToSize(String(v), colWidths[i] - 3))
      const dynH4 = Math.max(rowHeights.h4, 6 + Math.max(...linesPerCol.map((ls: any) => (Array.isArray(ls) ? ls.length : 1)))* (lineH - 1))

      // Alturas totales para la tabla del producto (usar alturas dinámicas de fila 2 y 4)
      const totalH = rowHeights.h1 + dynH2 + rowHeights.h3 + dynH4 + 6
      ensureSpace(totalH)

      // Fila 1: nombre (colspan 6)
      let x = margin
      let rowY = y
      doc.setDrawColor(0, 0, 0) // líneas negras
      doc.setFillColor(165, 165, 165) // #a5a5a5
      doc.rect(x, rowY, contentWidth, rowHeights.h1, "FD")
      const baseName = ((it.name || "").split(" - ")[0] || it.name || "").replace(/\s*['\"].*?['\"]/g, "").trim()
      doc.setFont("helvetica", "bold")
      doc.setTextColor(0, 0, 0)
      const titleLines = doc.splitTextToSize(baseName, contentWidth - 4)
      doc.text(titleLines, x + 2, rowY + rowHeights.h1 - 2)
      // Reset a normal para evitar negritas fuera de la fila 1
      doc.setFont("helvetica", "normal")

      // Fila 2: configuración (colspan 6) con altura dinámica
      rowY += rowHeights.h1
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)
      doc.rect(x, rowY, contentWidth, dynH2)
      doc.text(cfgLines, x + 2, rowY + 5)

      // Fila 3: encabezados columnas
      rowY += dynH2
      x = margin
      doc.setDrawColor(0, 0, 0) // líneas negras
      const headers = ["CANT", "ANCH", "ALTO", "DESCRIPCION", "PRECIO UND", "TOTAL"]
      doc.setFontSize(FS_BASE)
      for (let c = 0; c < 6; c++) {
        doc.rect(x, rowY, colWidths[c], rowHeights.h3)
        doc.setFont("helvetica", "bold")
        doc.text(headers[c], x + 2, rowY + rowHeights.h3 - 2)
        x += colWidths[c]
      }
      // Reset a normal para evitar negritas fuera de la fila 3
      doc.setFont("helvetica", "normal")

      // Fila 4: valores con altura dinámica
      rowY += rowHeights.h3
      x = margin
      doc.setDrawColor(0, 0, 0) // líneas negras
      doc.setFont("helvetica", "normal")
      for (let c = 0; c < 6; c++) {
        doc.rect(x, rowY, colWidths[c], dynH4)
        const lines = linesPerCol[c]
        const topY = rowY + 5 // alineación superior con padding
        // Alinear todo arriba-izquierda (incluye precios)
        doc.text(lines, x + 2, topY)
        x += colWidths[c]
      }

      // Avanzar y pequeño espacio entre tablas
      y = rowY + dynH4 + 3
    }

    // Separador antes de totales
    line(y)
    y += 6

    // Bloque de totales a la derecha
    const boxW = Math.min(80, pageWidth - margin * 2)
    const rowH = 7
    const needed = rowH * 3 + 6
    ensureSpace(needed)
    const xBox = pageWidth - margin - boxW

    // Subtotal
    doc.setFillColor(247, 247, 247)
    doc.rect(xBox, y, boxW, rowH, "F")
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(FS_BASE + 1)
    doc.text("Subtotal", xBox + 3, y + rowH - 2)
    doc.text(formatCurrency(subtotal), xBox + boxW - 3, y + rowH - 2, { align: "right" })
    y += rowH

    // ITBIS (18%)
    doc.setFillColor(247, 247, 247)
    doc.rect(xBox, y, boxW, rowH, "F")
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(FS_BASE + 1)
    doc.text("ITBIS (18%)", xBox + 3, y + rowH - 2)
    doc.text(formatCurrency(tax), xBox + boxW - 3, y + rowH - 2, { align: "right" })
    y += rowH

    // Total destacado
    const totalH = rowH + 2
    doc.setFillColor(157, 84, 33) // #9d5421
    doc.rect(xBox, y, boxW, totalH, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(FS_BASE + 3)
    doc.text("Total", xBox + 3, y + totalH - 2)
    doc.text(formatCurrency(total), xBox + boxW - 3, y + totalH - 2, { align: "right" })
    y += totalH

    // Reset de color
    doc.setTextColor(0, 0, 0)

    // Notas al pie con separador y mayor espacio
    const preSpace = 14
    const notes = [
      "1) Los precios aqui suministrado son en base a las especificaciones dadas por el cliente.",
      "2) No realizamos devolucion de dinero.",
      "3) Trabajos presupuestados en este documento tienen un plazo de entrega de _______Dias Calendario a la firma del mismo y pago del primer avance.",
      "4) La energia electrica y andamios si son requeridos, el cliente se comprometera a facilitar las condiciones favorables para el desarrollo del trabajo.",
      "5) Cualquier trabajo de ajustes adicionales a las especificaciones dadas pueden ser considerados como otros gastos que deberan ser cubiertos por el cliente.",
      "6) El Cliente autoriza a Romana Ebanisteria y/o su grupo de trabajo a grabar, fotografiar o documentar el trabajo realizado, y a utilizar dicho material con fines promocionales o de portafolio, en cualquier medio, sin que esto genere compensación adicional.",
    ]
    doc.setFontSize(FS_BASE)
    doc.setFont("helvetica", "normal")
    const wrapWidth = pageWidth - margin * 2
    let wrapped: string[] = []
    for (const n of notes) {
      const lines = doc.splitTextToSize(n, wrapWidth)
      wrapped = wrapped.concat(lines)
    }
    const lineHF = 4
    const needFooterH = wrapped.length * lineHF + 4
    const topSpace = 18
    const postSpace = 12
    ensureSpace(topSpace + 3 + postSpace + needFooterH)
    y += topSpace
    doc.setFillColor(0, 0, 0)
    doc.rect(margin, y, pageWidth - margin * 2, 3, "F")
    y += postSpace
    doc.text(wrapped, margin, y)
    y += needFooterH

    // Si se solicita envío por email, enviar a la API
    if (options.email) {
      try {
        const customerData = localStorage.getItem('presu_customer')
        if (customerData) {
          const response = await fetch('/api/cotizacion/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              items: selectedList,
              customerData: JSON.parse(customerData),
              subtotal,
              tax,
              total
            })
          })

          if (!response.ok) {
            throw new Error('Error al enviar por email')
          }
        } else {
          throw new Error('No hay datos del cliente para enviar por email')
        }
      } catch (error) {
        console.error('Error enviando cotización por email:', error)
        alert('Error al enviar la cotización por email. El PDF se descargará localmente.')
      }
    }

    // Si se solicita descarga, guardar el PDF
    if (options.download) {
      const quoteNumber = generateQuoteNumber();
      doc.save(`cotizacion-${quoteNumber}-romana-ebanisteria.pdf`)
    }
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
