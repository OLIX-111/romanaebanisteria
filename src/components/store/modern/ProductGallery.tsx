"use client"

import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

interface ProductGalleryProps {
  images: string[] // secondary images
  mainImage: string // principal de la variante activa
  alt: string
}

export function ProductGallery({ images, mainImage, alt }: ProductGalleryProps) {
  const secondary = images && images.length > 0 ? images : []
  const [current, setCurrent] = useState(mainImage || secondary[0] || "/placeholder.svg")
  // Sincroniza solo cuando cambia la variante (mainImage prop cambia)
  useEffect(() => {
    setCurrent(mainImage || secondary[0] || "/placeholder.svg")
  }, [mainImage])
  return (
    <div className="space-y-6">
      <div className="relative w-full overflow-hidden rounded-2xl bg-white shadow-lg border border-slate-200/60">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Image
              src={current || "/placeholder.svg"}
              alt={alt}
              width={1200}
              height={1200}
              className="w-full h-auto object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>
      {secondary.length > 0 && (
        <div className="grid grid-cols-4 gap-3 lg:grid-cols-5">
          {secondary.map((img, idx) => (
            <button
              key={img + idx}
              onClick={() => setCurrent(img)}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:ring-offset-2 ${current === img ? "border-slate-900 shadow-md scale-105" : "border-slate-200 hover:border-slate-400 hover:shadow-sm hover:scale-102"}`}
              aria-label="Vista miniatura"
            >
              <Image src={img || "/placeholder.svg"} alt={alt} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
