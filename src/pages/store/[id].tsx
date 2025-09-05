"use client"

import type { GetServerSideProps } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useTranslation } from "@/hook/UseTranslation"
import { useEffect, useState, useMemo } from "react"
import { Home, Share2, ShieldCheck, Truck } from "lucide-react"
import { ProductGallery } from "@/components/store/modern/ProductGallery"
import { VariantSelector } from "@/components/store/modern/VariantSelector"
import { PriceBlock } from "@/components/store/modern/PriceBlock"
import { ProductTabs } from "@/components/store/modern/ProductTabs"
import { ProductFinanceCalculator } from "@/components/store/modern/ProductFinanceCalculator"
import { type MappedProductDetail } from "@/types/catalog"
import { getProductWithDetailsById } from '@/utils/supabase'
import { useCart } from "@/hook/useCart"

const openSans = Open_Sans({ subsets: ["latin"] })

interface ProductDetailProps {
  product: MappedProductDetail | null
  error?: string | null
}

export default function ProductDetailPage({ product, error }: ProductDetailProps) {
  const router = useRouter()
  const dict = useTranslation()
  const { storePage } = dict
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product?.variants?.[0]?.id || "")
  const [shareUrl, setShareUrl] = useState<string>("")
  const { addItem } = useCart()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href)
    }
  }, [])

  const availability = useMemo(() => {
    const variant = product?.variants.find((v) => v.id === selectedVariantId) || product?.variants[0]
    if (!variant) return { label: "", tone: "out" as const }
    if (variant.stock > 0) return { label: "Disponible", tone: "in" as const }
    return { label: "Agotado", tone: "out" as const }
  }, [product, selectedVariantId])

  if (error) {
    return (
      <main className={openSans.className}>
        <Header />
        <div className="container mx-auto mt-28 px-4 py-16 text-center">
          <p className="text-red-500 mb-6">{error}</p>
          <Link href="/store" className="text-primary underline">
            Volver a la tienda
          </Link>
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
          <Link href="/store" className="text-primary underline">
            Volver a la tienda
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const p = product as MappedProductDetail
  const activeVariant = p.variants.find((v) => v.id === selectedVariantId) || p.variants[0]
  const currency = "DOP"
  const priceNumber = activeVariant?.price || p.minPrice
  const comparePrice =
    activeVariant?.comparePrice && activeVariant.comparePrice > priceNumber ? activeVariant.comparePrice : undefined

  function handleAddToCart() {
    if (!activeVariant) return
    addItem({
      productId: p.id,
      variantId: activeVariant.id,
      name: p.name + (activeVariant.name ? ` - ${activeVariant.name}` : ""),
      price: activeVariant.price,
      comparePrice: activeVariant.comparePrice,
      image: activeVariant.image || p.thumbnail,
      max: activeVariant.stock,
    })
  }

  async function handleShareProduct() {
    try {
      const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "")
      const payload = { title: p.name, text: p.description.slice(0, 120), url }
      const navAny = typeof navigator !== "undefined" ? (navigator as any) : null
      if (navAny?.share) {
        await navAny.share(payload)
        return
      }
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
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
        <meta property="og:image" content={activeVariant?.image || p.thumbnail || ""} />
      </Head>
      <Header />
  <div className="container mx-auto mt-24 px-6 pb-28 pt-10">
        <nav className="mb-8 text-sm text-slate-500 flex items-center gap-2">
          <Link href="/store" className="hover:text-slate-700 transition-colors">
            {storePage.title}
          </Link>
          <span className="text-slate-400">•</span>
          <span className="text-slate-700 truncate max-w-[60%] font-medium">{p.name}</span>
        </nav>
        <div className="grid gap-y-20 gap-x-16 lg:grid-cols-12">
          <div className="lg:col-span-7 xl:col-span-7 order-2 lg:order-1">
            <ProductGallery
              images={activeVariant?.gallery || []}
              mainImage={activeVariant?.image || p.thumbnail || "/placeholder.svg"}
              alt={p.name}
            />
            <div className="mt-16 border-t border-slate-200 pt-12 hidden lg:block">
              <ProductTabs
                description={p.description}
                details={
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-base">
                    <div className="space-y-3">
                      <span className="text-slate-500 font-medium text-xs tracking-wide uppercase">Categoría</span>
                      <div className="font-semibold text-slate-900 text-lg leading-tight">{p.category}</div>
                    </div>
                    <div className="space-y-3">
                      <span className="text-slate-500 font-medium text-xs tracking-wide uppercase">Variantes</span>
                      <div className="font-semibold text-slate-900 text-lg leading-tight">{p.variants.length}</div>
                    </div>
                  </div>
                }
                shipping={
                  <div className="space-y-5 text-sm leading-relaxed text-slate-700">
                    <p><strong className="font-semibold text-slate-900">Entrega estimada:</strong> 7-10 días laborables.</p>
                    <p>Envío gratuito nacional e instalación profesional coordinada tras la compra.</p>
                  </div>
                }
              />
            </div>
          </div>
          <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-10 lg:self-start order-1 lg:order-2 space-y-10">
            <div className="space-y-6">
              <span className="inline-block text-[11px] tracking-widest font-medium text-slate-500 uppercase">Romana Ebanistería</span>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl leading-[1.05]">{p.name}</h1>
              <div className="flex items-center gap-5 text-xs">
                <span className={`inline-flex items-center gap-2 px-2.5 py-1 font-semibold border ${availability.tone === 'in' ? 'border-primary text-primary' : 'border-red-600 text-red-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${availability.tone === 'in' ? 'bg-primary' : 'bg-red-500'}`}></span>
                  {availability.label}
                </span>
                <span className="text-slate-400">•</span>
                {p.category && <span className="font-medium text-slate-600">{p.category}</span>}
              </div>
              <div className="space-y-2">
                <PriceBlock price={priceNumber} comparePrice={comparePrice} />
                <p className="text-[13px] text-slate-500">ITBIS incluido · Envío gratuito · Garantía 12 meses</p>
              </div>
            </div>
            <ProductFinanceCalculator
              basePrice={priceNumber}
              variantId={activeVariant?.id || ''}
              currency={currency}
              onApply={(data) => {
                router.push({
                  pathname: '/financing/apply',
                  query: {
                    productId: String(p.id),
                    variantId: activeVariant?.id || '',
                    productName: p.name + (activeVariant?.name ? ` - ${activeVariant.name}` : ''),
                    price: String(data.price || priceNumber || 0),
                    currency,
                    productImage: activeVariant?.image || p.thumbnail || '',
                  },
                })
              }}
            />
            <VariantSelector
              variants={p.variants.map((v) => ({
                id: v.id,
                name: v.name,
                price: v.price,
                comparePrice: v.comparePrice,
              }))}
              activeId={activeVariant?.id}
              onSelect={(id) => setSelectedVariantId(id)}
            />
            <div className="border border-slate-300 p-5 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-slate-600" />
                <p><strong>Envío gratuito</strong> a todo el país</p>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-slate-600" />
                <p><strong>Garantía total 12 meses</strong> cobertura completa</p>
              </div>
              <div className="flex items-center gap-3">
                <Home size={18} className="text-slate-600" />
                <p><strong>Instalación incluida</strong> servicio profesional</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                disabled={availability.tone === 'out'}
                onClick={handleAddToCart}
                className={`flex-1 px-8 py-4 text-base font-semibold tracking-tight border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${availability.tone === 'out' ? 'bg-slate-200 text-slate-500 cursor-not-allowed border-slate-300' : 'bg-primary text-white hover:bg-accent'}`}
              >
                {availability.tone === 'out' ? 'Agotado' : 'Agregar al carrito'}
              </button>
              <button
                type="button"
                onClick={handleShareProduct}
                aria-label="Compartir producto"
                className="px-6 py-4 text-base font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                <Share2 size={18} />
              </button>
            </div>
            <div className="pt-4">
              <Link
                href="/store"
                className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-4 font-medium transition-colors"
              >
                ← Seguir explorando productos
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 lg:hidden border-t border-slate-300 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 py-3 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs text-slate-500 leading-none mb-1">Total</p>
          {/* <PriceBlock price={priceNumber} comparePrice={comparePrice} /> */}
          <div> <strong className="text-lg">{priceNumber}</strong> <span className="line-through text-gray-400 text-[12px]">{comparePrice}</span> </div>
        </div>
        <button
          disabled={availability.tone === 'out'}
          onClick={handleAddToCart}
          className={`min-w-[48%] px-5 py-3 text-sm font-semibold tracking-tight border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${availability.tone === 'out' ? 'bg-slate-200 text-slate-500 cursor-not-allowed border-slate-300' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'}`}
        >
          {availability.tone === 'out' ? 'Agotado' : 'Agregar'}
        </button>
      </div>
      <Footer />
    </main>
  )
}

export const getServerSideProps: GetServerSideProps<ProductDetailProps> = async (ctx) => {
  const { id } = ctx.params || {};
  if (!id || typeof id !== 'string') return { props: { product: null, error: 'ID inválido' } };
  try {
    const product = await getProductWithDetailsById(id);
    if (!product) return { props: { product: null, error: 'Producto no encontrado' } };
    return { props: { product } };
  } catch (e: any) {
    return { props: { product: null, error: e.message || 'Error interno' } };
  }
}
