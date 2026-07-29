"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export default function StoreSection() {
  return (
    <section className="w-full flex flex-col lg:flex-row" style={{ minHeight: '520px' }}>
      {/* Izquierda — foto (50%) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative w-full lg:w-1/2"
        style={{ minHeight: '400px' }}
      >
        <Image
          src="/projects/romana_ebanisteria_grupo_chavon5.png"
          alt="La Fabbrica tienda"
          fill
          className="object-cover"
        />
      </motion.div>

      {/* Derecha — panel blanco (50%) como "Offerte!" de Binova */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-12 lg:px-20 py-16"
      >
        <h2 className="font-serif-display text-4xl lg:text-5xl font-normal text-black mb-6 leading-tight">
          ¡Nuestra Tienda!
        </h2>
        <p className="text-gray-600 leading-relaxed mb-10 max-w-md">
          Materiales, mobiliario y accesorios de ebanistería y carpintería en aluminio. Descubre nuestra selección de productos con la calidad que nos distingue, disponibles para entrega en todo el país.
        </p>
        <Link href="https://tienda.romanaebanisteria.com/shop" target="_blank">
          <button className="bg-black text-white text-xs tracking-[0.25em] uppercase px-8 py-4 hover:bg-gray-800 transition-colors duration-300 w-fit">
            VER TIENDA
          </button>
        </Link>
      </motion.div>
    </section>
  )
}
