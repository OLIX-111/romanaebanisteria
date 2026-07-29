"use client"

import { motion, useInView } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import { useTranslation } from "@/hook/UseTranslation";

export default function WhyUs() {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: "-100px" })
  const dict = useTranslation();
  const { whyUs } = dict;

  return (
    <section ref={ref} className="w-full bg-[#0a0a0a] py-24 lg:py-32">
      {/* Subtítulo centrado en caps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-20 px-8"
      >
        <span className="text-xs tracking-[0.4em] text-gray-400 uppercase">
          Nuestros Proyectos
        </span>
      </motion.div>

      {/* Layout: texto izquierda | imagen derecha */}
      <div className="container mx-auto px-8 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-24 items-start">

          {/* Columna izquierda — título + razones */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="lg:pt-8"
          >
            <h2 className="font-serif-display text-5xl lg:text-6xl font-normal text-white leading-tight mb-8">
              {whyUs.heading}
            </h2>
            <motion.div
              className="w-12 h-px bg-gray-600 mb-10"
              initial={{ width: 0 }}
              animate={isInView ? { width: 48 } : { width: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
            <div className="space-y-8 mb-12">
              {whyUs.reasons.map((reason, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <h3 className="text-base font-medium text-gray-100 mb-2">{reason.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{reason.description}</p>
                </motion.div>
              ))}
            </div>
            <Link
              href="/gallery"
              className="text-sm text-gray-400 border-b border-gray-600 pb-0.5 hover:text-white hover:border-white transition-colors duration-300"
            >
              Ver realizaciones
            </Link>
          </motion.div>

          {/* Columna derecha — imagen */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="space-y-4"
          >
            <div className="relative w-full h-96 lg:h-[32rem] overflow-hidden">
              <Image
                src="/home/learnmore_romana_ebanisteria.jpg"
                alt="Proyecto La Fabbrica"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative w-3/4 h-52 overflow-hidden">
              <Image
                src="https://storage.googleapis.com/portfoliprofiles/GG%20studio/1grupochavonRomana_Ebanisteria.png"
                alt="Detalle de proyecto"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
