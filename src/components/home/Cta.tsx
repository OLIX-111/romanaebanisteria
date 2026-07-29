"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useTranslation } from "@/hook/UseTranslation"

export default function Cta() {
  const dict = useTranslation()
  const { ctaSection } = dict

  return (
    <div
      className="relative isolate overflow-hidden w-full flex items-stretch min-h-[560px]"
      style={{
        backgroundImage: `url('/projects/romana_ebanisteria_grupo_chavon31.png')`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      {/* Overlay sutil */}
      <div className="absolute inset-0 bg-black/30 z-0" />

      {/* Caja blanca en IZQUIERDA — exactamente como Binova Showroom */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 flex items-stretch"
      >
        <div
          className="bg-white text-black flex flex-col justify-center px-12 lg:px-16 py-16"
          style={{ width: "clamp(300px, 40vw, 520px)" }}
        >
          <span className="text-xs tracking-[0.4em] uppercase text-gray-500 block mb-6">
            Show Room
          </span>
          <h2 className="font-serif-display text-4xl lg:text-5xl font-normal text-black leading-snug mb-5">
            {ctaSection.title}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-10">
            {ctaSection.subTitle}
          </p>
          <Link href="/contact">
            <button className="bg-black text-white text-xs tracking-[0.25em] uppercase px-8 py-4 hover:bg-gray-900 transition-colors duration-300 w-fit">
              {ctaSection.buttonText}
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
