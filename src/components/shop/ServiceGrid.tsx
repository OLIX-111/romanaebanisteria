"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"


interface ServiceGridProps {
  services: any[]
}

export default function ServiceGrid({ services }: ServiceGridProps) {
  return (
    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="group"
        >
          <div className="aspect-square overflow-hidden bg-gray-100">
            <Image
              src={service.image || "/placeholder.svg"}
              alt={service.name}
              width={300}
              height={400}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              <Link href="">
                {service.name}
              </Link>
            </h3>
            <p className="text-sm text-gray-500">{service.category}</p>
            <p className="text-lg font-medium text-gray-900">RD$ {service.price.toLocaleString()}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {service.availability}
              </span>
              <span className="text-sm text-gray-500">
                {service.duration}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

