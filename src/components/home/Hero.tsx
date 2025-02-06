"use client"

import { motion } from "framer-motion"
import { useTranslation } from "@/hook/UseTranslation"
import { ArrowRight, Factory, Home, Plus } from "lucide-react"

export default function Hero() {
  const dict = useTranslation()

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  const stagger = {
    animate: { transition: { staggerChildren: 0.1 } },
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative isolate flex flex-col justify-between overflow-hidden bg-cover bg-fixed bg-no-repeat min-h-[88vh]"
      style={{ backgroundImage: "url('/hero_romana_ebanisteria.jpg')", backgroundPosition: "0px 0px" }}
    >
      {/* Background elements remain unchanged */}

      <div
                className="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl"
                aria-hidden="true"
            >
                <div
                    className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-secondary to-primary opacity-20"
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                />
            </div>
            <div
                className="absolute -top-52 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:top-[-28rem] sm:ml-16 sm:translate-x-0 sm:transform-gpu"
                aria-hidden="true"
            >
                <div
                    className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-secondary to-primary opacity-20"
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                />
            </div>
            <div
                className="
                    absolute top-0 left-0 w-full h-full -z-20
                    bg-gradient-to-b from-slate-900/30 to-blue-950/20
                "
            />
            <div
                className="
                    absolute top-0 left-0 w-full h-full -z-10
                    bg-gradient-to-b from-slate-900/60 to-gray-950/20 lg:to-gray-950/50
                "
            />

      <motion.div
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
        className="mx-auto w-full max-w-6xl px-5 md:px-10 pb-16 md:pb-24 lg:pb-28 2xl:pb-36 pt-36 md:pt-48 lg:pt-44 2xl:pt-48"
      >
        <motion.div variants={stagger} className="mx-auto mb-12 w-full max-w-4xl text-center md:mb-16 lg:mb-20">
          <motion.h1 variants={fadeInUp} className="mb-4 text-2xl lg:text-4xl w-full font-medium text-gray-50">
            {dict.heroTitle}
          </motion.h1>
          <motion.p variants={fadeInUp} className="mx-auto m-5 text-sm mb-12 lg:mb-8 text-gray-200">
            {dict.heroDescription}
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="py-2.5 px-3 w-full inline-flex justify-center items-center gap-x-2 text-sm font-semibold text-gray-50"
            >
              <motion.div
                whileHover={{ gap: "0.75rem" }}
                className="bg-black/40 backdrop-blur-lg text-white border-white hover:border-black hover:bg-black w-fit flex items-center gap-2 py-3 px-8 border-2 rounded-md hover:text-white duration-300"
              >
                {dict.heroCallToAction1} <ArrowRight size={18} />
              </motion.div>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full text-white py-14 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
      >
        <motion.div variants={stagger} className="w-full max-w-3xl mx-auto px-4 grid lg:grid-cols-3 gap-12">
          {[
            { Icon: Plus, title: "48+ Años", subtitle: "de experiencia" },
            { Icon: Factory, title: "Gran Infraestructura", subtitle: "Capacidad industrial para grandes desarrollos" },
            { Icon: Home, title: "1000+", subtitle: "Propiedades intervenidas" },
          ].map((item, index) => (
            <motion.div key={index} variants={fadeInUp} className="flex flex-col items-center text-center">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <item.Icon />
              </motion.div>
              <span className="font-medium mb-1 mt-2 text-lg">{item.title}</span>
              <span className="text-sm text-zinc-400">{item.subtitle}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

