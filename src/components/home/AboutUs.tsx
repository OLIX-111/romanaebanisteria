"use client"

import { motion } from "framer-motion"
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from "@/hook/UseTranslation"

export default function AboutUs() {
    const dict = useTranslation();
    const { aboutUs } = dict;

    return (
        <section className="w-full bg-black">
            {/* Tagline centrada — igual que "IL GUSTO DI ARREDARE DAL 1958" */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="text-center py-20 px-8"
            >
                <h2 className="font-serif-display text-2xl lg:text-3xl font-normal text-white uppercase tracking-[0.08em]">
                    La Pasión de Fabricar Desde 1976
                </h2>
            </motion.div>

            {/* Layout Storia: fotos offset IZQUIERDA · texto DERECHA */}
            <div className="container mx-auto px-8 lg:px-16 pb-28">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-start">

                    {/* Columna izquierda — dos fotos offset (como Binova) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="relative"
                        style={{ height: '620px' }}
                    >
                        {/* Foto superior-derecha */}
                        <div className="absolute right-0 top-0 overflow-hidden" style={{ width: '60%', height: '44%' }}>
                            <Image
                                src="https://storage.googleapis.com/portfoliprofiles/GG%20studio/1grupochavonRomana_Ebanisteria.png"
                                alt="La Fabbrica taller"
                                fill
                                className="object-cover"
                            />
                        </div>
                        {/* Foto central-izquierda — imagen trasladada del hero */}
                        <div className="absolute left-0 overflow-hidden" style={{ width: '58%', height: '44%', top: '28%' }}>
                            <Image
                                src="/home/learnmore_romana_ebanisteria.jpg"
                                alt="La Fabbrica instalación"
                                fill
                                className="object-cover"
                            />
                        </div>
                        {/* Foto inferior-derecha */}
                        <div className="absolute right-0 bottom-0 overflow-hidden" style={{ width: '56%', height: '42%' }}>
                            <Image
                                src="/projects/romana_ebanisteria_grupo_chavon5.png"
                                alt="La Fabbrica proyecto"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </motion.div>

                    {/* Columna derecha — título + texto + link */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="lg:pt-16"
                    >
                        <h2 className="font-serif-display text-5xl lg:text-6xl font-normal text-white leading-tight mb-8">
                            {aboutUs.title}
                        </h2>
                        <p className="text-gray-400 leading-relaxed mb-5">{aboutUs.paragraph1}</p>
                        <p className="text-gray-400 leading-relaxed mb-10">{aboutUs.paragraph2}</p>
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
