"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCard } from "@/components/store/product-card"
import { FilterSidebar } from "@/components/store/filter-sidebar"
import { Open_Sans } from "next/font/google"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { ChevronLeft, ChevronRight, SlidersHorizontal, Grid as GridIcon, Rows3 } from "lucide-react"
import { useTranslation } from "@/hook/UseTranslation"
import { getAllProductsWithDetails } from "@/utils/supabase"

const openSans = Open_Sans({ subsets: ["latin"] })

interface Product {
  id: string | number
  name: string
  image: string
  price: number
  compare_price?: number
  display_variant_id?: string | number
  display_variant_name?: string
  description: string
  type: string
  vendor: string
  status?: string
  track_stock?: boolean
  total_qty?: number
  use_variant?: boolean
  variants?: { id: string | number; name: string; price: number; sale_price?: number | null; is_on_sale?: boolean; image?: string }[]
}
// Ahora usamos Supabase RPC get_all_products_with_details

export default function StorePage() {
  const dict = useTranslation()
  const { storePage } = dict

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    type: [],
    vendor: [],
  })
  const [sortBy, setSortBy] = useState("featured")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const productsPerPage = 100 // máximo solicitado
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [gridMode, setGridMode] = useState<'grid3' | 'grid2'>('grid3')

  // Debounce búsqueda
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setCurrentPage(1)
    }, 450)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  // Cargar productos desde Supabase RPC
  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const all = await getAllProductsWithDetails()

        // Filtro por búsqueda en cliente
        const bySearch = debouncedSearch
          ? all.filter((p: any) =>
              [p.name, p.description, p.type].some((field) =>
                (field || "").toString().toLowerCase().includes(debouncedSearch.toLowerCase())
              )
            )
          : all

        // Paginación en cliente
        const start = (currentPage - 1) * productsPerPage
        const end = start + productsPerPage
        const pageSlice = bySearch.slice(start, end)

        if (!cancelled) {
          setProducts(pageSlice as Product[])
          setTotalItems(bySearch.length)
          setTotalPages(Math.max(1, Math.ceil(bySearch.length / productsPerPage)))
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Error al cargar productos")
      } finally {
        if (!cancelled) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [currentPage, debouncedSearch, isRefreshing])

  const handleFilterChange = (type: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: prev[type]?.includes(value)
        ? prev[type].filter((item) => item !== value)
        : [...(prev[type] || []), value],
    }))
    setCurrentPage(1)
  }

  const filteredProducts = products
    // Hide out of stock or unavailable
    .filter((p: any) => {
      const status = (p.status || '').toString().toLowerCase()
      const isUnavailable = status.includes('unavailable') || status.includes('out') || status.includes('agot')
      const hasStock = p.track_stock ? (Number(p.total_qty) > 0) : true
      return !isUnavailable && hasStock
    })
    .filter((product) =>
      (activeFilters.type.length === 0 || activeFilters.type.includes(product.type)) &&
      (activeFilters.vendor.length === 0 || activeFilters.vendor.includes(product.vendor))
    )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price
      case "price-desc":
        return b.price - a.price
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  // Ya vienen paginados desde el servidor (limit=productsPerPage)
  const paginatedProducts = sortedProducts

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo(0, 0)
  }

  const gridClasses = gridMode === 'grid3' ? 'grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2'

  return (
    <main className={`${openSans.className}`}>
      <Header />
      <div className="px-4 py-8 sm:px-6 lg:px-8 mt-24">
        <div className="mx-auto container lg:px-2">
          <div className="flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{storePage.title}</h1>
              <button
                className="flex items-center gap-2 border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 md:hidden"
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal size={16} /> Filtros
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 lg:w-64 border border-gray-300 py-2 px-3 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                <option value="featured">{storePage.featured}</option>
                <option value="price-asc">{storePage.priceAsc}</option>
                <option value="price-desc">{storePage.priceDesc}</option>
                <option value="name">{storePage.name}</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pb-4 text-xs text-gray-600">
            <span className="font-medium">
              {totalItems > 0 ? `Mostrando ${products.length} de ${totalItems} resultados` : (isLoading ? "Cargando..." : "Sin resultados")}
            </span>
            {Object.entries(activeFilters).flatMap(([k, arr]) =>
              arr.map(v => (
                <button
                  key={`${k}:${v}`}
                  onClick={() => handleFilterChange(k, v)}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/20"
                >
                  <span>{v}</span>
                  <span aria-hidden>×</span>
                </button>
              ))
            )}
            {debouncedSearch && (
              <button
                onClick={() => setSearch("")}
                className="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-indigo-700 hover:bg-indigo-200"
              >
                <span>&quot;{debouncedSearch}&quot;</span>
                <span aria-hidden>×</span>
              </button>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-4">
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-28 max-h-[calc(100vh-10rem)] overflow-auto pr-2 thin-scrollbar">
                <FilterSidebar
                  types={Array.from(new Set(products.map((p) => p.type)))}
                  vendors={Array.from(new Set(products.map((p) => p.vendor)))}
                  onFilterChange={handleFilterChange}
                  activeFilters={activeFilters}
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={JSON.stringify(activeFilters) + sortBy + currentPage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`grid ${gridClasses}`}
                >
                  {isLoading && paginatedProducts.length === 0 && (
                    Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="animate-pulse border border-gray-200 p-4">
                        <div className="mb-4 aspect-square w-full overflow-hidden bg-gray-100" />
                        <div className="h-4 w-3/4 bg-gray-200 mb-2" />
                        <div className="h-4 w-1/2 bg-gray-200 mb-4" />
                        <div className="h-6 w-24 bg-gray-300" />
                      </div>
                    ))
                  )}
                  {!isLoading && paginatedProducts.length === 0 && (
                    <div className="col-span-full text-center text-sm text-gray-500 py-12">No se encontraron productos.</div>
                  )}
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} {...product} currency="DOP" />
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Pagination */}
              <div className="mt-8 flex flex-col items-center gap-3">
                {error && <div className="text-sm text-red-500">{error}</div>}
                <nav className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-md ${
                        currentPage === page ? "bg-primary text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50"
                  >
                    <ChevronRight size={20} />
                  </button>
                </nav>
                <div className="text-xs text-gray-500">Página {currentPage} de {totalPages}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="relative ml-0 h-full w-80 max-w-[80%] overflow-y-auto bg-white p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Filtros</h2>
              <button onClick={() => setShowMobileFilters(false)} className="text-sm text-gray-500 hover:text-gray-700">Cerrar</button>
            </div>
            <FilterSidebar
              types={Array.from(new Set(products.map((p) => p.type)))}
              vendors={Array.from(new Set(products.map((p) => p.vendor)))}
              onFilterChange={handleFilterChange}
              activeFilters={activeFilters}
              compact
            />
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowMobileFilters(false)} className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90">Aplicar</button>
            </div>
          </motion.div>
        </div>
      )}
      <Footer />
    </main>
  )
}

