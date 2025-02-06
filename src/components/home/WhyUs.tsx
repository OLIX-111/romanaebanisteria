"use client"

import { motion, useInView } from "framer-motion"
import Image from "next/image"
import { useRef } from "react"

const reasons = [
  {
    title: "Atención Personalizada",
    description:
      "Cada proyecto recibe un trato único, adaptado al estilo y las necesidades de cada cliente, asegurando resultados a la medida.",
  },
  {
    title: "Innovación Constante",
    description:
      "Incorporamos maquinaria de última generación y materiales modernos (melamina, MDF, aluminio), garantizando calidad y durabilidad.",
  },
  {
    title: "Soluciones Integrales",
    description:
      "Desde el diseño y la fabricación hasta la instalación y el mantenimiento, abarcamos todo el ciclo del proyecto para brindar una experiencia sin complicaciones.",
  },
  {
    title: "Compromiso y Garantía",
    description:
      "Cada pieza está respaldada por nuestro riguroso control de calidad y un servicio postventa dedicado, reflejando la seriedad y profesionalismo que nos distinguen.",
  },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0 },
}

export default function WhyUs() {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: "-100px" })

  return (
    <section ref={ref} className="w-full bg-black py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          exit="exit"
          variants={fadeInUp}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-medium text-gray-50 mb-2">¿Por qué elegir ROMAna Ebanistería?</h2>
          <motion.div
            className="w-16 h-px bg-gray-500"
            initial={{ width: 0 }}
            animate={isInView ? { width: 64 } : { width: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 mb-20"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          exit="exit"
        >
          {reasons.map((reason, index) => (
            <motion.div key={index} variants={fadeInUp} transition={{ duration: 0.4 }}>
              <h3 className="text-xl font-medium text-gray-100 mb-3">{reason.title}</h3>
              <p className="text-gray-400 leading-relaxed">{reason.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src={"/home/learnmore_romana_ebanisteria.jpg"}
            alt="ROMAna Ebanistería project showcase"
            height={1200}
            width={1400}
            className="w-full h-96 lg:h-[43rem] object-cover"
          />
        </motion.div>
      </div>
    </section>
  )
}

