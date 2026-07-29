"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useTranslation } from "@/hook/UseTranslation"

const ServiceList = () => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const dict = useTranslation()
  const { serviceList } = dict

  return (
    <section id="work" className="bg-white py-24">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-medium text-gray-900 mb-6">{serviceList.title}</h2>
          <div className="w-24 h-1 bg-gray-900 mx-auto" />
        </motion.div>
      </div>
    </section>
  )
}

export default ServiceList
