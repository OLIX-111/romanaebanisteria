"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { useTranslation } from "@/hook/UseTranslation"
import Image from "next/image"
import { Lightbox } from "./Lightbox"

interface Project {
  id: number
  category: string
  image: string
}

const allProjects: Project[] = Array.from({ length: 90 }, (_, i) => ({
  id: i + 1,
  category: ["Residencial", "Villas", "Hoteles"][Math.floor(Math.random() * 3)],
  image: `/projects/romana_ebanisteria_grupo_chavon${i + 1}.png`,
}))

const categories = ["Todos", "Residencial", "Villas", "Hoteles"]

export default function GalleryGrid() {
  const { ProjectGrid: projTrans } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<string>("Todos")
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(allProjects)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setFilteredProjects(
      category === "Todos" ? allProjects : allProjects.filter((project) => project.category === category),
    )
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <section className="w-full bg-white py-24">
      <div className="container mx-auto px-4">
       {/*  <div className="flex flex-wrap justify-center gap-6 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`
                px-4 py-2 text-sm font-medium transition-colors duration-200
                ${
                  cat === activeCategory
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div> */}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-square overflow-hidden group cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={`${project.category} project #${project.id}`}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  {/* <p className="text-white text-lg font-semibold">{project.category}</p> */}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Mostrando {filteredProjects.length} de {allProjects.length} proyectos
          </p>
          {filteredProjects.length < allProjects.length && (
            <button
              onClick={() => handleCategoryChange("Todos")}
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
            >
              Ver todos los proyectos
              <ArrowUpRight className="ml-2 w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          images={filteredProjects.map((project) => project.image)}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </section>
  )
}

