import { Open_Sans } from "next/font/google"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Head from "next/head"
import { motion } from "framer-motion"
import Link from "next/link"

const openSans = Open_Sans({ subsets: ["latin"] })

const aliados = [
  {
    nombre: "Grupo Chavon",
    descripcion: "Desarrollador inmobiliario de referencia en La Romana, con proyectos residenciales y comerciales de alto nivel.",
    categoria: "Desarrollo Inmobiliario",
    link: "/quienes-somos",
  },
  {
    nombre: "Casa de Campo Resort",
    descripcion: "Uno de los complejos turísticos más exclusivos del Caribe, socio estratégico en proyectos de interiorismo y carpintería de lujo.",
    categoria: "Turismo & Hospitalidad",
  },
  {
    nombre: "Ferretería Industrial RD",
    descripcion: "Proveedor principal de materiales y herrajes industriales para nuestra línea de producción.",
    categoria: "Proveedor",
  },
  {
    nombre: "Codia",
    descripcion: "Colegio Dominicano de Ingenieros, Arquitectos y Agrimensores. Trabajamos de la mano con profesionales certificados.",
    categoria: "Asociación Profesional",
  },
  {
    nombre: "Construmart RD",
    descripcion: "Red de distribución de materiales de construcción con presencia nacional.",
    categoria: "Distribución",
  },
  {
    nombre: "ProHotel Dominicano",
    descripcion: "Asociación de hoteleros que confían en nuestras soluciones de mobiliario para proyectos de renovación.",
    categoria: "Turismo & Hospitalidad",
  },
]

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}

export default function AliadosPage() {
  return (
    <main className={openSans.className} style={{ backgroundColor: "#0a0a0a" }}>
      <Head>
        <title>Aliados | La Fabbrica</title>
        <meta name="description" content="Conoce nuestros aliados estratégicos: desarrolladores, hoteleros y proveedores que confían en La Fabbrica." />
      </Head>
      <Header enableScroll />

      {/* Hero */}
      <section className="relative text-white pt-48 pb-32 overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="container mx-auto px-4 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="uppercase tracking-widest text-xs font-semibold mb-6"
            style={{ color: "#8a8a8a" }}
          >
            Red de colaboración
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-light mb-8 text-white"
          >
            Nuestros Aliados
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
            Empresas y organizaciones con las que construimos soluciones de alto nivel en toda la República Dominicana.
          </motion.p>
        </div>
      </section>

      {/* Grid de aliados */}
      <section className="py-24" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: "#1e1e1e" }}>
            {aliados.map((aliado, i) => (
              <motion.div
                key={aliado.nombre}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className={`p-10 group transition-colors duration-300${aliado.link ? " cursor-pointer" : ""}`}
                style={{ backgroundColor: "#0a0a0a" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#111111")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#0a0a0a")}
                onClick={() => aliado.link && window.open(aliado.link, "_self")}
              >
                <span className="text-xs font-semibold uppercase tracking-widest mb-5 block" style={{ color: "#454545" }}>
                  {aliado.categoria}
                </span>
                <h3 className="text-xl font-medium text-white mb-4">{aliado.nombre}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8a8a8a" }}>{aliado.descripcion}</p>
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
            ¿Tu empresa quiere ser aliada?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10"
            style={{ color: "#8a8a8a" }}
          >
            Estamos siempre abiertos a nuevas colaboraciones estratégicas. Escríbenos y hablemos.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/contactanos"
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
