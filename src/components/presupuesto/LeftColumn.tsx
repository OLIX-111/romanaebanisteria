"use client"

import Image from "next/image"
import { FilterSidebar } from "@/components/store/filter-sidebar"
import { LocalProduct } from "@/data/localProducts"

interface LeftColumnProps {
  search: string
  setSearch: (v: string) => void
  filteredProducts: LocalProduct[]
  uniqueTypes: string[]
  uniqueVendors: string[]
  counts: Record<string, number>
  filters: Record<string, string[]>
  onFilterChange: (type: string, value: string) => void
  onAdd: (p: LocalProduct) => void
}

export default function LeftColumn({ search, setSearch, filteredProducts, uniqueTypes, uniqueVendors, counts, filters, onFilterChange, onAdd }: LeftColumnProps) {
  return (
    <aside className="lg:col-span-1 space-y-4">
      <div className="border border-gray-200 p-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar productos…"
          className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="border border-gray-200">
        <div className="p-3 text-sm font-semibold text-gray-800 border-b">Productos</div>
        <ul className="divide-y divide-gray-200 max-h-[60vh] overflow-auto thin-scrollbar">
          {filteredProducts.map(p => (
            <li key={p.id} className="p-3 flex gap-3 items-center">
              <div className="w-14 h-14 flex-shrink-0 border border-gray-200 bg-gray-50">
                <Image src={p.image || "/placeholder.svg"} alt={p.name} width={56} height={56} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 line-clamp-1" title={p.name}>{p.name}</div>
                <div className="text-xs text-gray-500 line-clamp-1">{p.type} • {p.vendor}</div>
                <div className="text-sm font-semibold text-gray-900">{new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(p.price)}</div>
              </div>
              <button onClick={() => onAdd(p)} className="text-xs border border-gray-300 px-2 py-1 hover:bg-gray-50">Añadir</button>
            </li>
          ))}
          {filteredProducts.length === 0 && (
            <li className="p-3 text-sm text-gray-600">No hay productos con esos filtros.</li>
          )}
        </ul>
      </div>
      <div className="border border-gray-200 p-4">
        <FilterSidebar
          types={uniqueTypes}
          vendors={uniqueVendors}
          counts={counts}
          onFilterChange={onFilterChange}
          activeFilters={filters}
          compact
        />
      </div>
    </aside>
  )
}
