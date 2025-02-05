"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface Product {
  id: number
  title: string
  description: string
  image: string
  price: string
}

const getRandomImagePath = () => {
  const randomNum = Math.floor(Math.random() * 90) + 1
  return `/projects/romana_ebanisteria_grupo_chavon${randomNum}.png`
}

const StoreSection = () => {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    setProducts([
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
    ])
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <section className="px-4 lg:px-8 bg-gray-50">
      <div className="mx-auto container py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Productos Destacados</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selección de alta calidad en ebanistería y carpintería en aluminio
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="bg-white shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105"
            >
              <img src={product.image || "/placeholder.svg"} alt={product.title} className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.title}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold text-primary">{product.price}</p>
                  {/* <button className="px-4 py-2 bg-primary text-white font-medium hover:bg-primary-dark transition-colors duration-300">
                    Ver detalles
                  </button> */}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mt-12"
        >
          <Link href="/tienda">
          <button
                className="
                  flex items-center shadow-md bg-primary text-white
                  px-6 text-lg py-4 font-medium rounded hover:px-8 duration-200
                "
              >
              Explorar todos los productos
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default StoreSection

