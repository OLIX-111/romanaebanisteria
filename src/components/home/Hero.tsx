"use client"

import { motion } from "framer-motion"
import { useTranslation } from "@/hook/UseTranslation"

export default function Hero() {
  const dict = useTranslation()
  const { hero } = dict

  return (
    <div className="relative isolate flex flex-col justify-end overflow-hidden h-screen min-h-[600px]">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute object-cover w-full h-full -z-10"
      >
        <source src="/home/chavo.mp4" type="video/mp4" />
      </video>

      {/* Overlay — más opaco abajo como Binova */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-black/25 to-black/80" />

      {/* Bloque de texto centrado — igual que Binova */}
      <div className="w-full text-center px-4 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" as const }}
        >
          <p className="font-serif-display text-lg lg:text-2xl italic text-gray-100 mb-1">
            La Fabbrica desde 1976
          </p>
          <h1
            className="font-serif-display font-normal text-white uppercase leading-none"
            style={{ fontSize: "clamp(3.2rem, 10vw, 9.5rem)" }}
          >
            EBANISTERÍA
          </h1>
          <p className="text-gray-300 text-sm lg:text-base mt-4 max-w-xl mx-auto leading-relaxed">
            La fábrica más grande de muebles y carpintería en aluminio en La Romana, República Dominicana.
          </p>
        </motion.div>
      </div>

      {/* Stats bar — en la parte más baja */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="w-full py-5 bg-black/50 backdrop-blur-sm"
      >
        <div className="max-w-2xl mx-auto flex justify-around text-white text-center px-4">
          <div>
            <span className="block text-xl font-medium">{hero?.stats?.factorySize}</span>
            <span className="text-[10px] text-gray-400 tracking-widest uppercase">{hero?.stats?.factory}</span>
          </div>
          <div>
            <span className="block text-xl font-medium">{hero?.stats?.experience}</span>
            <span className="text-[10px] text-gray-400 tracking-widest uppercase">{hero?.stats?.experienceSubtitle}</span>
          </div>
          <div>
            <span className="block text-xl font-medium">{hero?.stats?.territory}</span>
            <span className="text-[10px] text-gray-400 tracking-widest uppercase">{hero?.stats?.territorySubtitle}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
