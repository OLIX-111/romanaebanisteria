import Image from "next/image";
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from "next/link";
import { useTranslation } from "@/hook/UseTranslation";

// -- 1. Definimos la interfaz para los trabajos/servicios --
interface Work {
  name: string;
  description: string;
  image: string;
  url: string;
  i: number;
}

// -- 2. Componente individual que renderiza cada ítem --
const SigleWork = (work: Work) => {
  const { ref, inView } = useInView({
    threshold: 0.14,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: work.i * 0.1 }}
      className="lg:col-span-3 xl:col-span-2 bg-slate-200 ring-2 ring-gray-100/20 h-[30rem] relative overflow-hidden"
      style={{ borderRadius: 0 }} // Removemos redondeados
    >
      <Link
        href={work.url}
        className="z-20 absolute bottom-0 w-full bg-gray-900/30 hover:bg-gray-900/5 duration-300 h-full flex items-end"
      >
        <div
          className="bg-bg px-4 pb-8 pt-36 w-full bg-gradient-to-b from-slate-900/0 to-gray-950/90 flex justify-between items-center"
        >
          <div>
            <p className="font-semibold text-gray-100 text-lg">
              {work.name}
            </p>
            <p className="text-base text-gray-200">
              {work.description}
            </p>
          </div>
        </div>
      </Link>
      <Image
        src={work.image}
        width={1200}
        height={900}
        alt={work.description + " | ROMAna Ebanistería"}
        className="w-full z-0 h-full object-cover bg-no-repeat absolute top-0 left-0"
        style={{ borderRadius: 0 }} // Sin esquinas redondeadas
      />
    </motion.div>
  );
};

// -- 3. Función auxiliar para generar una ruta de imagen aleatoria --
function getRandomImagePath() {
  const randomNum = Math.floor(Math.random() * 90) + 1; // Rango 1..90
  return `/projects/romana_ebanisteria_grupo_chavon${randomNum}.png`;
}

// -- 4. Componente principal: Renderiza la lista de trabajos --
const ServiceList = () => {
  const { ref: refTwo, inView: inViewTwo } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const dict = useTranslation();

  // Suponiendo que dict.serviceList.works contiene un array con { name, description, url } 
  // en lugar de la imagen. Aquí agregamos la imagen aleatoria y el índice `i`.
  const randomWorks: Work[] = dict.serviceList.works.map((item, index) => ({
    ...item,
    image: getRandomImagePath(),
    i: index,
  }));

  return (
    <section id="work" className="px-4 md:px-8">
      <div className="container mx-auto py-16 md:py-24">
        <motion.div
          ref={refTwo}
          initial={{ y: 90 }}
          animate={inViewTwo ? { y: 0 } : { y: 90 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="mt-2 text-gray-900 text-3xl md:text-4xl leading-tight font-semibold">
            {dict.serviceList.title}
          </h2>
        </motion.div>
        
        <div className="grid lg:grid-cols-6 gap-6 mt-12">
          {randomWorks.map((work) => (
            <SigleWork
              key={work.i}
              i={work.i}
              description={work.description}
              image={work.image}
              name={work.name}
              url={work.url}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceList;
