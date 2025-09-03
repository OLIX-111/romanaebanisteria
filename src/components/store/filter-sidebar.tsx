"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo } from "react"
import { ChevronDown } from "lucide-react"

interface FilterSidebarProps {
  types: string[]
  vendors: string[]
  counts?: Record<string, number>
  onFilterChange: (type: string, value: string) => void
  activeFilters: Record<string, string[]>
  compact?: boolean
}

export function FilterSidebar({ types = [], vendors = [], counts = {}, onFilterChange, activeFilters, compact }: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    type: true,
    vendor: false,
  })
  const [filterSearch, setFilterSearch] = useState("")

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const FilterSection = ({ title, options, type }: { title: string; options: string[]; type: string }) => (
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
            <div className="mt-2 space-y-1 max-h-60 overflow-auto pr-1 thin-scrollbar">
              {options.map((option) => (
                <label key={option} className="flex items-center justify-between gap-2 rounded px-1 py-1 hover:bg-gray-50">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeFilters[type]?.includes(option)}
                      onChange={() => onFilterChange(type, option)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-600 line-clamp-1" title={option}>{option}</span>
                  </span>
                  {counts[`${type}:${option}`] !== undefined && (
                    <span className="text-[11px] tabular-nums rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">
                      {counts[`${type}:${option}`]}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  const filteredTypes = useMemo(
    () => (types || []).filter((t) => (t ?? '').toString().toLowerCase().includes(filterSearch.toLowerCase())),
    [types, filterSearch]
  )
  const filteredVendors = useMemo(
    () => (vendors || []).filter((v) => (v ?? '').toString().toLowerCase().includes(filterSearch.toLowerCase())),
    [vendors, filterSearch]
  )

  return (
    <div className={`space-y-4 ${compact ? 'w-full' : 'w-64'} text-gray-800`}>
      <div className="relative">
        <input
          type="text"
          value={filterSearch}
          onChange={e => setFilterSearch(e.target.value)}
          placeholder="Filtrar opciones..."
          className="w-full rounded-md border border-gray-300 py-1.5 pl-3 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <FilterSection title="Categoría" options={filteredTypes} type="type" />
      {/* <FilterSection title="Vendedor" options={filteredVendors} type="vendor" /> */}
    </div>
  )
}

