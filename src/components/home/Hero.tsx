"use client"

import { motion } from "framer-motion"
import { useTranslation } from "@/hook/UseTranslation"

export default function Hero() {
  const dict = useTranslation()
  const { hero } = dict

  return (
    <div className="relative isolate flex flex-col justify-end overflow-hidden h-screen min-h-[600px]">
      {/* Video de fondo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute object-cover w-full h-full -z-10"
      >
        <source src="/home/chavo.mp4" type="video/mp4" />
      </video>

      {/* Overlay oscuro degradado */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/20 via-black/30 to-black/80" />

      {/* Texto principal — anclado abajo */}
      <div className="w-full px-8 lg:px-16 pb-16 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" as const }}
        >
          <p className="text-xs tracking-[0.4em] text-gray-300 uppercase mb-4">
            La Romana, República Dominicana
          </p>
          <h1 className="font-serif-display font-normal text-white leading-none tracking-tight"
              style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}>
            {hero?.bigTitlePart1 ?? "Ebanistería"}<br />
            {hero?.bigTitlePart2 ?? "& Carpintería"}
          </h1>
        </motion.div>

        {/* Stats — fila pequeña debajo del título */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex gap-12 mt-8 text-white"
        >
          <div>
            <span className="block text-xl font-medium">{hero?.stats?.factorySize}</span>
            <span className="text-xs text-gray-400 tracking-widest uppercase">{hero?.stats?.factory}</span>
          </div>
          <div>
            <span className="block text-xl font-medium">{hero?.stats?.experience}</span>
            <span className="text-xs text-gray-400 tracking-widest uppercase">{hero?.stats?.experienceSubtitle}</span>
          </div>
          <div>
            <span className="block text-xl font-medium">{hero?.stats?.territory}</span>
            <span className="text-xs text-gray-400 tracking-widest uppercase">{hero?.stats?.territorySubtitle}</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
