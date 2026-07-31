import { Open_Sans } from "next/font/google"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Head from "next/head"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

const openSans = Open_Sans({ subsets: ["latin"] })

const marcas = [
  { nombre: "Romana Ebanistería", categoria: "Ebanistería", logo: "/romanaEbanistería_alt.png", link: "https://www.romanaebanisteria.com/", logoW: 140, logoH: 56 },
  { nombre: "Aludespa", categoria: "Soluciones Internacionales", logo: "/aludespa.png", link: "https://aludespagroup.com/", logoW: 280, logoH: 112 },
  { nombre: "Waoo", categoria: "Experiencias", logo: "/Waoo.png", link: "https://www.waooexperience.com/", logoW: 280, logoH: 112 },
  { nombre: "Tretton", categoria: "", logo: "/NuevoTretton.png", link: "https://odoo.grupochavon.com/", logoW: 280, logoH: 112 },
  { nombre: "Novach", categoria: "Marketing", logo: "/1-NOVACH.png", link: "https://www.instagram.com/novach.rd/", logoW: 280, logoH: 112 },
  { nombre: "Marca F", categoria: "Iluminación" },
  { nombre: "Marca G", categoria: "Aluminio" },
  { nombre: "Marca H", categoria: "Herrajes" },
  { nombre: "Marca I", categoria: "Madera" },
  { nombre: "Marca J", categoria: "Acabados" },
  { nombre: "Marca K", categoria: "Vidrio" },
  { nombre: "Marca L", categoria: "Iluminación" },
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function AliadosPage() {
  return (
    <main className={openSans.className} style={{ backgroundColor: "#0a0a0a" }}>
      <Head>
        <title>Marcas Aliadas | La Fabbrica</title>
        <meta name="description" content="Las marcas y proveedores que respaldan la calidad de La Fabbrica." />
        <link rel="icon" type="image/png" href="/isotipo.png" />
      </Head>
      <Header enableScroll={false} />

      {/* Hero */}
      <section className="relative text-white pt-48 pb-24 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="uppercase tracking-widest text-xs font-semibold mb-6"
            style={{ color: "#8a8a8a" }}
          >
            Respaldados por los mejores
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-light mb-6 text-white"
          >
            Nuestras Marcas
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mb-8"
            style={{ width: "40px", height: "1px", backgroundColor: "#454545" }}
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl mx-auto text-lg"
            style={{ color: "#8a8a8a" }}
          >
            Trabajamos con las marcas y proveedores más reconocidos del mercado para garantizar materiales de primera calidad en cada proyecto.
          </motion.p>
        </div>
      </section>

      {/* Grid de logos */}
      <section className="pb-32">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px" style={{ backgroundColor: "#1e1e1e" }}>
            {marcas.map((marca, i) => (
              <motion.div
                key={marca.nombre}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`flex flex-col items-center justify-center gap-3 py-12 px-6 group transition-colors duration-300${marca.link ? " cursor-pointer" : ""}`}
                style={{ backgroundColor: "#0a0a0a", minHeight: "160px" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#111111")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#0a0a0a")}
                onClick={() => marca.link && window.open(marca.link, "_blank", "noopener,noreferrer")}
              >
                {marca.logo ? (
                  <Image
                    src={marca.logo}
                    alt={marca.nombre}
                    width={marca.logoW ?? 140}
                    height={marca.logoH ?? 56}
                    className="object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ width: `${marca.logoW ?? 140}px`, height: `${marca.logoH ?? 56}px` }}
                  />
                ) : (
                  <div
                    className="w-24 h-12 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-100"
                    style={{ border: "1px solid #2a2a2a", opacity: 0.5 }}
                  >
                    <span className="text-xs uppercase tracking-widest" style={{ color: "#555" }}>
                      {marca.nombre}
                    </span>
                  </div>
                )}
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "#3a3a3a" }}>
                  {marca.categoria}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 text-center" style={{ backgroundColor: "#111111", borderTop: "1px solid #1e1e1e" }}>
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-light text-white mb-6"
          >
            ¿Tu marca quiere ser parte de La Fabbrica?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10"
            style={{ color: "#8a8a8a" }}
          >
            Estamos abiertos a nuevas alianzas con marcas y proveedores que compartan nuestra visión de calidad. Escríbenos.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/contact"
              className="inline-block px-10 py-4 text-xs font-semibold uppercase tracking-widest transition-colors"
              style={{ backgroundColor: "#ffffff", color: "#0a0a0a" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#c0c0c0" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#ffffff" }}
            >
              Contáctanos
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
