"use client"

import { getProductsTableros } from "@/utils/api"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useTranslation } from "@/hook/UseTranslation"

interface FeaturedProduct {
  id: number
  name: string
  image: string
  description: string
  price: number
  type: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function FeaturedProductsElegant() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dict = useTranslation()
  const { storeSection } = dict

  useEffect(() => {
    async function loadFeaturedProducts() {
      try {
        const response = await getProductsTableros()

        // Obtener solo los primeros 6 productos con type === "Tableros"
        const tablerosProducts = response.data.filter((product: FeaturedProduct) => product.type === "Tableros").slice(0, 6)

        setFeaturedProducts(tablerosProducts)
      } catch (error) {
        console.error("Error fetching featured products:", error)
        setError("Error al cargar los productos destacados. Por favor, intente de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    loadFeaturedProducts()
  }, [])

  if (isLoading) {
    return <div className="text-center py-24">{storeSection?.loading}</div>
  }

  if (error) {
    return <div className="text-center py-24 text-red-500">{storeSection?.error}</div>
  }

  return (
    <section className="w-full bg-white py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-medium text-gray-900 mb-4">{storeSection?.featuredTitle}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {storeSection?.featuredSubtitle}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
        >
          {featuredProducts.map((product) => (
            <motion.div key={product.id} variants={item} className="group">
              <Link href={`/store/products/${product.id}`} className="block">
                <div className="aspect-square overflow-hidden bg-gray-100 mb-6">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                <span className="text-lg font-medium text-gray-900">RD$ {product.price.toLocaleString()}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="flex justify-center mt-12">
        <Link href="/store" passHref>
          <motion.button
            whileHover={{ gap: "0.75rem" }}
            className="bg-white backdrop-blur-lg text-black border-black hover:border-black hover:bg-black w-fit flex items-center gap-2 py-3 px-8 border-2 rounded-md hover:text-white duration-300"
          >
            {storeSection?.viewMore} <ArrowRight size={18} />
          </motion.button>
        </Link>
      </div>
    </section>
  )
}
