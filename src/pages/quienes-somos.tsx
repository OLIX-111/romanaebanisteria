import { Open_Sans } from "next/font/google"
import Image from "next/image"
import Head from "next/head"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"

const openSans = Open_Sans({ subsets: ["latin"] })

const valores = [
  { titulo: "Calidad", descripcion: "Cada pieza que fabricamos pasa por un riguroso control de calidad. Usamos materiales de primera y técnicas de precisión." },
  { titulo: "Tradición", descripcion: "Más de cuatro décadas de oficio nos respaldan. Nuestro conocimiento se ha transmitido de generación en generación." },
  { titulo: "Innovación", descripcion: "Combinamos técnicas artesanales con tecnología de vanguardia para ofrecer soluciones modernas y duraderas." },
  { titulo: "Compromiso", descripcion: "Cada proyecto es tratado con la misma dedicación, sin importar su escala. El cliente siempre es nuestra prioridad." },
]

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}

export default function QuienesSomos() {
  return (
    <>
      <Head>
        <title>Quiénes Somos | La Fabbrica</title>
        <link rel="icon" type="image/png" href="/isotipo.png" />
      </Head>
      <main className={`${openSans.className} bg-black min-h-screen`}>
        <Header enableScroll={false} />

        {/* Hero */}
        <section className="relative pt-48 pb-24 text-center overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="uppercase tracking-widest text-xs font-semibold mb-6"
            style={{ color: "#8a8a8a" }}
          >
            La Romana, República Dominicana
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-light text-white mb-6"
          >
            Quiénes Somos
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
            className="max-w-2xl mx-auto text-lg px-6"
            style={{ color: "#8a8a8a" }}
          >
            Somos la fábrica más grande de ebanistería y carpintería en aluminio de La Romana, con más de 40 años transformando espacios en la República Dominicana.
          </motion.p>
        </section>

        {/* Historia */}
        <section className="py-24 px-6" style={{ backgroundColor: "#0a0a0a" }}>
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="uppercase tracking-widest text-xs mb-6" style={{ color: "#454545" }}>Nuestra historia</p>
              <h2 className="text-4xl lg:text-5xl font-light text-white mb-8 leading-tight">
                Desde 1981, fabricando con pasión
              </h2>
              <p className="leading-relaxed mb-5" style={{ color: "#8a8a8a" }}>
                La Fabbrica nació en La Romana como un taller artesanal con una visión clara: producir muebles y carpintería de la más alta calidad para el mercado dominicano. Desde sus inicios, la empresa se distinguió por su atención al detalle y su compromiso con la excelencia.
              </p>
              <p className="leading-relaxed" style={{ color: "#8a8a8a" }}>
                Con el paso de los años, crecimos hasta convertirnos en la planta de producción más grande del este del país, atendiendo proyectos residenciales, hoteleros e inmobiliarios de primer nivel, tanto en la República Dominicana como en el Caribe.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative overflow-hidden"
              style={{ height: "420px" }}
            >
              <Image
                src="/home/learnmore_romana_ebanisteria.jpg"
                alt="Taller La Fabbrica"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* Misión y Visión */}
        <section className="py-24 px-6" style={{ backgroundColor: "#111111", borderTop: "1px solid #1e1e1e", borderBottom: "1px solid #1e1e1e" }}>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="uppercase tracking-widest text-xs mb-4" style={{ color: "#454545" }}>Misión</p>
              <h3 className="text-2xl font-light text-white mb-4">Fabricar con propósito</h3>
              <p className="leading-relaxed" style={{ color: "#8a8a8a" }}>
                Ofrecer soluciones integrales de ebanistería y carpintería en aluminio que superen las expectativas de nuestros clientes, combinando artesanía tradicional con tecnología de vanguardia, garantizando durabilidad, estética y funcionalidad en cada proyecto.
              </p>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <p className="uppercase tracking-widest text-xs mb-4" style={{ color: "#454545" }}>Visión</p>
              <h3 className="text-2xl font-light text-white mb-4">Liderar el Caribe</h3>
              <p className="leading-relaxed" style={{ color: "#8a8a8a" }}>
                Ser la empresa de referencia en ebanistería y carpintería de precisión en el Caribe, reconocida por la calidad de sus productos, la innovación de sus procesos y el impacto positivo que genera en cada comunidad donde opera.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Valores */}
        <section className="py-24 px-6" style={{ backgroundColor: "#0a0a0a" }}>
          <div className="max-w-5xl mx-auto">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <p className="uppercase tracking-widest text-xs mb-4" style={{ color: "#454545" }}>Lo que nos define</p>
              <h2 className="text-4xl font-light text-white">Nuestros valores</h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: "#1e1e1e" }}>
              {valores.map((v, i) => (
                <motion.div
                  key={v.titulo}
                  variants={fadeInUp}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="p-8"
                  style={{ backgroundColor: "#0a0a0a" }}
                >
                  <h4 className="text-white text-lg font-medium mb-3">{v.titulo}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: "#8a8a8a" }}>{v.descripcion}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Romana Ebanistería CTA */}
        <section className="py-20 text-center px-6" style={{ backgroundColor: "#111111", borderTop: "1px solid #1e1e1e" }}>
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="uppercase tracking-widest text-xs" style={{ color: "#454545" }}>Parte del grupo</p>
            <a
              href="https://www.romanaebanisteria.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 group"
            >
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold animate-bounce"
                style={{ backgroundColor: "#1e1e1e", color: "#ffffff" }}
              >
                <span>Visita nuestro sitio</span>
                <span>↓</span>
              </div>
              <Image
                src="/romanaEbanistería_alt.png"
                alt="Romana Ebanistería"
                width={160}
                height={64}
                className="object-contain group-hover:opacity-70 transition-opacity duration-200"
              />
            </a>
          </motion.div>
        </section>

        <Footer />
      </main>
    </>
  )
}
