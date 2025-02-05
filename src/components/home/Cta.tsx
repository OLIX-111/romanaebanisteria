import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { getDictionary } from '@/locales/getDictionary';
import { useRouter } from "next/router";

export default function Cta() {
  const { ref, inView } = useInView({
    threshold: 0.3,
  });

  const { locale } = useRouter() as { locale: 'en' | 'es' };
  const dict = getDictionary(locale);

  // Ejemplo: Seleccionamos una imagen fija o aleatoria (entre 1..90):
  const randomNum = Math.floor(Math.random() * 90) + 1;
  const backgroundImageUrl = `/projects/romana_ebanisteria_grupo_chavon31.png`;
  // Si prefieres una imagen fija, simplemente reemplaza backgroundImageUrl con una ruta específica.

  return (
    <div
      className="relative isolate overflow-hidden bg-cover bg-fixed bg-no-repeat"
      style={{
        backgroundImage: `url('${backgroundImageUrl}')`,
        backgroundPosition: "center",
      }}
    >
      {/* Gradientes de color */}
      <div
        className="absolute top-0 left-0 w-full h-full -z-20
                   bg-gradient-to-b from-blue-950/40 via-blue-950/60 to-blue-950/40"
      />
      <div
        className="absolute top-0 left-0 w-full h-full -z-10
                   bg-gradient-to-b from-slate-900/40 via-gray-900/70 to-gray-950/40"
      />

      <div
        className="
          mx-auto w-full max-w-7xl 
          px-5 md:px-10 
          py-16 md:py-24 lg:py-28 2xl:py-36
        "
      >
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto w-full max-w-5xl text-center"
        >
          <h1
            className="
              mb-8
              text-[2.2rem] sm:text-[3rem] md:text-[3rem] lg:text-[3rem]
              w-full font-semibold md:font-bold
              text-gray-50 drop-shadow-md
            "
          >
            {locale === 'es' 
              ? "Descubre Nuestra Tienda" 
              : "Discover Our Store"}
          </h1>
          <p className="text-gray-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            {locale === 'es'
              ? "Encuentra materiales, mobiliario y accesorios de ebanistería y carpintería en aluminio con la calidad que nos distingue."
              : "Find high-quality cabinetry, aluminum carpentry, and accessories in one place."}
          </p>
          <div className="flex justify-center">
            <Link
              href="/tienda"
            >
              <button
                className="
                  flex items-center shadow-md bg-primary text-white
                  px-6 text-lg py-4 font-medium rounded hover:px-8 duration-200
                "
              >
                {locale === 'es' ? "Ir a la Tienda" : "Go to the Store"}
                <ArrowRightCircleIcon className="ml-3 w-6 h-6" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
