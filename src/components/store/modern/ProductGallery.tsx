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
    <div className="space-y-4">
      <div className="relative w-full overflow-hidden bg-white border border-slate-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Image
              src={current || "/placeholder.svg"}
              alt={alt}
              width={1200}
              height={1200}
              className="w-full h-auto object-cover select-none"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>
      {secondary.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {secondary.map((img, idx) => (
            <button
              key={img + idx}
              onClick={() => setCurrent(img)}
              className={`relative aspect-square overflow-hidden border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${current === img ? "border-slate-900" : "border-slate-200 hover:border-slate-400"}`}
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
