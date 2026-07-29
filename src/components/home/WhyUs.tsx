"use client"

import { motion, useInView } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import { useTranslation } from "@/hook/UseTranslation"

export default function WhyUs() {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: "-100px" })
  const dict = useTranslation();
  const { whyUs } = dict;

  return (
    <section ref={ref} className="w-full bg-black py-24 lg:py-32">
      <div className="container mx-auto px-8 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-24 items-start">

          {/* Izquierda — título + párrafo + link (como "Realizzazioni" de Binova) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-serif-display text-5xl lg:text-6xl font-normal text-white leading-tight mb-8">
              {whyUs.heading}
            </h2>
            <p className="text-gray-400 leading-relaxed mb-5">
              {whyUs.reasons[0]?.description}
            </p>
            <p className="text-gray-400 leading-relaxed mb-10">
              {whyUs.reasons[1]?.description}
            </p>
            <Link
              href="/gallery"
              className="text-sm text-gray-400 border-b border-gray-600 pb-0.5 hover:text-white hover:border-white transition-colors duration-300"
            >
              Ver realizaciones
            </Link>
          </motion.div>

          {/* Derecha — una sola foto grande (como Binova) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="relative w-full overflow-hidden" style={{ height: '520px' }}>
              <Image
                src="/home/learnmore_romana_ebanisteria.jpg"
                alt="Realizaciones La Fabbrica"
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
