"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface LightboxProps {
  images: string[]
  currentIndex: number
  onClose: () => void
}

export function Lightbox({ images, currentIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(currentIndex)

  const handlePrevious = useCallback(() => {
    setIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1))
  }, [images.length])

  const handleNext = useCallback(() => {
    setIndex((prevIndex) => (prevIndex + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handlePrevious()
      } else if (event.key === "ArrowRight") {
        handleNext()
      } else if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handlePrevious, handleNext, onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
        
      >
        <button className="absolute top-5 right-5 text-white hover:text-gray-300" onClick={onClose}>
          <X size={35} />
        </button>
        <button className="absolute left-4 bottom-24 text-black bg-white hover:bg-gray-200 rounded-full p-3 hover:text-gray-800" onClick={handlePrevious}>
          <ChevronLeft size={30} />
        </button>
        <button className="absolute right-4 bottom-24 text-black bg-white hover:bg-gray-200 rounded-full p-3 hover:text-gray-800" onClick={handleNext}>
          <ChevronRight size={30} />
        </button>
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-4xl h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={images[index] || "/placeholder.svg"}
            alt={`Lightbox image ${index + 1}`}
            layout="fill"
            objectFit="contain"
            priority
          />
        </motion.div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
          {index + 1} / {images.length}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

