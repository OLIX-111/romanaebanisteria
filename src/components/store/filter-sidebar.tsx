"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface FilterOption {
  _id: string
  title: string
}

interface FilterSidebarProps {
  categories: FilterOption[]
  materials?: FilterOption[]
  finishes?: FilterOption[]
  onFilterChange: (type: string, value: string) => void
  activeFilters: Record<string, string[]>
  showProductFilters: boolean
}

export function FilterSidebar({
  categories,
  materials,
  finishes,
  onFilterChange,
  activeFilters,
  showProductFilters,
}: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    material: false,
    finish: false,
    availability: false,
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const FilterSection = ({
    title,
    options,
    type,
  }: {
    title: string
    options: FilterOption[]
    type: string
  }) => (
    <div className="border-b border-gray-200 py-4">
      <button onClick={() => toggleSection(type)} className="flex w-full items-center justify-between text-left">
        <span className="text-sm font-medium">{title}</span>
        <ChevronDown className={`h-5 w-5 transition-transform ${openSections[type] ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {openSections[type] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
              {options.map((option) => (
                <label key={option._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={activeFilters[type]?.includes(option.title)}
                    onChange={() => onFilterChange(type, option.title)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">{option.title}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="w-64 space-y-4">
      <FilterSection title="Categoría" options={categories} type="category" />
      {showProductFilters && (
        <>
          {materials && <FilterSection title="Material" options={materials} type="material" />}
          {finishes && <FilterSection title="Acabado" options={finishes} type="finish" />}
        </>
      )}
      <div className="border-b border-gray-200 py-4">
        <button
          onClick={() => toggleSection("availability")}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="text-sm font-medium">Disponibilidad</span>
          <ChevronDown className={`h-5 w-5 transition-transform ${openSections.availability ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {openSections.availability && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={activeFilters.availability?.includes("En stock")}
                    onChange={() => onFilterChange("availability", "En stock")}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">En stock</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={activeFilters.availability?.includes("A pedido")}
                    onChange={() => onFilterChange("availability", "A pedido")}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">A pedido</span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

