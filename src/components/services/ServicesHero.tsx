"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { useRef } from "react"
import { useRouter } from "next/router"

export default function ServiceHero() {


  const { locale } = useRouter() as { locale: 'en' | 'es' }

  // Imagen de fondo
  const backgroundImageUrl = "/services/nuestros_servicios_de_ebanisteria_en_la_roaman.png"

  return (
    <div
      
      className="relative isolate overflow-hidden bg-cover bg-fixed bg-no-repeat py-32 md:py-48 lg:py-64"
      style={{
        backgroundImage: `url('${backgroundImageUrl}')`,
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div
        className="relative z-10 mx-auto max-w-3xl px-4 text-center"

      >
        <h2 className="text-3xl md:text-4xl font-medium text-white mb-6">
          {locale === "es"
            ? "Servicios de Ebanistería"
            : "Services of Carpentry"}
        </h2>
      </div>
    </div>
  )
}
