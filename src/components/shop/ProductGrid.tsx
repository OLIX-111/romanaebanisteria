"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
export interface Product {
    id: number
    name: string
    price: number
    category: string
    material: string
    finish: string
    color: string
    dimensions: {
      width: number
      height: number
      depth: number
    }
    availability: string
    customizable: boolean
    deliveryTime: string
    image: string
    description: string
  }
  
  

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="group"
        >
          <div className="aspect-square overflow-hidden bg-gray-100">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={300}
              height={400}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              <Link href={`/store/product/${product.id}`}>
                {product.name}
              </Link>
            </h3>
            <p className="text-sm text-gray-500">
              {product.material} - {product.finish}
            </p>
            <p className="text-lg font-medium text-gray-900">RD$ {product.price.toLocaleString()}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{product.availability}</span>
              <span className="text-sm text-gray-500">{product.deliveryTime}</span>
            </div>
            {product.customizable && <p className="text-sm text-primary">Personalización disponible</p>}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

