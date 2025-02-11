import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface ProductCardProps {
    name: string
    slug: {current: string}
    imageUrl: string
    materialName: string
    finishName: string
    price: number
    availability: string
    deliveryTime: string
    customizable: boolean
}

export function ProductCard({
    name,
    imageUrl,
    slug,
    materialName,
    finishName,
    price,
    availability,
    deliveryTime,
    customizable,
}: ProductCardProps) {
    return (
        <>
        <Link href={`/store/products/${slug.current}`}>
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
                        <h3 className="text-lg font-medium text-gray-900">
                            {name}
                        </h3>
                        <p className="text-lg font-medium text-gray-900">
                            RD$ {price.toLocaleString()}
                        </p>
                    </div>
                    <p className="text-sm text-gray-500">
                    {materialName} - {finishName}
                    </p>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{availability}. Entrega: {deliveryTime}</span>
                    </div>
                    {customizable && <p className="text-sm text-primary">Personalización disponible</p>}
                </div>
            </motion.div>
        </Link>
        </>
    )
}
