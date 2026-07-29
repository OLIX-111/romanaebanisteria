"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useTranslation } from "@/hook/UseTranslation"

interface ServiceDetailProps {
  service: {
    name: string
    slug: string
    imageUrl: string
    gallery: string[]
    price: number
    categoryName: string
    description: any
    availability: string
    duration: string
  }
}

export function ServiceDetail({ service }: ServiceDetailProps) {
  const dict = useTranslation()
  const { serviceDetail } = dict
  const [currentImage, setCurrentImage] = useState(service.imageUrl)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/store" className="mb-8 inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {serviceDetail.backToServices}
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={currentImage || "/placeholder.svg"}
              alt={service.name}
              width={800}
              height={800}
              className="h-full w-full object-cover object-center"
              priority
            />
          </div>
          <div className="mt-4 grid grid-cols-5 gap-4">
            {[service.imageUrl, ...(service.gallery || [])].map((img, index) => (
              <div
                key={index}
                className={`aspect-square cursor-pointer overflow-hidden rounded-lg ${img === currentImage ? "ring-2 ring-primary" : ""}`}
                onClick={() => setCurrentImage(img)}
              >
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`${service.name} - ${serviceDetail.imageAlt} ${index + 1}`}
                  width={100}
                  height={100}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{serviceDetail.description}</h2>
            <div className="prose prose-lg text-gray-600">
              {service.description && typeof service.description === "string" && (
                <p>{service.description}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <span className="text-sm font-medium">{serviceDetail.availability}</span>
              <span className="text-sm text-blue-600">{service.availability}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href={`/store/cotizacion/${service.slug}`} passHref className="w-full">
              <button className="flex-1 w-full rounded-lg bg-primary px-8 py-4 text-sm font-medium text-white hover:bg-orange-400 duration-200">
                {serviceDetail.requestQuote}
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
