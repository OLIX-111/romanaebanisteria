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

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href)
    }
  }, [])

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

  const activeVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0]
  const currency = activeVariant?.currency || "DOP"
  const priceNumber = activeVariant?.price ?? product.price
  const priceFormatted = new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(priceNumber)
  const compareFormatted = activeVariant?.compare_price > priceNumber
    ? new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(activeVariant.compare_price)
    : null

  const availability: { label: string; tone: "in" | "out" | "pre" } = useMemo(() => {
    if (product.track_stock) {
      if (product.total_qty > 0) return { label: "Disponible", tone: "in" }
      return { label: "Agotado", tone: "out" }
    }
    if ((product.status || "").toLowerCase().includes("pre")) return { label: "Pre-orden", tone: "pre" }
    return { label: "Disponible", tone: "in" }
  }, [product])

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
      await fetch("/api/ecommerce/cart-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_ns, variant_id: activeVariant?.id, qty: 1 })
      })
      // Optionally navigate to cart
      // window.location.href = "/store/cart"
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <main className={openSans.className}>
      <Head>
        <title>{product.name} | Romana Ebanistería</title>
        <meta name="description" content={product.description?.slice(0, 150)} />
        <meta property="og:title" content={product.name} />
        <meta property="og:image" content={product.image} />
      </Head>
      <Header />
      <div className="container mx-auto mt-24 px-4 py-12 lg:px-8">
        <nav className="mb-6 text-xs text-gray-500">
          <Link href="/store" className="hover:text-gray-800">{storePage.title}</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-700 line-clamp-1 align-top">{product.name}</span>
        </nav>
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="relative w-full overflow-hidden border border-gray-200 bg-white">
              <AnimatePresence mode="wait">
                <motion.figure
                  key={activeVariant?.image || product.image}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <Image
                    src={activeVariant?.image || product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={1000}
                    height={1000}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </motion.figure>
              </AnimatePresence>
              {/* Social share button overlay */}
              <div className="absolute right-3 top-3 flex gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  aria-label="Compartir en Facebook"
                  className="bg-white/90 p-2 text-gray-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <Share2 size={16} />
                </a>
              </div>
            </div>
            {product.variants.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-4 sm:grid-cols-6">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`group relative aspect-square overflow-hidden border text-[10px] transition ${selectedVariantId === v.id ? "border-gray-900" : "border-gray-200 hover:border-gray-300"}`}
                    aria-label={v.name}
                    role="button"
                  >
                    <Image src={v.image || "/placeholder.svg"} alt={v.name} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buy Box */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
              {product.type && <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-700">{product.type}</span>}
              {product.vendor && <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-700">{product.vendor}</span>}
              {(activeVariant?.sku || product.sku) && (
                <span className="rounded bg-gray-50 px-2 py-1 font-medium">SKU: {activeVariant?.sku || product.sku}</span>
              )}
              <span
                className={`rounded px-2 py-1 font-medium ${availability.tone === "in" ? "bg-emerald-100 text-emerald-700" : availability.tone === "pre" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}
              >
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
                  <span className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1 text-gray-700">
                    <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: colorLabel }} aria-hidden />
                    Color: {colorLabel}
                  </span>
                )}
                {materialLabel && (
                  <span className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1 text-gray-700">Material: {materialLabel}</span>
                )}
              </div>
            )}

            {product.variants.length > 1 && (
              <div className="mt-6">
                <h2 className="mb-2 text-sm font-semibold tracking-wide text-gray-800">Variantes</h2>
                <ul className="space-y-2 text-sm">
                  {product.variants.map(v => (
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

            {/* Quick Benefits - slim row with dividers */}
            <div className="mt-8 grid grid-cols-2 items-start gap-y-3 gap-x-6 border border-gray-200 p-4 text-sm lg:grid-cols-4">
              <div className="flex items-center gap-2">
                <Truck className="text-primary" size={20} />
                <span className="text-gray-800">Envío gratis</span>
              </div>
              <div className="flex items-center gap-2 lg:border-l lg:border-gray-200 lg:pl-6">
                <Wrench className="text-primary" size={20} />
                <span className="text-gray-800">Instalación incluida</span>
              </div>
              <div className="flex items-center gap-2 lg:border-l lg:border-gray-200 lg:pl-6">
                <CreditCard className="text-primary" size={20} />
                <span className="text-gray-800">Financiamiento</span>
              </div>
              <div className="flex items-center gap-2 lg:border-l lg:border-gray-200 lg:pl-6">
                <Shield className="text-primary" size={20} />
                <span className="text-gray-800">Garantía total</span>
              </div>
            </div>

            {/* Finance Calculator - minimalist */}
            <div className="mt-8 border border-gray-200 p-4">
              <h2 className="text-sm font-semibold tracking-wide text-gray-800">Calculadora de financiamiento</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <div className="mt-4 flex items-center justify-between">
                <button onClick={calculateMonthlyPayment} className="bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40">Calcular</button>
                {calcResult !== null && (
                  <p className="text-sm text-gray-900">Cuota mensual: <span className="font-semibold tabular-nums">{new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(calcResult)}</span></p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div role="tablist" aria-label="Detalles del producto" className="flex flex-wrap gap-6 border-b border-gray-200">
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
                onClick={() => setActiveTab(t.key as any)}
                className={`-mb-px px-0 pb-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 ${activeTab === t.key ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-600 hover:text-gray-800"}`}
              >
                {t.label}
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
                  <p>{product.description}</p>
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
                  <div className="border border-gray-200 p-4"><span className="text-gray-500">Categoría</span><div className="mt-1 font-medium">{product.type || "-"}</div></div>
                  <div className="border border-gray-200 p-4"><span className="text-gray-500">Proveedor</span><div className="mt-1 font-medium">{product.vendor || "-"}</div></div>
                  <div className="border border-gray-200 p-4"><span className="text-gray-500">SKU</span><div className="mt-1 font-medium">{activeVariant?.sku || product.sku || "-"}</div></div>
                  <div className="border border-gray-200 p-4"><span className="text-gray-500">Stock</span><div className="mt-1 font-medium">{product.track_stock ? product.total_qty : "—"}</div></div>
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
            className={`flex-1 px-5 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary/40 ${availability.tone === "out" ? "bg-gray-400" : "bg-primary hover:bg-primary/90"}`}
            aria-disabled={availability.tone === "out"}
          >
            {availability.tone === "out" ? "Agotado" : "Agregar al carrito"}
          </button>
        </div>
      </div>

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
