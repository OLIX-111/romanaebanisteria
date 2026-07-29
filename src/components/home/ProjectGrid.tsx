"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const photos = [
  "/projects/romana_ebanisteria_grupo_chavon12.png",
  "/projects/romana_ebanisteria_grupo_chavon23.png",
  "/projects/romana_ebanisteria_grupo_chavon31.png",
  "/projects/romana_ebanisteria_grupo_chavon45.png",
]

export default function ProjectGrid() {
  return (
    <section className="w-full bg-black">
      {/* 4 fotos en fila — igual que galería de Binova */}
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {photos.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative overflow-hidden"
            style={{ aspectRatio: '1 / 1' }}
          >
            <Image
              src={src}
              alt={`La Fabbrica proyecto ${i + 1}`}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </motion.div>
        ))}
      </div>

      {/* Link ver galería debajo */}
      <div className="text-center py-12">
        <Link
          href="/gallery"
          className="text-sm text-gray-400 border-b border-gray-600 pb-0.5 hover:text-white hover:border-white transition-colors duration-300"
        >
          Ver todos los proyectos
        </Link>
      </div>
    </section>
  )
}
