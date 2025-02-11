"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FilterSidebar } from "@/components/store/filter-sidebar"
import { ProductCard } from "@/components/store/product-card"

import { Open_Sans } from "next/font/google"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getCategories, getFinishes, getMaterials, getProducts, getServices } from "../../../sanity/sanityQueries"
import { ServiceCard } from "@/components/store/ServiceCard"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function StorePage() {
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState([])
  const [materials, setMaterials] = useState([])
  const [finishes, setFinishes] = useState([])
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    category: [],
    material: [],
    finish: [],
    availability: [],
  })
  const [sortBy, setSortBy] = useState("featured")
  const [showProducts, setShowProducts] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const [productsData, servicesData, categoriesData, materialsData, finishesData] = await Promise.all([
        getProducts(),
        getServices(),
        getCategories(),
        getMaterials(),
        getFinishes(),
      ])
      setItems(showProducts ? productsData : servicesData)
      setCategories(categoriesData)
      setMaterials(materialsData)
      setFinishes(finishesData)
    }
    fetchData()
  }, [showProducts])

  const handleFilterChange = (type: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: prev[type]?.includes(value)
        ? prev[type].filter((item) => item !== value)
        : [...(prev[type] || []), value],
    }))
  }

  const filteredItems = items.filter((item: any) => {
    return (
      (activeFilters.category.length === 0 || activeFilters.category.includes(item.categoryName)) &&
      (showProducts
        ? (activeFilters.material.length === 0 || activeFilters.material.includes(item.materialName)) &&
          (activeFilters.finish.length === 0 || activeFilters.finish.includes(item.finishName))
        : true) &&
      (activeFilters.availability.length === 0 || activeFilters.availability.includes(item.availability))
    )
  })

  const sortedItems = [...filteredItems].sort((a: any, b: any) => {
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

  return (
    <main className={`${openSans.className}`}>
      <Header />
      <div className="px-4 py-8 sm:px-6 lg:px-8 mt-24">
        <div className="mx-auto container lg:px-2">
          <div className="flex items-center justify-between pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tienda</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="toggle-view" className="inline-flex items-center cursor-pointer">
                  <span className="mr-3 text-sm font-medium text-gray-900">Productos</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="toggle-view"
                      className="sr-only peer"
                      checked={!showProducts}
                      onChange={() => setShowProducts(!showProducts)}
                    />
                    <div className="w-11 h-6 rounded-full peer bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-800"></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">Servicios</span>
                </label>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="featured">Destacados</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="name">Nombre</option>
              </select>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <FilterSidebar
                categories={categories}
                materials={materials}
                finishes={finishes}
                onFilterChange={handleFilterChange}
                activeFilters={activeFilters}
                showProductFilters={showProducts}
              />
            </div>

            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={JSON.stringify(activeFilters) + sortBy + showProducts}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {sortedItems.map((item: any) =>
                    showProducts ? <ProductCard key={item._id} {...item} /> : <ServiceCard key={item._id} {...item} />,
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

