"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ProductDetail } from "@/components/store/ProductDetail"
import { Open_Sans } from "next/font/google"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { RecommendedProducts } from "@/components/store/RecomendedProjects"
import { getProductById, getProducts } from "@/utils/api"

const openSans = Open_Sans({ subsets: ["latin"] })

interface Product {
  id: number
  name: string
  image: string
  price: number
  description: string
  type: string
  vendor: string
  variants: {
    id: number
    name: string
    price: number
    image: string
    sku: string
  }[]
}

export default function ProductPage() {
  const router = useRouter()
  const { id } = router.query

  const [product, setProduct] = useState<Product | null>(null)
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      try {
        const productResponse = await getProductById(Number(id))
        const productData = productResponse.data
        setProduct(productData)

        // Obtener recomendaciones excluyendo el producto actual
        const productsResponse = await getProducts(4)
        const filteredRecommendations = productsResponse.data.filter((p: Product) => p.id !== productData.id)
        setRecommendations(filteredRecommendations)
      } catch (error) {
        console.error("Error fetching product:", error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) return <div className="text-center mt-24">Cargando...</div>
  if (!product) return <div className="text-center mt-24">Producto no encontrado</div>

  return (
    <main className={openSans.className}>
      <Header />
      <div className="px-4 py-8 sm:px-6 lg:px-8 mt-24">
        <div className="container mx-auto lg:px-4">
          <ProductDetail product={product} />
          <RecommendedProducts products={recommendations} />
        </div>
      </div>
      <Footer />
    </main>
  )
}
