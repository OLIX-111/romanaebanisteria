"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface FilterSidebarProps {
  types: string[]
  vendors: string[]
  onFilterChange: (type: string, value: string) => void
  activeFilters: Record<string, string[]>
}

export function FilterSidebar({ types, vendors, onFilterChange, activeFilters }: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    type: true,
    vendor: false,
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
    options: string[]
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
              {options.map((option) => {
                console.log(option);
                
                return(
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={activeFilters[type]?.includes(option)}
                    onChange={() => onFilterChange(type, option)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">{option}</span>
                </label>
              )})}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="w-64 space-y-4">
      <FilterSection title="Tipo de Producto" options={types} type="type" />
      {/* <FilterSection title="Vendedor" options={vendors} type="vendor" /> */}
    </div>
  )
}

