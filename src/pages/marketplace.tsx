import { Open_Sans } from "next/font/google"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Head from "next/head"
import { motion } from "framer-motion"
import Link from "next/link"
import { ShoppingBag, Ruler, Package, Truck } from "lucide-react"

const openSans = Open_Sans({ subsets: ["latin"] })

const categorias = [
  {
    icon: ShoppingBag,
    titulo: "Puertas & Ventanas",
    descripcion: "Puertas de madera, aluminio, MDF y melamina. Diseños estándar y a medida.",
    href: "/store",
  },
  {
    icon: Ruler,
    titulo: "Cocinas Integrales",
    descripcion: "Gabinetes, islas y soluciones completas para cocinas residenciales y comerciales.",
    href: "/store",
  },
  {
    icon: Package,
    titulo: "Mobiliario Personalizado",
    descripcion: "Closets, librerías, escritorios y mobiliario de oficina fabricado a tu medida.",
    href: "/store",
  },
  {
    icon: Truck,
    titulo: "Proyectos por Volumen",
    descripcion: "Soluciones para desarrolladores, hoteles y proyectos inmobiliarios de gran escala.",
    href: "/contactanos",
  },
]

const beneficios = [
  { titulo: "Fabricación propia", texto: "Todos nuestros productos se fabrican en nuestra planta de 39,027 ft² en La Romana." },
  { titulo: "Entrega nacional", texto: "Distribuimos a todo el país con tiempos de entrega acordados según el proyecto." },
  { titulo: "Garantía de calidad", texto: "48 años de experiencia respaldan cada pieza que fabricamos." },
  { titulo: "Asesoría incluida", texto: "Nuestro equipo te acompaña desde el diseño hasta la instalación." },
]

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}

export default function MarketplacePage() {
  return (
    <main className={openSans.className} style={{ backgroundColor: "#0a0a0a" }}>
      <Head>
        <title>Marketplace | La Fabbrica</title>
        <meta name="description" content="Explora el catálogo de productos y soluciones de La Fabbrica: puertas, cocinas, mobiliario y más." />
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
            Catálogo de productos
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-light mb-8 text-white"
          >
            Marketplace
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
            className="max-w-xl mx-auto text-lg mb-12"
            style={{ color: "#8a8a8a" }}
          >
            Explora nuestra línea completa de productos fabricados con precisión industrial y acabado artesanal.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              href="/store"
              className="px-8 py-3 text-xs font-semibold uppercase tracking-widest transition-colors"
              style={{ backgroundColor: "#ffffff", color: "#0a0a0a" }}
            >
              Ver tienda
            </Link>
            <Link
              href="/contactanos"
              className="px-8 py-3 text-xs font-semibold uppercase tracking-widest transition-colors text-white"
              style={{ border: "1px solid #454545" }}
            >
              Solicitar cotización
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-24" style={{ backgroundColor: "#0a0a0a", borderTop: "1px solid #1e1e1e" }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-light text-white mb-4">Lo que fabricamos</h2>
            <div className="mx-auto" style={{ width: "40px", height: "1px", backgroundColor: "#454545" }} />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: "#1e1e1e" }}>
            {categorias.map((cat, i) => (
              <motion.div
                key={cat.titulo}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={cat.href}
                  className="block p-10 group transition-colors duration-300 h-full"
                  style={{ backgroundColor: "#0a0a0a" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#111111")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#0a0a0a")}
                >
                  <cat.icon className="h-7 w-7 mb-8 transition-transform duration-300 group-hover:scale-110" style={{ color: "#8a8a8a" }} />
                  <h3 className="text-base font-medium text-white mb-3">{cat.titulo}</h3>
                  <p className="text-sm leading-relaxed mb-8" style={{ color: "#8a8a8a" }}>{cat.descripcion}</p>
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#454545" }}>
                    Ver productos →
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-24" style={{ backgroundColor: "#111111", borderTop: "1px solid #1e1e1e" }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-light text-white mb-4">¿Por qué comprar con nosotros?</h2>
            <div className="mx-auto" style={{ width: "40px", height: "1px", backgroundColor: "#454545" }} />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {beneficios.map((b, i) => (
              <motion.div
                key={b.titulo}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="text-center"
              >
                <div className="mx-auto mb-6" style={{ width: "24px", height: "1px", backgroundColor: "#454545" }} />
                <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-widest">{b.titulo}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8a8a8a" }}>{b.texto}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-32 text-center" style={{ backgroundColor: "#0a0a0a", borderTop: "1px solid #1e1e1e" }}>
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-light text-white mb-6"
          >
            ¿Tienes un proyecto en mente?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10"
            style={{ color: "#8a8a8a" }}
          >
            Cuéntanos qué necesitas y nuestro equipo te preparará una cotización personalizada sin costo.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              href="/store"
              className="inline-block px-10 py-4 text-xs font-semibold uppercase tracking-widest transition-colors"
              style={{ backgroundColor: "#ffffff", color: "#0a0a0a" }}
            >
              Explorar tienda
            </Link>
            <Link
              href="/presupuesto"
              className="inline-block px-10 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors"
              style={{ border: "1px solid #454545" }}
            >
              Crear presupuesto
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
