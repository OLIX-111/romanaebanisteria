import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Ruler, Clock, PaintbrushIcon as PaintBrush, Box } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface ProductDetailProps {
    product: {
        name: string
        image: string
        gallery: string[]
        price: number
        materialName: string
        finishName: string
        description: string
        availability: string
        deliveryTime: string
        customizable: boolean
        dimensions: {
            width: number
            height: number
            depth: number
        }
    }
}

export function ProductDetail({ product }: ProductDetailProps) {
    const [currentImage, setCurrentImage] = useState(product.image)

    console.log(product);
    
    return (
        <div className="">
            <Link href="/store" className="mb-8 inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a productos
            </Link>

            <div className="grid gap-8 lg:grid-cols-2">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                        <Image
                            src={currentImage || "/placeholder.svg"}
                            alt={product.name}
                            width={800}
                            height={800}
                            className="h-full w-full object-cover object-center"
                            priority
                        />
                    </div>
                    <div className="mt-4 grid grid-cols-5 gap-4">
                        {[product.image, ...product.gallery].map((img, index) => (
                            <div
                                key={index}
                                className={`aspect-square cursor-pointer overflow-hidden rounded-lg ${img === currentImage ? "ring-2 ring-primary" : ""
                                    }`}
                                onClick={() => setCurrentImage(img)}
                            >
                                <Image
                                    src={img || "/placeholder.svg"}
                                    alt={`${product.name} - imagen ${index + 1}`}
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
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        <p className="mt-2 text-xl font-semibold text-gray-900">RD$ {product.price.toLocaleString()}</p>
                    </div>

                    <div className="space-y-4 rounded-lg bg-gray-50 p-6">
                        <div className="flex items-center gap-2">
                            <Box className="h-5 w-5 text-gray-600" />
                            <span className="text-sm text-gray-600">
                                Material: <span className="font-medium">{product.materialName}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <PaintBrush className="h-5 w-5 text-gray-600" />
                            <span className="text-sm text-gray-600">
                                Acabado: <span className="font-medium">{product.finishName}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Ruler className="h-5 w-5 text-gray-600" />
                            <span className="text-sm text-gray-600">
                                Dimensiones:{" "}
                                <span className="font-medium">
                                    {product.dimensions.width} × {product.dimensions.height} × {product.dimensions.depth} cm
                                </span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-600" />
                            <span className="text-sm text-gray-600">
                                Tiempo de entrega: <span className="font-medium">{product.deliveryTime}</span>
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Descripción</h2>
                        <p className="text-gray-600">{product.description}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                            <span className="text-sm font-medium">Disponibilidad</span>
                            <span className={`text-sm ${product.availability === "En stock" ? "text-green-600" : "text-orange-600"}`}>
                                {product.availability}
                            </span>
                        </div>

                        {product.customizable && (
                            <div className="rounded-lg bg-blue-50 p-4">
                                <p className="text-sm text-blue-900">
                                    Este producto es personalizable. Contáctanos para discutir tus necesidades específicas.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 rounded-lg bg-gray-900 px-8 py-3 text-sm font-medium text-white hover:bg-gray-800">
                            Solicitar cotización
                        </button>
                        <button className="rounded-lg border border-gray-300 px-8 py-3 text-sm font-medium hover:bg-gray-50">
                            Consultar disponibilidad
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

