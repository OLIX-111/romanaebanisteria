import { GetServerSideProps } from "next"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useTranslation } from "@/hook/UseTranslation"
import { useState } from "react"

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
  const priceFormatted = new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(activeVariant?.price ?? product.price)

  return (
    <main className={openSans.className}>
      <Head>
        <title>{product.name} | Romana Ebanistería</title>
        <meta name="description" content={product.description?.slice(0, 150)} />
        <meta property="og:title" content={product.name} />
        <meta property="og:image" content={product.image} />
      </Head>
      <Header />
      <div className="container mx-auto mt-24 px-4 py-10 lg:px-8">
        <nav className="mb-6 text-xs text-gray-500">
          <Link href="/store" className="hover:text-gray-800">{storePage.title}</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-700 line-clamp-1 align-top">{product.name}</span>
        </nav>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <Image
                src={activeVariant?.image || product.image || "/placeholder.svg"}
                alt={product.name}
                width={900}
                height={900}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
            {product.variants.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`group relative aspect-square overflow-hidden rounded-lg border text-[10px] ${selectedVariantId === v.id ? "border-primary ring-2 ring-primary/30" : "border-gray-200 hover:border-gray-300"}`}
                    aria-label={v.name}
                  >
                    <Image src={v.image || "/placeholder.svg"} alt={v.name} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">{product.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-700">{product.type}</span>
              <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-700">{product.vendor}</span>
              {product.track_stock && (
                <span className="rounded bg-emerald-100 px-2 py-1 font-medium text-emerald-700">Stock: {product.total_qty}</span>
              )}
            </div>
            <div className="mt-6 flex items-end gap-4">
              <p className="text-3xl font-semibold text-gray-900 tabular-nums">{priceFormatted}</p>
              {activeVariant?.compare_price > activeVariant.price && (
                <span className="text-sm text-gray-500 line-through">
                  {new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(activeVariant.compare_price)}
                </span>
              )}
            </div>
            <div className="prose prose-sm mt-6 max-w-none text-gray-700">
              <p>{product.description}</p>
            </div>
            {product.variants.length > 1 && (
              <div className="mt-8">
                <h2 className="mb-2 text-sm font-semibold tracking-wide text-gray-800">Variantes</h2>
                <ul className="space-y-2 text-sm">
                  {product.variants.map(v => (
                    <li key={v.id} className={`flex items-center justify-between rounded-md border px-3 py-2 ${selectedVariantId === v.id ? "border-primary bg-primary/5" : "border-gray-200"}`}>
                      <span className="line-clamp-1 pr-4">{v.name}</span>
                      <button
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`rounded px-2 py-1 text-xs font-medium ${selectedVariantId === v.id ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        {selectedVariantId === v.id ? "Activa" : "Ver"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-10 flex flex-wrap gap-3">
              <button className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40">Agregar al carrito</button>
              <Link href="/store" className="rounded-md border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Seguir comprando</Link>
            </div>
          </div>
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
