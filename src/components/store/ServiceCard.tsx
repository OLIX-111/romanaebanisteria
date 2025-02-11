import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"

interface ServiceCardProps {
  name: string
  slug: { current: string }
  imageUrl: string
  categoryName: string
  price: number
  availability: string
  duration: string
}

export function ServiceCard({ name, imageUrl, slug, categoryName, price, availability, duration }: ServiceCardProps) {
  return (
    <Link href={`/store/services/${slug.current}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="group cursor-pointer"
      >
        <div className="aspect-square overflow-hidden bg-gray-100">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            width={300}
            height={400}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <h3 className="text-lg font-medium text-gray-900">{name}</h3>
            <p className="text-lg font-medium text-gray-900">RD$ {price.toLocaleString()}</p>
          </div>
          <p className="text-sm text-gray-500">{categoryName}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{availability}. Duración: {duration}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

