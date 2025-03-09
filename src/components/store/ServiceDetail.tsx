"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Clock, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
// @ts-ignore
import BlockContent from "@sanity/block-content-to-react"

interface ServiceDetailProps {
  service: {
    name: string
    slug: string;
    imageUrl: string
    gallery: string[]
    price: number
    categoryName: string
    description: any // Se espera un objeto de Sanity con bloques de contenido
    availability: string
    duration: string
  }
}

export function ServiceDetail({ service }: ServiceDetailProps) {
  const [currentImage, setCurrentImage] = useState(service.imageUrl)

  useEffect(() => {
    console.log(service);
  }, [service])

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/store" className="mb-8 inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a servicios
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
                className={`aspect-square cursor-pointer overflow-hidden rounded-lg ${
                  img === currentImage ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setCurrentImage(img)}
              >
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`${service.name} - imagen ${index + 1}`}
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
            {/* <p className="mt-2 text-xl font-semibold text-gray-900">RD$ {service.price.toLocaleString()}</p> */}
          </div>

          {/* <div className="space-y-4 rounded-lg bg-gray-50 p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                Categoría: <span className="font-medium">{service.categoryName}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                Duración estimada: <span className="font-medium">{service.duration}</span>
              </span>
            </div>
          </div> */}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Descripción</h2>
            <div className="prose prose-lg text-gray-600">
              {service.description && (
                <BlockContent
                  blocks={service.description}
                  serializers={{
                    types: {
                      block: (props: any) => {
                        const { style = "normal" } = props.node
                        switch (style) {
                          case "h1":
                            return <h1 className="text-4xl font-bold mt-8 mb-4">{props.children}</h1>
                          case "h2":
                            return <h2 className="text-3xl font-bold mt-6 mb-3">{props.children}</h2>
                          case "h3":
                            return <h3 className="text-2xl font-bold mt-4 mb-2">{props.children}</h3>
                          case "blockquote":
                            return (
                              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
                                {props.children}
                              </blockquote>
                            )
                          default:
                            return <p className="mb-4">{props.children}</p>
                        }
                      },
                      image: (props: any) => {
                        const { node } = props
                        if (!node.asset || !node.asset.url) return null
                        return (
                          <div className="my-6">
                            <Image
                              src={node.asset.url || "/placeholder.svg"}
                              alt={node.alt || "Imagen"}
                              width={800}
                              height={450}
                              className="mx-auto rounded-lg"
                              loading="lazy"
                            />
                          </div>
                        )
                      },
                      code: (props: any) => (
                        <pre className="bg-gray-100 p-4 my-6 overflow-x-auto rounded-md">
                          <code>{props.node.code}</code>
                        </pre>
                      ),
                    },
                    list: (props: any) => <ul className="list-disc ml-6 my-4">{props.children}</ul>,
                    listItem: (props: any) => <li className="mb-2">{props.children}</li>,
                    marks: {
                      link: (props: any) => (
                        <a
                          href={props.mark.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          {props.children}
                        </a>
                      ),
                    },
                  }}
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <span className="text-sm font-medium">Disponibilidad</span>
              <span className="text-sm text-blue-600">{service.availability}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href={`/store/cotizacion/${service.slug}`} passHref className="w-full">
              <button className="flex-1 w-full rounded-lg bg-primary px-8 py-4 text-sm font-medium text-white hover:bg-orange-400 duration-200">
                Solicitar cotización
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
