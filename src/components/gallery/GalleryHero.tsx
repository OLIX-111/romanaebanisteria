"use client"

import { motion } from "framer-motion"
import { useTranslation } from "@/hook/UseTranslation"
import { ArrowRight, Award, Factory, HardHat, Home, Plus, ThumbsUp } from "lucide-react"
import Link from "next/link"

export default function GalleryHero() {
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
            className="relative isolate overflow-hidden bg-cover bg-fixed bg-no-repeat"
            style={{ backgroundImage: "url('/projects/romana_ebanisteria_grupo_chavon42.png')", backgroundPosition: "0px" }}
        >
            {/* imagen de fondo v2 */}
            {/* <div className="absolute object-cover w-full h-full -z-30">
                <img src="/hero.jpg" className="absolute object-cover w-full h-full -z-30" />
            </div> */}

            {/* Elementos de fondo */}
            <div
                className="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl"
                aria-hidden="true"
            >
                <div
                    className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#FFCC00] to-gray-950 opacity-20"
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
                    className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#FFCC00] to-gray-950 opacity-20"
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                />
            </div>

            {/* Gradientes de superposición */}
            <div className="absolute top-0 left-0 w-full h-full -z-20 bg-gradient-to-b from-slate-900/30 to-blue-950/20" />
            <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-b from-slate-900/60 to-gray-950/20 lg:to-gray-950/50" />

            {/* Contenido principal */}
            <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="mx-auto w-full max-w-6xl min-h-[35rem] px-5 md:px-10 lg:pb-16 2xl:pb-36 pt-44 md:pt-52"
            >
                <motion.div variants={stagger} className="mx-auto w-full max-w-4xl text-center mb-8">
                    <motion.h1 variants={fadeInUp} className="mb-4 text-2xl lg:text-4xl w-full font-semibold text-gray-50">
                        Explora Nuestros Proyectos
                    </motion.h1>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}
