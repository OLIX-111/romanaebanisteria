"use client"

import { motion } from "framer-motion"
import { useTranslation } from "@/hook/UseTranslation"

export default function Hero() {
  const dict = useTranslation()
  const { hero } = dict

  return (
    <div className="relative isolate flex flex-col justify-end overflow-hidden h-screen min-h-[600px]">
      {/* Video de YouTube de fondo */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-black">
        <iframe
          src="https://www.youtube.com/embed/TxmBzBeRa3M?autoplay=1&mute=1&loop=1&playlist=TxmBzBeRa3M&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1"
          title="La Fabbrica background video"
          allow="autoplay; encrypted-media"
          className="absolute border-0 pointer-events-none"
          style={{
            width: '100vw',
            height: '56.25vw',
            minHeight: '100vh',
            minWidth: '177.78vh',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* Overlay oscuro */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/50 to-black/85" />

      {/* Bloque de texto centrado — igual que Binova */}
      <div className="w-full text-center px-4 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" as const }}
        >
          <p className="font-serif-display text-lg lg:text-2xl italic text-gray-100 mb-1">
            desde 1981
          </p>
          <h1
            className="font-serif-display font-normal text-white uppercase leading-none"
            style={{ fontSize: "clamp(3.2rem, 10vw, 9.5rem)" }}
          >
            LA FABBRICA
          </h1>
          <p className="text-gray-300 text-sm lg:text-base mt-4 tracking-widest uppercase">
            Suministro e Instalación — Todo desde el origen
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
