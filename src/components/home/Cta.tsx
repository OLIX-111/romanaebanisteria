"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useRef } from "react"
import { useTranslation } from "@/hook/UseTranslation"
import { useRouter } from "next/router"

export default function Cta() {
  const ref = useRef<HTMLDivElement>(null)
  const dict = useTranslation()
  const { ctaSection } = dict
  const { locale } = useRouter() as { locale: 'en' | 'es' }

  return (
    <div
      ref={ref}
      className="relative isolate overflow-hidden bg-cover bg-no-repeat min-h-[600px] flex items-stretch"
      style={{
        backgroundImage: `url('/projects/romana_ebanisteria_grupo_chavon31.png')`,
        backgroundPosition: "center",
      }}
    >
      {/* Overlay sutil */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Caja blanca — anclada a la derecha */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 ml-auto flex items-center"
      >
        <div className="bg-white text-black p-12 lg:p-16 max-w-sm lg:max-w-md w-full">
          <span className="text-xs tracking-[0.35em] uppercase text-gray-500 block mb-6">
            {locale === 'es' ? 'Contáctenos' : 'Contact Us'}
          </span>
          <h2 className="font-serif-display text-3xl lg:text-4xl font-normal text-black leading-snug mb-5">
            {ctaSection.title}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-8">
            {ctaSection.subTitle}
          </p>
          <Link href="/contact">
            <motion.button
              whileHover={{ backgroundColor: "#0a0a0a", color: "#ffffff" }}
              className="border border-black text-black text-xs tracking-[0.2em] uppercase px-8 py-4 transition-colors duration-300"
            >
              {ctaSection.buttonText}
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
