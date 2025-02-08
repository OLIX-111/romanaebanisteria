"use client"

import { useState } from "react"
import { Filter, ChevronDown } from "lucide-react"
import ProductGrid from "@/components/shop/ProductGrid"
import Filters from "@/components/shop/Filters"
import type { Product } from "@/components/shop/ProductGrid"
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import { motion } from "framer-motion"
import ServiceGrid from "@/components/shop/ServiceGrid"
import { Open_Sans } from "next/font/google"

const openSans = Open_Sans({ subsets: ["latin"] })

// Productos (6) - Imágenes fijas sin random
const products: Product[] = [
  {
    id: 1,
    name: "Puerta de Roble Estilo Colonial",
    price: 25000,
    category: "Puertas",
    material: "Madera maciza",
    finish: "Mate",
    color: "Natural",
    dimensions: {
      width: 90,
      height: 210,
      depth: 4,
    },
    availability: "En stock",
    customizable: true,
    deliveryTime: "2-3 semanas",
    // Imagen estática
    image: "/projects/romana_ebanisteria_grupo_chavon10.png",
    description:
      "Puerta de roble macizo con diseño colonial clásico. Acabado mate que resalta la belleza natural de la madera.",
  },
  {
    id: 2,
    name: "Cocina Integral Melamina Premium",
    price: 48000,
    category: "Cocinas",
    material: "Melamina",
    finish: "Brillante",
    color: "Blanco",
    dimensions: {
      width: 300,
      height: 80,
      depth: 60,
    },
    availability: "A pedido",
    customizable: true,
    deliveryTime: "4-6 semanas",
    image: "/projects/romana_ebanisteria_grupo_chavon12.png",
    description:
      "Cocina modular con acabados premium. Incluye alacenas, módulos bajos y encimera resistente.",
  },
  {
    id: 3,
    name: "Clóset de MDF con Acabado Mate",
    price: 18000,
    category: "Closets",
    material: "MDF",
    finish: "Mate",
    color: "Gris claro",
    dimensions: {
      width: 120,
      height: 200,
      depth: 55,
    },
    availability: "En stock",
    customizable: false,
    deliveryTime: "1 semana",
    image: "/projects/romana_ebanisteria_grupo_chavon15.png",
    description:
      "Clóset de MDF con puertas corredizas y sistema de compartimentos múltiples para optimizar espacio.",
  },
  {
    id: 4,
    name: "Módulo de Carpintería en Aluminio",
    price: 32000,
    category: "Carpintería de Aluminio",
    material: "Aluminio",
    finish: "Mate",
    color: "Plateado",
    dimensions: {
      width: 100,
      height: 90,
      depth: 50,
    },
    availability: "En stock",
    customizable: true,
    deliveryTime: "2 semanas",
    image: "/projects/romana_ebanisteria_grupo_chavon20.png",
    description:
      "Estructura resistente para exteriores, ideal para cocinas de verano o áreas de servicio.",
  },
  {
    id: 5,
    name: "Revestimiento de Pared en Melamina",
    price: 22000,
    category: "Revestimientos",
    material: "Melamina",
    finish: "Mate",
    color: "Roble claro",
    dimensions: {
      width: 250,
      height: 300,
      depth: 1,
    },
    availability: "A pedido",
    customizable: false,
    deliveryTime: "3-4 semanas",
    image: "/projects/romana_ebanisteria_grupo_chavon22.png",
    description:
      "Paneles de melamina para paredes interiores. Otorgan calidez y modernidad a espacios residenciales u oficinas.",
  },
  {
    id: 6,
    name: "Gabinete de Baño Minimalista",
    price: 15000,
    category: "Mobiliario Residencial",
    material: "MDF",
    finish: "Mate",
    color: "Blanco",
    dimensions: {
      width: 60,
      height: 75,
      depth: 45,
    },
    availability: "En stock",
    customizable: true,
    deliveryTime: "1-2 semanas",
    image: "/projects/romana_ebanisteria_grupo_chavon33.png",
    description:
      "Gabinete compacto para baño con cajones suaves y superficie hidrófuga, perfecto para espacios modernos.",
  },
]

// Servicios (4) - Imágenes fijas sin random
const services: any[] = [
  {
    id: 1,
    name: "Diseño de Interiores Personalizado",
    price: 15000,
    category: "Diseño",
    duration: "2-4 semanas",
    availability: "Previa cita",
    description:
      "Servicio de diseño de interiores para hogares y oficinas. Incluye consulta inicial, propuesta y supervisión.",
    image: "/projects/romana_ebanisteria_grupo_chavon40.png",
  },
  {
    id: 2,
    name: "Corte y Canteo de Precisión",
    price: 5000,
    category: "Taller Especializado",
    duration: "Depende del volumen",
    availability: "Inmediata",
    description:
      "Servicio con maquinaria avanzada para corte y canteo en melamina, MDF y otros materiales.",
    image: "/projects/romana_ebanisteria_grupo_chavon45.png",
  },
  {
    id: 3,
    name: "Mantenimiento de Villas",
    price: 20000,
    category: "Renovación",
    duration: "Dependiendo del estado",
    availability: "En toda la región este",
    description:
      "Restauración, reparación y mantenimiento de elementos de madera y aluminio en villas de lujo.",
    image: "/projects/romana_ebanisteria_grupo_chavon52.png",
  },
  {
    id: 4,
    name: "Renovación de Mobiliario Hotelero",
    price: 35000,
    category: "Proyectos Hoteleros",
    duration: "2-6 semanas",
    availability: "Proyecto completo",
    description:
      "Actualización y mejora de mobiliario en hoteles, garantizando durabilidad y un estilo moderno.",
    image: "/projects/romana_ebanisteria_grupo_chavon60.png",
  },
]

type ViewMode = "products" | "services"

function SmoothToggle() {
  const [viewMode, setViewMode] = useState<ViewMode>("products")

  return (
    <div className="relative flex w-full rounded-lg bg-gray-100 p-1 shadow-sm">
      <motion.div
        className="absolute inset-1 rounded-md bg-white shadow-sm"
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        initial={false}
        animate={{
          x: viewMode === "products" ? 0 : "100%",
          width: "47.7%",
        }}
      />
      <ToggleButton active={viewMode === "products"} onClick={() => setViewMode("products")}>
        Productos
      </ToggleButton>
      <ToggleButton active={viewMode === "services"} onClick={() => setViewMode("services")}>
        Servicios
      </ToggleButton>
    </div>
  )
}



interface ToggleButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function ToggleButton({ active, onClick, children }: ToggleButtonProps) {
  return (
    <button
      type="button"
      className={`relative z-10 w-1/2 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        active ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}



export default function StorePage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"products" | "services">("products")

  return (
    <main className={`${openSans.className} bg-white pt-20`}>
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row space-y-4 items-baseline justify-between pb-6">
          <h1 className="text-3xl font-medium text-gray-900 mb-4">Tienda</h1>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between lg:space-x-4 w-full lg:w-fit space-y-6 lg:space-y-0">
            <button
              type="button"
              className="
                lg:hidden text-gray-700 hover:text-gray-900 flex gap-2 bg-gray-100
                px-4 py-4 rounded-md shadow-sm transition-colors duration-200 w-full items-center justify-center"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <Filter className="w-5 h-5" />
              Fitrar
            </button>

            <div className="relative text-left hidden lg:inline-block">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-2">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm text-gray-900 border-0 focus:ring-0  w-28"
                >
                  <option value="featured">Destacados</option>
                  <option value="price-low">Precio: Menor a mayor</option>
                  <option value="price-high">Precio: Mayor a menor</option>
                  <option value="newest">Más recientes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-10 pt-6">
          {/* Filters */}
          <Filters
            mobileFiltersOpen={mobileFiltersOpen}
            setMobileFiltersOpen={setMobileFiltersOpen}
            viewMode={viewMode}
            setViewMode={setViewMode}
          >
            <SmoothToggle/>
          </Filters>

          {/* Product/Service grid */}
          <div className="lg:col-span-3">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {viewMode === "products" ? <ProductGrid products={products} /> : <ServiceGrid services={services} />}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

