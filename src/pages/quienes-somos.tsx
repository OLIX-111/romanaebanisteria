import { Open_Sans } from "next/font/google"
import Image from "next/image"
import Head from "next/head"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"
import Link from "next/link"

const openSans = Open_Sans({ subsets: ["latin"] })

const opciones = [
  {
    nombre: "Romana Ebanistería",
    descripcion: "Más de 40 años fabricando ebanistería y carpintería en aluminio de alta calidad en La Romana.",
    logo: "/romanaEbanistería_alt.png",
    href: "/romana-ebanisteria",
    bg: "#0a0a0a",
  },
  {
    nombre: "Aludespa",
    descripcion: "Soluciones internacionales en aluminio para fachadas, ventanas, puertas y más.",
    logo: "/aludespa.png",
    href: "/aludespa",
    bg: "#1a2332",
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

        {/* Título */}
        <section className="pt-40 pb-16 text-center" style={{ backgroundColor: "#0a0a0a" }}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="uppercase tracking-widest text-xs mb-4"
            style={{ color: "#8a8a8a" }}
          >
            Nuestros aliados
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl lg:text-6xl font-light text-white"
          >
            Quiénes Somos
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-6"
            style={{ width: "40px", height: "1px", backgroundColor: "#454545" }}
          />
        </section>

        {/* Dos opciones */}
        <section className="flex flex-col lg:flex-row min-h-[60vh]">
          {opciones.map((op, i) => (
            <Link
              key={op.nombre}
              href={op.href}
              className="flex-1 flex flex-col items-center justify-center gap-8 py-20 px-10 group transition-colors duration-300 relative overflow-hidden"
              style={{ backgroundColor: op.bg }}
            >
              {/* Línea divisoria entre cards (solo desktop) */}
              {i === 0 && (
                <div className="hidden lg:block absolute right-0 top-12 bottom-12 w-px" style={{ backgroundColor: "#2a2a2a" }} />
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="flex flex-col items-center gap-6 text-center"
              >
                <Image
                  src={op.logo}
                  alt={op.nombre}
                  width={180}
                  height={72}
                  className="object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
                <p className="text-sm max-w-xs leading-relaxed" style={{ color: "#8a8a8a" }}>
                  {op.descripcion}
                </p>
                <span
                  className="text-xs uppercase tracking-widest border-b pb-0.5 transition-colors duration-300"
                  style={{ color: "#555", borderColor: "#333" }}
                >
                  Conocer más →
                </span>
              </motion.div>
            </Link>
          ))}
        </section>

        <Footer />
      </main>
    </>
  )
}
