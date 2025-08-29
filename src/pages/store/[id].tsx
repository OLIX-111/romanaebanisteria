import { GetServerSideProps } from "next"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useTranslation } from "@/hook/UseTranslation"
import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Truck, Wrench, CreditCard, Shield, Star, Share2 } from "lucide-react"

const openSans = Open_Sans({ subsets: ["latin"] })

interface Variant {
  id: number
  variant_id: number
  product_id: number
  name: string
  desc: string
  image: string
  price: number
  compare_price: number
  currency: string
  sku: string
  barcode: string
  sku_desc: string
  option_1: string
  option_2: string
  option_1_value: string
  option_2_value: string
}

interface ProductDetailData {
  id: number
  name: string
  image: string
  status: string
  price: number
  description: string
  use_variant: boolean
  total_qty: number
  num_of_variants: number
  track_stock: boolean
  product_type_id: number
  vendor_id: number
  type: string
  vendor: string
  sku?: string
  variants: Variant[]
}

interface ProductDetailProps {
  product: ProductDetailData | null
  error?: string | null
}

export default function ProductDetailPage({ product, error }: ProductDetailProps) {
  const dict = useTranslation()
  const { storePage } = dict
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(product?.variants?.[0]?.id || null)
  const [activeTab, setActiveTab] = useState<"description" | "info" | "reviews">("description")
  const [shareUrl, setShareUrl] = useState<string>("")
  const [calcInputs, setCalcInputs] = useState({
    total: product?.price || 0,
    downPaymentPct: 20,
    annualInterestPct: 18,
    months: 12,
  })
  const [calcResult, setCalcResult] = useState<number | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("")
  const [toastOpen, setToastOpen] = useState(false)
  const [toastText, setToastText] = useState("Producto agregado al carrito")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href)
    }
  }, [])

  useEffect(() => {
    if (product) {
      const img = (product.variants?.find(v => v.id === selectedVariantId)?.image) || product.image || ""
      setCurrentImageUrl(img)
    }
  }, [product, selectedVariantId])

  const availability: { label: string; tone: "in" | "out" | "pre" } = useMemo(() => {
    const pr = product
    if (!pr) return { label: "", tone: "out" }
    if (pr.track_stock) {
      if (pr.total_qty > 0) return { label: "Disponible", tone: "in" }
      return { label: "Agotado", tone: "out" }
    }
    if ((pr.status || "").toLowerCase().includes("pre")) return { label: "Pre-orden", tone: "pre" }
    return { label: "Disponible", tone: "in" }
  }, [product])

  if (error) {
    return (
      <main className={openSans.className}>
        <Header />
        <div className="container mx-auto mt-28 px-4 py-16 text-center">
          <p className="text-red-500 mb-6">{error}</p>
          <Link href="/store" className="text-primary underline">Volver a la tienda</Link>
        </div>
        <Footer />
      </main>
    )
  }

  if (!product) {
    return (
      <main className={openSans.className}>
        <Header />
        <div className="container mx-auto mt-28 px-4 py-16 text-center">
          <p className="text-gray-500 mb-6">Producto no encontrado.</p>
          <Link href="/store" className="text-primary underline">Volver a la tienda</Link>
        </div>
        <Footer />
      </main>
    )
  }

  const p = product as ProductDetailData

  const activeVariant = p.variants.find(v => v.id === selectedVariantId) || p.variants[0]
  const currency = activeVariant?.currency || "DOP"
  const priceNumber = activeVariant?.price ?? p.price
  const priceFormatted = new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(priceNumber)
  const compareFormatted = activeVariant?.compare_price > priceNumber
    ? new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(activeVariant.compare_price)
    : null

  

  const colorLabel = activeVariant?.option_1?.toLowerCase().includes("color") ? activeVariant.option_1_value : undefined
  const materialLabel = activeVariant?.option_2?.toLowerCase().includes("material") ? activeVariant.option_2_value : undefined

  function calculateMonthlyPayment() {
    const total = Number(calcInputs.total) || 0
    const downPct = Number(calcInputs.downPaymentPct) || 0
    const aprPct = Number(calcInputs.annualInterestPct) || 0
    const months = Math.max(1, Number(calcInputs.months) || 1)
    const principal = Math.max(0, total - total * (downPct / 100))
    const monthlyRate = aprPct > 0 ? (aprPct / 100) / 12 : 0
    if (monthlyRate === 0) {
      setCalcResult(principal / months)
      return
    }
    const pow = Math.pow(1 + monthlyRate, months)
    const payment = (principal * monthlyRate * pow) / (pow - 1)
    setCalcResult(payment)
  }

  async function handleAddToCart() {
    try {
      const user_ns = typeof window !== "undefined" ? localStorage.getItem("falitech_user_ns") : null
      if (!user_ns) {
        const returnTo = typeof window !== "undefined" ? window.location.pathname : "/store"
        window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`
        return
      }
      const res = await fetch("/api/ecommerce/cart-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_ns, variant_id: activeVariant?.id, qty: 1 })
      })
      if (res.ok) {
        // Mirror in localStorage cart
        try {
          const localRaw = localStorage.getItem("cart_items")
          const items: any[] = localRaw ? JSON.parse(localRaw) : []
          const variantId = activeVariant?.id || p.variants?.[0]?.id || p.id
          const index = items.findIndex(it => (it.variant_id || it.id) === variantId)
          const item = {
            id: variantId,
            variant_id: variantId,
            product_id: p.id,
            name: p.name,
            desc: "",
            image: activeVariant?.image || p.image,
            price: priceNumber,
            compare_price: 0,
            currency,
            num: 1,
            subtotal: priceNumber
          }
          if (index >= 0) {
            const updated = { ...items[index] }
            updated.num = (updated.num || 0) + 1
            updated.subtotal = (updated.price || priceNumber) * updated.num
            items[index] = updated
          } else {
            items.push(item)
          }
          localStorage.setItem("cart_items", JSON.stringify(items))
          // notify listeners (header badge)
          try { window.dispatchEvent(new Event("cart-updated")) } catch {}
        } catch (e) {
          console.warn("No se pudo actualizar el carrito local:", e)
        }
        setToastText("Agregado al carrito")
        setToastOpen(true)
        setTimeout(() => setToastOpen(false), 3000)
      } else {
        setToastText("No se pudo agregar")
        setToastOpen(true)
        setTimeout(() => setToastOpen(false), 3000)
      }
      // Optionally navigate to cart
      // window.location.href = "/store/cart"
    } catch (e) {
      console.error(e)
      setToastText("Error al agregar")
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  async function handleShareProduct() {
    try {
      const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "")
      const sharePayload: any = {
        title: p.name,
        text: p.description?.slice(0, 120) || p.name,
        url,
      }
      const navAny = typeof navigator !== "undefined" ? (navigator as any) : null
      if (navAny && typeof navAny.share === "function") {
        await navAny.share(sharePayload)
        return
      }
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        alert("Enlace copiado")
      } else {
        // Fallback: open Facebook share
        const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        window.open(fb, "_blank")
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <main className={openSans.className}>
      <Head>
        <title>{p.name} | Romana Ebanistería</title>
        <meta name="description" content={p.description?.slice(0, 150) || "Producto"} />
        <meta property="og:title" content={p.name} />
        <meta property="og:image" content={p.image || ""} />
      </Head>
      <Header />
      <div className="container mx-auto mt-24 px-4 py-12 lg:px-8">
        <nav className="mb-6 text-xs text-gray-500">
          <Link href="/store" className="hover:text-gray-800">{storePage.title}</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-700 line-clamp-1 align-top">{p.name}</span>
        </nav>
        <div className="grid gap-y-12 gap-x-12 lg:grid-cols-12">
          {/* Gallery */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="relative w-full overflow-hidden bg-white">
              <AnimatePresence mode="wait">
                <motion.figure
                  key={currentImageUrl || p.image}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
              <Image
                src={currentImageUrl || p.image || "/placeholder.svg"}
                alt={p.name}
                    width={1000}
                    height={1000}
                className="h-auto w-full object-cover"
                priority
              />
                </motion.figure>
              </AnimatePresence>
              {/* Social share button overlay */}
              <div className="absolute right-3 top-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleShareProduct}
                  aria-label="Compartir producto"
                  className="bg-white/90 p-2 text-gray-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
            {(() => {
              const images = Array.from(new Set([
                currentImageUrl,
                p.image,
                ...(p.variants || []).map(v => v.image)
              ].filter(Boolean))) as string[]
              return images.length > 1 ? (
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {images.slice(0, 10).map((src, idx) => (
                    <button
                      key={src + idx}
                      onClick={() => setCurrentImageUrl(src)}
                      aria-label={`Vista ${idx + 1}`}
                      className={`relative aspect-square border ${currentImageUrl === src ? "border-gray-900" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <Image src={src || "/placeholder.svg"} alt={`${p.name} ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              ) : null
            })()}
          </div>

          {/* Buy Box */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 lg:text-4xl">{p.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
              {p.type && <span>{p.type}</span>}
              {p.vendor && p.type && <span className="text-gray-400">·</span>}
              {p.vendor && <span>{p.vendor}</span>}
              {(activeVariant?.sku || p.sku) && (p.type || p.vendor) && <span className="text-gray-400">·</span>}
              {(activeVariant?.sku || p.sku) && (
                <span>SKU {activeVariant?.sku || p.sku}</span>
              )}
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-800">
                <span className={`h-1.5 w-1.5 rounded-full ${availability.tone === "in" ? "bg-emerald-600" : availability.tone === "pre" ? "bg-amber-600" : "bg-red-600"}`} aria-hidden />
                {availability.label}
              </span>
            </div>

            <div className="mt-6 flex items-end gap-4">
              <p className="text-3xl font-semibold text-gray-900 tabular-nums">{priceFormatted}</p>
              {compareFormatted && (
                <span className="text-sm text-gray-500 line-through">{compareFormatted}</span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">ITBIS incluido</p>

            {(colorLabel || materialLabel) && (
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                {colorLabel && (
                  <span className="inline-flex items-center gap-2 border border-gray-200 px-3 py-1 text-gray-700">
                    <span className="h-4 w-4 border" style={{ backgroundColor: colorLabel }} aria-hidden />
                    Color: {colorLabel}
                  </span>
                )}
                {materialLabel && (
                  <span className="inline-flex items-center gap-2 border border-gray-200 px-3 py-1 text-gray-700">Material: {materialLabel}</span>
                )}
            </div>
            )}

            {p.variants.length > 1 && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h2 className="mb-2 text-sm font-semibold tracking-wide text-gray-800">Variantes</h2>
                <ul className="space-y-2 text-sm">
                  {p.variants.map(v => (
                    <li key={v.id} className={`flex items-center justify-between border px-3 py-2 ${selectedVariantId === v.id ? "border-gray-900 bg-gray-50" : "border-gray-200"}`}>
                      <span className="line-clamp-1 pr-4">{v.name}</span>
                      <button
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-2 py-1 text-xs font-medium border ${selectedVariantId === v.id ? "border-gray-900 text-gray-900" : "border-gray-300 text-gray-700 hover:border-gray-400"}`}
                        aria-pressed={selectedVariantId === v.id}
                      >
                        {selectedVariantId === v.id ? "Activa" : "Ver"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                disabled={availability.tone === "out"}
                onClick={handleAddToCart}
                className={`px-6 py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-primary/40 ${availability.tone === "out" ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary/90"}`}
                aria-disabled={availability.tone === "out"}
              >
                {availability.tone === "out" ? "Agotado" : "Agregar al carrito"}
              </button>
              {availability.tone === "out" && (
                <button className="border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Notificarme</button>
              )}
              <Link href="/store" className="border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Seguir comprando</Link>
            </div>

            {/* Quick Benefits - divider row */}
            <div className="mt-14 grid grid-cols-2 items-center gap-y-12 gap-x-2 text-md lg:grid-cols-2 divide-gray-200">
              <div className="flex items-center gap-2 lg:px-0">
                <Truck className="text-primary" size={20} />
                <span className="text-gray-800">Envío gratis</span>
              </div>
              <div className="flex items-center gap-2 lg:px-0">
                <Wrench className="text-primary" size={20} />
                <span className="text-gray-800">Instalación incluida</span>
              </div>
              <div className="flex items-center gap-2 lg:px-0">
                <CreditCard className="text-primary" size={20} />
                <span className="text-gray-800">Financiamiento</span>
              </div>
              <div className="flex items-center gap-2 lg:px-0">
                <Shield className="text-primary" size={20} />
                <span className="text-gray-800">Garantía total</span>
              </div>
            </div>

            {/* Finance Calculator - minimalist */}
            <div className="mt-10 border border-gray-200 p-4 flex flex-col gap-4">
              <h2 className="text-lg font-semibold tracking-wide text-gray-800">Calculadora de financiamiento</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-1">
                <label className="text-xs text-gray-600">
                  Total (DOP)
                  <input
                    type="number"
                    value={calcInputs.total}
                    onChange={(e) => setCalcInputs(v => ({ ...v, total: Number(e.target.value) }))}
                    className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </label>
                <label className="text-xs text-gray-600">
                  Inicial (%)
                  <input
                    type="number"
                    value={calcInputs.downPaymentPct}
                    onChange={(e) => setCalcInputs(v => ({ ...v, downPaymentPct: Number(e.target.value) }))}
                    className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </label>
                <label className="text-xs text-gray-600">
                  Interés anual (%)
                  <input
                    type="number"
                    value={calcInputs.annualInterestPct}
                    onChange={(e) => setCalcInputs(v => ({ ...v, annualInterestPct: Number(e.target.value) }))}
                    className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </label>
                <label className="text-xs text-gray-600">
                  Meses
                  <input
                    type="number"
                    value={calcInputs.months}
                    onChange={(e) => setCalcInputs(v => ({ ...v, months: Number(e.target.value) }))}
                    className="mt-1 w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:items-center sm:justify-between">
                <button onClick={calculateMonthlyPayment} className="bg-gray-100 border border-gray-300 px-4 w-full py-2.5 text-sm font-semibold text-black hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40">Calcular</button>
                {calcResult !== null && (
                  <div className="flex flex-col justify-between w-full items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <p className="text-sm text-gray-900">Cuota mensual: <span className="font-semibold tabular-nums">{new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(calcResult)}</span></p>
                    <Link
                      href={{
                        pathname: "/financing",
                        query: {
                          amount: String(calcInputs.total || priceNumber),
                          down: String(Math.round((calcInputs.total || priceNumber) * ((calcInputs.downPaymentPct || 0) / 100))),
                          currency: currency
                        }
                      }}
                      className="border border-gray-300 bg-primary px-4 py-2.5 text-sm font-semibold text-gray-50 hover:bg-primary/90"
                    >
                      Aplicar a financiamiento
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div role="tablist" aria-label="Detalles del producto" className="relative flex flex-wrap gap-6 border-b border-gray-200">
            {[
              { key: "description", label: "Descripción" },
              { key: "info", label: "Información adicional" },
              { key: "reviews", label: "Reseñas" },
            ].map(t => (
              <button
                key={t.key}
                role="tab"
                aria-selected={activeTab === t.key}
                aria-controls={`tab-panel-${t.key}`}
                onClick={(e) => setActiveTab(t.key as any)}
                className={`relative -mb-px px-0 pb-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 ${activeTab === t.key ? "text-gray-900" : "text-gray-600 hover:text-gray-800"}`}
              >
                {t.label}
                {activeTab === t.key && (
                  <motion.span layoutId="tab-underline" className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-gray-900" />
                )}
              </button>
            ))}
          </div>
          <div className="relative">
            <AnimatePresence mode="wait">
              {activeTab === "description" && (
                <motion.div
                  key="desc"
                  role="tabpanel"
                  id="tab-panel-description"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.18 }}
                  className="prose prose-sm mt-6 max-w-none text-gray-700"
                >
                  <p>{p.description}</p>
                </motion.div>
              )}
              {activeTab === "info" && (
                <motion.div
                  key="info"
                  role="tabpanel"
                  id="tab-panel-info"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.18 }}
                  className="mt-6 grid grid-cols-1 gap-4 text-sm text-gray-700 sm:grid-cols-2"
                >
                  <div className="border border-gray-200 p-4"><span className="text-gray-500">Categoría</span><div className="mt-1 font-medium">{p.type || "-"}</div></div>
                  <div className="border border-gray-200 p-4"><span className="text-gray-500">Proveedor</span><div className="mt-1 font-medium">{p.vendor || "-"}</div></div>
                  <div className="border border-gray-200 p-4"><span className="text-gray-500">SKU</span><div className="mt-1 font-medium">{activeVariant?.sku || p.sku || "-"}</div></div>
                  <div className="border border-gray-200 p-4"><span className="text-gray-500">Stock</span><div className="mt-1 font-medium">{p.track_stock ? p.total_qty : "—"}</div></div>
                </motion.div>
              )}
              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  role="tabpanel"
                  id="tab-panel-reviews"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.18 }}
                  className="mt-4"
                >
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={18} className="text-amber-400" fill="#fbbf24" />
                    ))}
                    <span className="text-sm text-gray-600">0.0 (0 reseñas)</span>
                  </div>
                  <div className="mt-4 border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                    Aún no hay reseñas para este producto.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 p-3 backdrop-blur md:hidden border-t border-gray-200">
        <div className="container mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Desde</p>
            <p className="text-lg font-semibold text-gray-900">{priceFormatted}</p>
          </div>
          <button
            disabled={availability.tone === "out"}
            onClick={handleAddToCart}
            className={`flex-1 px-5 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary/40 ${availability.tone === "out" ? "bg-gray-400" : "bg-primary hover:bg-primary/90"}`}
            aria-disabled={availability.tone === "out"}
          >
            {availability.tone === "out" ? "Agotado" : "Agregar al carrito"}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toastOpen && (
        <div className="fixed bottom-20 right-4 z-50 bg-gray-900 text-white px-4 py-3 text-sm">
          {toastText}
        </div>
      )}

      <Footer />
    </main>
  )
}

export const getServerSideProps: GetServerSideProps<ProductDetailProps> = async (ctx) => {
  const { id } = ctx.params || {}
  const host = ctx.req.headers.host
  const protocol = host?.startsWith("localhost") ? "http" : "https"
  try {
    const res = await fetch(`${protocol}://${host}/api/falitech/products/${id}`, { cache: "no-store" })
    if (!res.ok) {
      if (res.status === 404) {
        return { props: { product: null, error: "Producto no encontrado" } }
      }
      const txt = await res.text()
      return { props: { product: null, error: txt || "Error al cargar producto" } }
    }
    const json = await res.json()
    return { props: { product: json?.data || null } }
  } catch (e: any) {
    return { props: { product: null, error: e.message || "Error interno" } }
  }
}
