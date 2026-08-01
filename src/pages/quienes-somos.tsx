import { Open_Sans } from "next/font/google"
import Image from "next/image"
import Head from "next/head"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"

const openSans = Open_Sans({ subsets: ["latin"] })

const ORANGE = "#d4641a"

const makeContainer = (delay: number) => ({
    hidden: {},
    visible: { transition: { staggerChildren: 0.04, delayChildren: delay } },
})

const letterVariants = {
    hidden: { y: "110%", opacity: 0 },
    visible: {
        y: "0%",
        opacity: 1,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
}

function SplitHeading({
    text,
    className,
    style,
    delay = 0,
    once = true,
}: {
    text: string
    className: string
    style?: React.CSSProperties
    delay?: number
    once?: boolean
}) {
    return (
        <motion.div
            className={`flex flex-wrap overflow-hidden ${className}`}
            style={style}
            variants={makeContainer(delay)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once }}
        >
            {text.split("").map((char, i) => (
                <span key={i} className="overflow-hidden inline-block">
                    <motion.span
                        className="inline-block"
                        variants={letterVariants}
                    >
                        {char === " " ? " " : char}
                    </motion.span>
                </span>
            ))}
        </motion.div>
    )
}

const sections = [
    {
        top: "QUIÉNES",
        bottom: "SOMOS",
        quote: '"TODO DESDE EL ORIGEN"',
        body: "Somos una empresa dominicana con más de 48 años de experiencia en la fabricación e instalación de mobiliario de alta calidad, carpintería en aluminio y soluciones integrales para proyectos residenciales, hoteleros e inmobiliarios en la República Dominicana.",
        delay: 0.1,
    },
    {
        top: "NUESTRA",
        bottom: "MISIÓN",
        quote: null,
        body: "El propósito de LA FABBRICA es brindar soluciones de fabricación y diseño de la más alta calidad, garantizando la satisfacción total de nuestros clientes a través de la innovación, el talento artesanal y el cumplimiento riguroso de los estándares que nos distinguen.",
        delay: 0,
    },
    {
        top: "NUESTRA",
        bottom: "VISIÓN",
        quote: null,
        body: "Ser reconocidos como la empresa líder en ebanistería, carpintería en aluminio y soluciones de mobiliario en la República Dominicana y el Caribe, distinguiéndonos por nuestra excelencia artesanal, innovación constante y compromiso inquebrantable con nuestros clientes.",
        delay: 0,
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
                            <div key={s.bottom}>
                                {/* Divider */}
                                <motion.div
                                    className="border-t border-white/10"
                                    initial={{ scaleX: 0, originX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                                />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 py-14 lg:py-16 items-start">
                                    {/* Left — animated headings */}
                                    <div>
                                        <SplitHeading
                                            text={s.top}
                                            className="font-serif-display text-5xl lg:text-6xl font-bold text-white leading-none tracking-tight"
                                            delay={s.delay}
                                        />
                                        <SplitHeading
                                            text={s.bottom}
                                            className="font-serif-display text-3xl lg:text-4xl font-bold leading-none tracking-tight mt-2"
                                            style={{ color: ORANGE }}
                                            delay={s.delay + 0.15}
                                        />
                                    </div>

                                    {/* Right — content */}
                                    <motion.div
                                        className="flex flex-col gap-4 lg:pt-2"
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: s.delay + 0.4 }}
                                    >
                                        {s.quote && (
                                            <p className="text-white/80 text-sm lg:text-base tracking-widest uppercase">
                                                {s.quote}
                                            </p>
                                        )}
                                        <p className="text-gray-400 leading-relaxed text-sm lg:text-base">
                                            {s.body}
                                        </p>
                                    </motion.div>
                                </div>
                            </div>
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
