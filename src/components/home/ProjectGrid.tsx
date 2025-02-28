"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { useTranslation } from "@/hook/UseTranslation"
import Image from "next/image"
import Link from "next/link"

interface Project {
  id: number
  category: string
  image: string
}

function getRandomProjects(category: string, count = 11): Project[] {
  const projects: Project[] = []
  const usedNumbers = new Set<number>()

  while (projects.length < count) {
    const randomNum = Math.floor(Math.random() * 90) + 1
    if (!usedNumbers.has(randomNum)) {
      usedNumbers.add(randomNum)
      projects.push({
        id: randomNum,
        category,
        image: `/projects/romana_ebanisteria_grupo_chavon${randomNum}.png`,
      })
    }
  }

  return projects
}

const categories = ["Todos"/* , "Residencial", "Villas", "Hoteles" */]

export default function ProjectGrid() {
  const { ProjectGrid: projTrans } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<string>("Todos")
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(getRandomProjects("Todos"))

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setFilteredProjects(getRandomProjects(category))
  }

  return (
    <section className="w-full bg-white py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-medium text-gray-900 mb-6">{projTrans.title}</h2>
        </motion.div>

        {/* <div className="flex flex-wrap justify-center gap-6 mb-12">
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
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-square overflow-hidden"
              >
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={`${project.category} project #${project.id}`}
                  width={400}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </motion.div>
            ))}

            <Link
              href="/gallery"
              className="relative aspect-square bg-gray-900 text-white flex flex-col justify-between p-6 group"
            >
              <span className="text-2xl font-light max-w-[80%]">{projTrans.seeAll}</span>
              <ArrowUpRight className="w-10 h-10 self-end transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

