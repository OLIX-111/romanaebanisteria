"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import Link from "next/link"
import { useTranslation } from "@/hook/UseTranslation"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { getServices } from "../../../sanity/sanityQueries"

interface Service {
  _id: string
  name: string
  description: string
  shortdescription: string
  imageUrl: string
  slug: { current: string }
  price: number
  categoryName: string
  duration: string
  availability: string
}

const SingleService = ({ service, index }: { service: Service; index: number }) => {
  const { ref, inView } = useInView({
    threshold: 0.14,
    triggerOnce: true,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-2 relative overflow-hidden group rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <Link href={`/store/services/${service.slug.current}`} className="block h-full">
        <div className="relative h-[30rem]">
          <Image
            src={service.imageUrl || "/placeholder.svg"}
            width={900}
            height={900}
            alt={service.description + " | ROMAna Ebanistería"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 z-10"
          />
        </div>
        <div className="absolute z-20 bg-gradient-to-t flex justify-end flex-col from-black/70 via-black/30 to-transparent bottom-0 left-0 right-0 p-6 transform transition-all duration-300 h-full">
          <div className="mt-auto">
            <h3 className="font-medium text-white text-xl mb-2 transition-transform duration-300">{service.name}</h3>
            <p className="text-gray-200 text-sm mb-4 h-0 opacity-0 overflow-hidden group-hover:h-16 group-hover:opacity-100 transition-all duration-300">
              {service.shortdescription}
            </p>
            <motion.div
              className="inline-flex items-center text-white opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Ver más <ArrowRight size={18} className="ml-2" />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

const ServiceList = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const dict = useTranslation()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const fetchedServices = await getServices()
        setServices(fetchedServices)
      } catch (err) {
        setError("Error al cargar los servicios. Por favor, intente de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [])

  if (isLoading) {
    return <div className="text-center py-24">Cargando servicios...</div>
  }

  if (error) {
    return <div className="text-center py-24 text-red-500">{error}</div>
  }

  return (
    <section id="work" className="bg-white py-24">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-medium text-gray-900 mb-6">{dict.serviceList.title}</h2>
          <div className="w-24 h-1 bg-gray-900 mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-6">
          {services.map((service, index) => (
            <SingleService key={service._id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServiceList

