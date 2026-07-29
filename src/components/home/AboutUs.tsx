"use client"

import { motion } from "framer-motion"
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from "@/hook/UseTranslation"

export default function AboutUs() {
    const dict = useTranslation();
    const { aboutUs } = dict;

    return (
        <section className="w-full bg-black py-24 lg:py-32">
            {/* Subtítulo centrado en caps */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-20 px-8"
            >
                <span className="text-xs tracking-[0.4em] text-gray-400 uppercase">
                    Ebanistería y Carpintería desde 1976
                </span>
            </motion.div>

            {/* Layout: fotos izquierda | texto derecha */}
            <div className="container mx-auto px-8 lg:px-16">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">

                    {/* Columna izquierda — fotos apiladas */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="space-y-4"
                    >
                        <div className="relative w-full h-72 lg:h-96 overflow-hidden">
                            <Image
                                src="https://storage.googleapis.com/portfoliprofiles/GG%20studio/1grupochavonRomana_Ebanisteria.png"
                                alt="La Fabbrica taller"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="relative w-4/5 h-56 lg:h-72 overflow-hidden ml-auto">
                            <Image
                                src="/projects/romana_ebanisteria_grupo_chavon5.png"
                                alt="La Fabbrica proyecto"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </motion.div>

                    {/* Columna derecha — título + texto */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="lg:pt-16"
                    >
                        <h2 className="font-serif-display text-5xl lg:text-6xl font-normal text-white leading-tight mb-8">
                            {aboutUs.title}
                        </h2>
                        <div className="space-y-5 text-gray-400 text-base leading-relaxed mb-10">
                            <p>{aboutUs.paragraph1}</p>
                            <p>{aboutUs.paragraph2}</p>
                        </div>
                        <Link
                            href="/gallery"
                            className="text-sm text-gray-400 border-b border-gray-600 pb-0.5 hover:text-white hover:border-white transition-colors duration-300"
                        >
                            Ver proyectos
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
