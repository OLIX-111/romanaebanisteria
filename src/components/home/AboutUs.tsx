"use client"

import { motion } from "framer-motion"
import { Calendar, Building, Users } from "lucide-react"

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
}

const stats = [
    { icon: Calendar, value: "48+", label: "Años de experiencia" },
    { icon: Building, value: "1000+", label: "Proyectos completados" },
    { icon: Users, value: "100+", label: "Empleados especializados" },
]


import { useEffect, useRef } from 'react'
import Image from 'next/image'

function CTA() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const section = sectionRef.current
        const image = imageRef.current

        if (!section || !image) return

        const handleScroll = () => {
            const sectionRect = section.getBoundingClientRect()
            const scrollPercentage = Math.max(0, Math.min(1, 1 - sectionRect.top / window.innerHeight))

            // Parallax effect
            const yMove = scrollPercentage * 100 // Move up to 100px

            // Zoom effect
            const scale = 0.80 + scrollPercentage * 0.233 // Zoom up to 110%

            // Apply both effects
            image.style.transform = `translate3d(0, ${-yMove}px, 0) scale(${scale})`
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div ref={sectionRef} className="relative h-[340px] lg:h-[80vh] w-full overflow-hidden">
            <div
                ref={imageRef}
                className="absolute inset-0 transition-all duration-300 ease-out will-change-transform"
            >
                <img
                    src="https://storage.googleapis.com/portfoliprofiles/GG%20studio/1grupochavonRomana_Ebanisteria.png"
                    alt="Students on stairs"
                    className="object-cover shadow-md aspect-square"
                    sizes="100vw"
                />
            </div>
        </div>
    )
}

export default function AboutUs() {
    return (
        <section className="w-full bg-white py-24">
            <CTA />
            <div className="container mx-auto px-4 grid lg:grid-cols-2 mt-12 lg:mt-16">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    variants={fadeIn}
                    className="lg:mb-16"
                >
                    <h2 className="text-3xl font-medium text-gray-900 mb-6">Acerca de ROMAna Ebanistería</h2>
                    <div className="w-24 h-1 bg-gray-900 mb-8" />
                </motion.div>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    variants={fadeIn}
                    className="space-y-6 text-gray-600"
                >
                    <p>
                        Con más de 48 años de trayectoria, nos enorgullecemos de ser la fábrica de ebanistería y carpintería en
                        aluminio más grande de La Romana. Fundada en 1977, ROMAna Ebanistería ha evolucionado desde la fabricación
                        tradicional de puertas y muebles en madera, hasta convertirse en un referente en la innovación con
                        materiales modernos como melamina y MDF.
                    </p>
                    <p>
                        Hoy, colaboramos con desarrolladores inmobiliarios, cadenas hoteleras y proyectos residenciales de alto
                        nivel, brindando soluciones integrales y personalizadas. Nuestro compromiso es ofrecer resultados
                        excepcionales, cuidando cada detalle para garantizar precisión, calidad y durabilidad.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}

