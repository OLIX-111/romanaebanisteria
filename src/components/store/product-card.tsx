import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"

interface ProductCardProps {
  id: number
  name: string
  image: string
  price: number
  description: string
  type: string
  vendor: string
}

export function ProductCard({ id, name, image, price, description, type, vendor }: ProductCardProps) {
  return (
    <Link href={`/store/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="group cursor-pointer"
      >
        <div className="aspect-square overflow-hidden bg-gray-100">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            width={1100}
            height={900}
            className="h-full w-full object-cover border border-gray-100 object-center transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between flex-col gap-2">
            <h3 className="text-lg font-medium text-gray-900">{name}</h3>
            <p className="text-lg font-medium text-gray-900">RD$ {price.toLocaleString()}</p>
          </div>
          <p className="text-sm text-gray-500">
            {type}
          </p>
        </div>
      </motion.div>
    </Link>
  )
}

