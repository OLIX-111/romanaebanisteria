"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCard } from "@/components/store/product-card"
import { FilterSidebar } from "@/components/store/filter-sidebar"
import { Open_Sans } from "next/font/google"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslation } from "@/hook/UseTranslation"

const openSans = Open_Sans({ subsets: ["latin"] })

interface Product {
  id: number
  name: string
  image: string
  price: number
  description: string
  type: string
  vendor: string
}

export default function StorePage() {
  const dict = useTranslation()
  const { storePage } = dict

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    type: [],
    vendor: [],
  })
  const [sortBy, setSortBy] = useState("featured")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const productsPerPage = 100

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true) /* https://chat.falitech.com/ */
        //const response = await fetch(`https://chat.falitech.com/api/shop/products?limit=${productsPerPage}&page=${currentPage}`, {
        const response = await fetch(`https://chat.falitech.com/account`, {
          method: 'POST',
          body: JSON.stringify({
            id: "53095",
          }),
          headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer AhB18akNiusd3VVey7KbOTqDWwZ9SmJd23FrDT4tLgmjYSJRkSI4MWtT0Vv9'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setProducts(data.data)
        setTotalPages(Math.ceil(data.total / productsPerPage))
      } catch (err) {
        setError("Error al cargar los productos. Por favor, intente de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [currentPage])

  const handleFilterChange = (type: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: prev[type]?.includes(value)
        ? prev[type].filter((item) => item !== value)
        : [...(prev[type] || []), value],
    }))
    setCurrentPage(1)
  }

  const filteredProducts = products.filter((product) => {
    return (
      (activeFilters.type.length === 0 || activeFilters.type.includes(product.type)) &&
      (activeFilters.vendor.length === 0 || activeFilters.vendor.includes(product.vendor))
    )
  })

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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo(0, 0)
  }

  if (isLoading) {
    return <div className="text-center py-24">{storePage.loading}</div>
  }

  if (error) {
    return <div className="text-center py-24 text-red-500">{storePage.error}</div>
  }

  return (
    <main className={`${openSans.className}`}>
      <Header />
      <div className="px-4 py-8 sm:px-6 lg:px-8 mt-24">
        <div className="mx-auto container lg:px-2">
          <div className="flex items-center justify-between pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{storePage.title}</h1>
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="featured">{storePage.featured}</option>
                <option value="price-asc">{storePage.priceAsc}</option>
                <option value="price-desc">{storePage.priceDesc}</option>
                <option value="name">{storePage.name}</option>
              </select>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <FilterSidebar
                types={Array.from(new Set(products.map((p) => p.type)))}
                vendors={Array.from(new Set(products.map((p) => p.vendor)))}
                onFilterChange={handleFilterChange}
                activeFilters={activeFilters}
              />
            </div>

            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={JSON.stringify(activeFilters) + sortBy + currentPage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Pagination */}
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
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
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

