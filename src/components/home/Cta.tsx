"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { useTranslation } from "@/hook/UseTranslation"
import { useRouter } from "next/router"

export default function Cta() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100])

  const { locale } = useRouter() as { locale: 'en' | 'es' };

  const backgroundImageUrl = "/projects/romana_ebanisteria_grupo_chavon31.png"

  return (
    <div
      ref={ref}
      className="relative isolate overflow-hidden bg-cover bg-fixed bg-no-repeat py-32 md:py-48"
      style={{
        backgroundImage: `url('${backgroundImageUrl}')`,
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />

      <motion.div className="relative z-10 mx-auto max-w-3xl px-4 text-center" style={{ opacity, y }}>
        <h2 className="text-3xl md:text-4xl font-medium text-white mb-6">
          {locale === "es" ? "Descubre Nuestra Tienda" : "Discover Our Store"}
        </h2>
        <p className="text-lg md:text-xl text-gray-200 mb-8">
          {locale === "es"
            ? "Encuentra materiales, mobiliario y accesorios de ebanistería y carpintería en aluminio con la calidad que nos distingue."
            : "Find high-quality cabinetry, aluminum carpentry, and accessories in one place."}
        </p>
        <Link href="/store">
          <motion.button
            whileHover={{ gap: "0.75rem" }}
            className="mx-auto bg-white backdrop-blur-xl text-black border-white hover:border-black hover:bg-black w-fit flex items-center gap-2 py-3 px-8 border-2 rounded-md hover:text-white duration-300"
          >
            {locale === "es" ? "Ir a la Tienda" : "Go to the Store"}
            <ArrowRight className="ml-2" />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  )
}

