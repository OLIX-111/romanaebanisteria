import { motion } from "framer-motion";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

const Footer = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <motion.footer
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="bg-white text-gray-700 border-t border-gray-200 pt-16 pb-20 md:pt-24 md:pb-28"
      style={{ borderRadius: 0 }}
    >
      <div className="container mx-auto px-4">
        {/* Fila principal */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-y-8">
          {/* Logo y Nombre */}
          <div className="mb-4 md:mb-0">
            <Link href="/">
              <img src="https://storage.googleapis.com/portfoliprofiles/GG%20studio/romanaEbanisteri%CC%81a.png"
                alt="ROMAna Ebanistería Logo"
                className="h-16 w-auto"
                style={{ borderRadius: 0 }}
              />
            </Link>
          </div>

          {/* Navegación principal (texto un poco más grande) */}
          <nav className="flex flex-wrap gap-8 text-base font-medium">
            <Link href="/empresa" className="hover:text-gray-900 transition-colors">
              Empresa
            </Link>
            <Link href="/servicios" className="hover:text-gray-900 transition-colors">
              Servicios
            </Link>
            <Link href="/tienda" className="hover:text-gray-900 transition-colors">
              Tienda
            </Link>
            <Link href="/proyectos" className="hover:text-gray-900 transition-colors">
              Galería
            </Link>
            <Link href="/contacto" className="hover:text-gray-900 transition-colors">
              Contacto
            </Link>
          </nav>

          {/* Redes Sociales (texto un poco más grande) */}
          <div className="flex items-center space-x-6 text-base font-medium">
            <Link
              href="https://instagram.com/romanaebanisteria"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              Instagram
            </Link>
            <Link
              href="https://facebook.com/romanaebanisteria"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              Facebook
            </Link>
          </div>
        </div>

        {/* Fila final: Derechos reservados */}
        <div className="mt-12 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} ROMAna Ebanistería. Todos los derechos reservados.
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
