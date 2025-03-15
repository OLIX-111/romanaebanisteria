import { useTranslation } from "@/hook/UseTranslation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

const Footer = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const dict = useTranslation()
  const { header, footer } = dict 

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

          {/* Navegación principal (texto un poco más grande) 
          [
            { href: "/", text: header?.nav?.home },
            { href: "/store/services", text: header?.nav?.services },
            { href: "/store", text: header?.nav?.store },
            { href: "/gallery", text: header?.nav?.projects },
            { href: "/contact", text: header?.nav?.contact },
          ]
          */}
          <div className="">
            <nav className="flex flex-wrap gap-8 text-base font-medium">
              {
                [
                  { href: "/", text: header?.nav?.home },
                  { href: "/store/services", text: header?.nav?.services },
                  { href: "/store", text: header?.nav?.store },
                  { href: "/gallery", text: header?.nav?.projects },
                  { href: "/contact", text: header?.nav?.contact },
                ].map((item, index) => (
                  <Link key={index} href={`/${item.href}`} className="hover:text-gray-900 transition-colors">
                    {item.text}
                  </Link>
                ))
              }
            </nav>
            <div className="flex gap-4 justify-center mt-5 text-sm">
              <Link
                href="/terms"
                className="hover:text-gray-900 transition-colors"
              >
                {footer?.nav?.terms}
              </Link>
              <Link
                href="/privacy"
                className="hover:text-gray-900 transition-colors"
              >
                {footer?.nav?.privacy}
              </Link>
            </div>
          </div>

          {/* Redes Sociales (texto un poco más grande) */}
          <div className="flex items-center space-x-6 text-base font-medium">
            <Link
              href="https://instagram.com/romanaebanisteria"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              {footer?.social?.instagram}
            </Link>
            <Link
              href="https://facebook.com/romanaebanisteria"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              {footer?.social?.facebook}
            </Link>
          </div>
        </div>

        {/* Fila final: Derechos reservados */}
        <div className="mt-12 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} ROMAna Ebanistería. {footer?.copy}
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
