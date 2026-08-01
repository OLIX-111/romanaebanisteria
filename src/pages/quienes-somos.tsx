import { Open_Sans } from "next/font/google"
import Image from "next/image"
import Head from "next/head"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"

const openSans = Open_Sans({ subsets: ["latin"] })

const ORANGE = "#d4641a"

const sections = [
    {
        top: "QUIÉNES",
        bottom: "SOMOS",
        quote: '"TODO DESDE EL ORIGEN"',
        body: "Somos una empresa dominicana con más de 48 años de experiencia en la fabricación e instalación de mobiliario de alta calidad, carpintería en aluminio y soluciones integrales para proyectos residenciales, hoteleros e inmobiliarios en la República Dominicana.",
    },
    {
        top: "NUESTRA",
        bottom: "MISIÓN",
        quote: null,
        body: "El propósito de LA FABBRICA es brindar soluciones de fabricación y diseño de la más alta calidad, garantizando la satisfacción total de nuestros clientes a través de la innovación, el talento artesanal y el cumplimiento riguroso de los estándares que nos distinguen.",
    },
    {
        top: "NUESTRA",
        bottom: "VISIÓN",
        quote: null,
        body: "Ser reconocidos como la empresa líder en ebanistería, carpintería en aluminio y soluciones de mobiliario en la República Dominicana y el Caribe, distinguiéndonos por nuestra excelencia artesanal, innovación constante y compromiso inquebrantable con nuestros clientes.",
    },
]

export default function QuienesSomos() {
    return (
        <>
            <Head>
                <title>Quiénes Somos | La Fabbrica</title>
                <link rel="icon" type="image/png" href="/isotipo.png" />
            </Head>
            <main className={`${openSans.className} bg-black min-h-screen`}>
                <Header enableScroll={false} />

                {/* Romana link — top-right */}
                <div className="pt-24 w-full flex justify-end px-6 py-4">
                    <a
                        href="https://www.romanaebanisteria.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-row items-center gap-3 hover:opacity-80 transition-opacity duration-200"
                    >
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg animate-bounce"
                            style={{ backgroundColor: "#1a1a1a", color: "#ffffff", whiteSpace: "nowrap" }}
                        >
                            <span>Conoce más de nuestro aliado</span>
                            <span>→</span>
                        </div>
                        <Image
                            src="/romanaEbanistería_alt.png"
                            alt="Romana Ebanistería"
                            width={140}
                            height={56}
                            className="object-contain"
                        />
                    </a>
                </div>

                {/* Quiénes Somos / Misión / Visión */}
                <section className="w-full bg-black py-4">
                    <div className="max-w-6xl mx-auto px-6 lg:px-16">
                        {sections.map((s, i) => (
                            <motion.div
                                key={s.bottom}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.08 }}
                            >
                                {/* Divider */}
                                <div className="border-t border-white/10" />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 py-14 lg:py-16 items-start">
                                    {/* Left — heading */}
                                    <div>
                                        <h2 className="font-serif-display text-5xl lg:text-6xl font-bold text-white leading-none tracking-tight">
                                            {s.top}
                                        </h2>
                                        <h2
                                            className="font-serif-display text-5xl lg:text-6xl font-bold leading-none tracking-tight mt-1"
                                            style={{ color: ORANGE }}
                                        >
                                            {s.bottom}
                                        </h2>
                                    </div>

                                    {/* Right — content */}
                                    <div className="flex flex-col gap-4 lg:pt-2">
                                        {s.quote && (
                                            <p className="text-white/80 text-sm lg:text-base tracking-widest uppercase">
                                                {s.quote}
                                            </p>
                                        )}
                                        <p className="text-gray-400 leading-relaxed text-sm lg:text-base">
                                            {s.body}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Bottom divider */}
                        <div className="border-t border-white/10" />
                    </div>
                </section>

                <Footer />
            </main>
        </>
    )
}
