import { Open_Sans } from "next/font/google"
import Image from "next/image"
import Head from "next/head"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"
import Link from "next/link"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function AludespaPage() {
  return (
    <>
      <Head>
        <title>Aludespa | Aliado La Fabbrica</title>
        <link rel="icon" type="image/png" href="/isotipo.png" />
      </Head>
      <main className={`${openSans.className} bg-black min-h-screen`}>
        <Header enableScroll={false} />

        {/* Hero */}
        <section
          className="relative h-screen min-h-[600px] flex items-center overflow-hidden"
          style={{ backgroundColor: "#1a1f24" }}
        >
          {/* Fondo con gradiente arquitectónico */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #0d1117 0%, #1a2332 40%, #243040 70%, #1a2332 100%)",
            }}
          />
          {/* Líneas decorativas verticales */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0"
                style={{
                  left: `${5 + i * 8}%`,
                  width: "1px",
                  background: "linear-gradient(to bottom, transparent, #7ab8d4, transparent)",
                  transform: `skewX(${-15 + i * 2}deg)`,
                }}
              />
            ))}
          </div>

          {/* Logo Aludespa arriba a la izquierda */}
          <div className="absolute top-28 left-8 z-10">
            <Image
              src="/aludespa.png"
              alt="Aludespa Group"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          {/* Texto vertical derecha */}
          <div
            className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-10"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            <span className="text-xs tracking-[0.4em] uppercase opacity-20" style={{ color: "#7ab8d4" }}>
              Innovación
            </span>
            <span className="text-xs tracking-[0.4em] uppercase opacity-20" style={{ color: "#7ab8d4" }}>
              Vanguardia
            </span>
          </div>

          {/* Contenido principal — derecha */}
          <div className="relative z-10 ml-auto mr-16 lg:mr-32 max-w-xl text-right px-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl lg:text-7xl font-light text-white mb-8 leading-tight"
              style={{ letterSpacing: "0.15em" }}
            >
              SOLUCIONES<br />INTERNACIONALES
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base lg:text-lg leading-relaxed mb-10"
              style={{ color: "#a0b4c0" }}
            >
              Nos convertimos en la solución de tu proyecto de arquitectura en lo que respecta a Fachadas, Ventanas, Puertas y mucho más... Con nosotros tu proyecto comienza a volverse realidad.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-end gap-4"
            >
              <a
                href="https://aludespagroup.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 text-xs font-semibold uppercase tracking-widest transition-colors"
                style={{ backgroundColor: "#7ab8d4", color: "#0a0a0a" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#5a98b4" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#7ab8d4" }}
              >
                Visitar sitio
              </a>
              <Link
                href="/aliados"
                className="inline-block px-8 py-3 text-xs font-semibold uppercase tracking-widest border transition-colors"
                style={{ borderColor: "#7ab8d4", color: "#7ab8d4" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#7ab8d420" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent" }}
              >
                Volver a Aliados
              </Link>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
