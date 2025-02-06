"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const getRandomImagePath = () => {
  const randomNum = Math.floor(Math.random() * 90) + 1
  return `/projects/romana_ebanisteria_grupo_chavon${randomNum}.png`
}

const featuredProducts = [
  {
    id: 1,
    title: "Gabinete Moderno",
    description: "Diseño en melamina premium, ideal para cocinas contemporáneas.",
    image: getRandomImagePath(),
    price: "RD$ 12,800",
  },
  {
    id: 2,
    title: "Puertas de Aluminio",
    description: "Carpintería de aluminio con acabados resistentes para exteriores.",
    image: getRandomImagePath(),
    price: "RD$ 10,500",
  },
  {
    id: 3,
    title: "Closet Personalizado",
    description: "Armario a medida en MDF con sistema de correderas y accesorios.",
    image: getRandomImagePath(),
    price: "RD$ 15,000",
  },
  {
    id: 4,
    title: "Modulo de Cocina Integral",
    description: "Combinación de madera y aluminio para un estilo funcional y elegante.",
    image: getRandomImagePath(),
    price: "RD$ 18,200",
  },
  {
    id: 5,
    title: "Puerta Corredera Minimalista",
    description: "Estructura en melamina mate, perfecta para espacios modernos.",
    image: getRandomImagePath(),
    price: "RD$ 9,900",
  },
  {
    id: 6,
    title: "Centro de Entretenimiento",
    description: "Diseño modular en madera y aluminio para salas de estar o salones.",
    image: getRandomImagePath(),
    price: "RD$ 20,500",
  },
]

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
          <h2 className="text-3xl font-medium text-gray-900 mb-4">Productos Destacados</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Selección de alta calidad en ebanistería y carpintería en aluminio
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
              <Link href={`/products/${product.id}`} className="block">
                <div className="aspect-square overflow-hidden bg-gray-100 mb-6">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{product.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                <span className="text-lg font-medium text-gray-900">RD$ {product.price}</span>
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
            Ver Más <ArrowRight size={18} />
          </motion.button>
        </Link>
      </div>
    </section>
  )
}

