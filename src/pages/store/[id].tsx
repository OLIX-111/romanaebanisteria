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
import { mapProduct, type MappedProductDetail, type ProductSource } from "@/types/catalog"

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
    // Placeholder: lógica real se integrará luego
    console.log("Agregar a carrito", activeVariant?.id)
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
      <div className="container mx-auto mt-28 px-6 py-16">
        <nav className="mb-8 text-sm text-slate-500 flex items-center gap-2">
          <Link href="/store" className="hover:text-slate-700 transition-colors">
            {storePage.title}
          </Link>
          <span className="text-slate-400">•</span>
          <span className="text-slate-700 truncate max-w-[60%] font-medium">{p.name}</span>
        </nav>
        <div className="grid gap-y-16 gap-x-16 lg:grid-cols-12">
          <div className="lg:col-span-7 xl:col-span-7">
            <ProductGallery
              images={activeVariant?.gallery || []}
              mainImage={activeVariant?.image || p.thumbnail || "/placeholder.svg"}
              alt={p.name}
            />
          </div>
          <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-32 lg:self-start space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl text-balance">{p.name}</h1>
              <div className="flex items-center gap-4 text-sm">
                {p.category && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-medium">{p.category}</span>
                )}
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-full ${availability.tone === "in" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${availability.tone === "in" ? "bg-emerald-500" : "bg-red-500"}`}
                  ></span>
                  {availability.label}
                </span>
              </div>
              <PriceBlock price={priceNumber} comparePrice={comparePrice} />
              <p className="text-sm text-slate-500 font-medium">ITBIS incluido • Envío gratuito</p>
            </div>
            <div className="grid grid-cols-1 gap-4 p-6 bg-slate-50/80 rounded-2xl border border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Truck size={20} className="text-slate-600" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Envío gratuito</span>
                  <p className="text-sm text-slate-600">A todo el país</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <ShieldCheck size={20} className="text-slate-600" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Garantía total</span>
                  <p className="text-sm text-slate-600">12 meses de cobertura</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Home size={20} className="text-slate-600" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Instalación incluida</span>
                  <p className="text-sm text-slate-600">Servicio profesional</p>
                </div>
              </div>
            </div>
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
            <div className="flex gap-4 pt-4">
              <button
                disabled={availability.tone === "out"}
                onClick={handleAddToCart}
                className={`flex-1 px-8 py-4 text-base font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${availability.tone === "out" ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900/20 shadow-lg hover:shadow-xl"}`}
              >
                {availability.tone === "out" ? "Agotado" : "Agregar al carrito"}
              </button>
              <button
                type="button"
                onClick={handleShareProduct}
                aria-label="Compartir producto"
                className="px-6 py-4 text-base font-semibold border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:ring-offset-2"
              >
                <Share2 size={20} />
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
        <ProductTabs
          description={p.description}
          details={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
              <div className="space-y-2">
                <span className="text-slate-500 font-medium">Categoría</span>
                <div className="font-semibold text-slate-800 text-lg">{p.category}</div>
              </div>
              <div className="space-y-2">
                <span className="text-slate-500 font-medium">Variantes disponibles</span>
                <div className="font-semibold text-slate-800 text-lg">{p.variants.length}</div>
              </div>
            </div>
          }
          shipping={
            <div className="space-y-4">
              <p className="text-base text-slate-700 leading-7">
                <strong>Tiempo estimado de entrega:</strong> 7-10 días laborables.
              </p>
              <p className="text-base text-slate-700 leading-7">
                Ofrecemos envío gratuito a todo el territorio nacional. Nuestro equipo se pondrá en contacto contigo
                para coordinar la entrega e instalación.
              </p>
            </div>
          }
        />
      </div>
      <Footer />
    </main>
  )
}

export const getServerSideProps: GetServerSideProps<ProductDetailProps> = async (ctx) => {
  try {
    const { id } = ctx.params || {}
    const raw: ProductSource = {
      product_id: "e6315130-dee6-420c-9493-75760e77d58a",
      name: "Silla Escandinava",
      description: "Silla de madera de pino con acabado blanco, inspirada en el diseño nórdico. Ergonómica y ligera.",
      category: "Sillas",
      main_image: {
        id: "dffa9a68-68ac-4d26-9914-3e996f4e8ffa",
        alt_text: "Silla escandinava blanca",
        image_url: "https://i.pinimg.com/736x/f3/4f/26/f34f269d88e92de573846ee817b26777.jpg",
        created_at: "2025-09-01T18:27:40.538812+00:00",
        product_id: "e6315130-dee6-420c-9493-75760e77d58a",
        variant_id: "c3032643-73f1-4cd0-a808-26fb72ae5e66",
        is_thumbnail: true,
      },
      variants: [
        {
          price: 82000,
          stock: 20,
          is_on_sale: true,
          sale_price: 69000,
          variant_id: "1a4b4a5b-d19f-4bb7-b17a-841a6e3f81e2",
          is_available: true,
          variant_name: "Silla Gris Grafito con Cojín",
          is_financeable: true,
          variant_main_images: [
            {
              id: "a1d34f19-7a6e-4f8b-9c2c-81f3aa7b14e7",
              alt_text: "Silla escandinava gris con cojín",
              image_url: "https://i.pinimg.com/736x/21/1f/9d/211f9d0f63b43aa143cc21c7811bdbcd.jpg",
              created_at: "2025-09-03T12:10:40.538812+00:00",
              product_id: "e6315130-dee6-420c-9493-75760e77d58a",
              variant_id: "1a4b4a5b-d19f-4bb7-b17a-841a6e3f81e2",
              is_thumbnail: true,
            },
          ],
          secondary_images: [
            {
              id: "7c085aca-572d-4390-b751-5771fd3548f5",
              alt_text: "Silla escandinava de madera natural",
              image_url: "https://i.pinimg.com/736x/f3/4f/26/f34f269d88e92de573846ee817b26777.jpg",
              created_at: "2025-09-01T18:27:40.538812+00:00",
              product_id: "e6315130-dee6-420c-9493-75760e77d58a",
              variant_id: null,
              is_thumbnail: false,
            },
            {
              id: "7c085aca-572d-4390-b751-5771fd3548f5",
              alt_text: "Silla escandinava de madera natural",
              image_url: "https://i.pinimg.com/736x/f3/4f/26.jpg",
              created_at: "2025-09-01T18:27:40.538812+00:00",
              product_id: "e6315130-dee6-420c-9493-75760e77d58a",
              variant_id: null,
              is_thumbnail: false,
            },
            {
              id: "7c085aca-572d-4390-b751-5771fd3548f5",
              alt_text: "Silla escandinava de madera natural",
              image_url: "https://i.pinimg.com/736x/f3/26/f34f269d88e92de573846ee817b26777.jpg",
              created_at: "2025-09-01T18:27:40.538812+00:00",
              product_id: "e6315130-dee6-420c-9493-75760e77d58a",
              variant_id: null,
              is_thumbnail: false,
            },
          ],
        },
        {
          price: 75000,
          stock: 15,
          is_on_sale: false,
          sale_price: null,
          variant_id: "30bb3a5d-d8a7-4806-a01d-52eea9f13c5f",
          is_available: true,
          variant_name: "Silla Madera Natural",
          is_financeable: false,
          variant_main_images: [
            {
              id: "dffa9a68-68ac-4d26-9914-3e996f4e8ffa",
              alt_text: "Silla escandinava blanca",
              image_url: "",
              created_at: "2025-09-01T18:27:40.538812+00:00",
              product_id: "e6315130-dee6-420c-9493-75760e77d58a",
              variant_id: "30bb3a5d-d8a7-4806-a01d-52eea9f13c5f",
              is_thumbnail: true,
            },
          ],
          secondary_images: [
            {
              id: "7c085aca-572d-4390-b751-5771fd3548f5",
              alt_text: "Silla escandinava de madera natural",
              image_url: "https://i.pinimg.com/736x/f3/4f/26/f34f269d88e92de573846ee817b26777.jpg",
              created_at: "2025-09-01T18:27:40.538812+00:00",
              product_id: "e6315130-dee6-420c-9493-75760e77d58a",
              variant_id: null,
              is_thumbnail: false,
            },
            {
              id: "7c085aca-572d-4390-b751-5771fd3548f5",
              alt_text: "Silla escandinava de madera natural",
              image_url: "https://i.pinimg.com/736x/f3/4f/26/f34f269d88e92de573846ee817b26777.jpg",
              created_at: "2025-09-01T18:27:40.538812+00:00",
              product_id: "e6315130-dee6-420c-9493-75760e77d58a",
              variant_id: null,
              is_thumbnail: false,
            },
          ],
        },
      ],
    }

    if (id && id !== raw.product_id) {
      return { props: { product: null, error: "Producto no encontrado" } }
    }

    const mapped = mapProduct(raw)
    return { props: { product: mapped } }
  } catch (e: any) {
    return { props: { product: null, error: e.message || "Error interno" } }
  }
}
