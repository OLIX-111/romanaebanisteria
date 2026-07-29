"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useTranslation } from "@/hook/UseTranslation"

const services = [
  "Ebanistería",
  "Carpintería en Aluminio",
  "Puertas & Ventanas",
  "Muebles a Medida",
  "Cocinas",
  "Closets",
]

const ServiceList = () => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section id="work" className="bg-black py-24 lg:py-32 border-t border-gray-900">
      <div className="container mx-auto px-8 lg:px-16">
        {/* Título central en caps — como Binova */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs tracking-[0.5em] text-gray-400 uppercase">
            Lo que fabricamos
          </span>
        </motion.div>

        {/* Lista de servicios — horizontal, separados por líneas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-px bg-gray-900"
        >
          {services.map((service, i) => (
            <motion.div
              key={service}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              className="bg-black p-8 lg:p-10 group hover:bg-gray-950 transition-colors duration-300"
            >
              <span className="text-xs text-gray-600 tracking-widest uppercase mb-3 block">
                0{i + 1}
              </span>
              <h3 className="font-serif-display text-2xl lg:text-3xl font-normal text-white">
                {service}
              </h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default ServiceList
