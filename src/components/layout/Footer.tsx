import { useTranslation } from "@/hook/UseTranslation";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  const dict = useTranslation()
  const { header, footer } = dict

  return (
    <footer
      className="border-t pt-16 pb-20 md:pt-24 md:pb-28"
      style={{ borderRadius: 0, backgroundColor: "#0a0a0a", borderColor: "#2a2a2a" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-y-8">
          {/* Logo */}
          <div className="mb-4 md:mb-0">
            <Link href="/">
              <div className="flex flex-col leading-none">
                <span className="text-white font-bold tracking-[0.2em] text-2xl uppercase">La Fabbrica</span>
                <span className="text-gray-600 text-[10px] tracking-[0.12em] uppercase mt-1">Suministro e instalación</span>
              </div>
            </Link>
          </div>

          <div>
            <nav className="flex flex-wrap gap-8 text-sm font-medium" style={{ color: "#8a8a8a" }}>
              {[
                { href: "/", text: header?.nav?.home },
                { href: "/store/services", text: header?.nav?.services },
                { href: "/store", text: header?.nav?.store },
                { href: "/gallery", text: header?.nav?.projects },
                { href: "/contact", text: header?.nav?.contact },
                { href: "/aliados", text: "Aliados" },
                { href: "/marketplace", text: "Marketplace" },
              ].map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="transition-colors hover:text-white"
                  style={{ color: "inherit" }}
                >
                  {item.text}
                </Link>
              ))}
            </nav>
            <div className="flex gap-4 justify-center mt-5 text-xs" style={{ color: "#454545" }}>
              <Link href="/terms" className="hover:text-white transition-colors">
                {footer?.nav?.terms}
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                {footer?.nav?.privacy}
              </Link>
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="flex items-center space-x-6 text-sm font-medium" style={{ color: "#8a8a8a" }}>
            <Link
              href="https://www.instagram.com/lafabbrica.rd/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              {footer?.social?.instagram}
            </Link>
            <Link
              href="https://web.facebook.com/profile.php?id=61592563232977"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              {footer?.social?.facebook}
            </Link>
          </div>
        </div>

        {/* Línea divisora */}
        <div className="mt-12 pt-8" style={{ borderTop: "1px solid #1e1e1e" }}>
          <p className="text-center text-xs" style={{ color: "#454545" }}>
            &copy; {new Date().getFullYear()} La Fabbrica. {footer?.copy}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
