"use client"

import Image from "next/image";
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from "next/link";
import { useTranslation } from "@/hook/UseTranslation";
import { ArrowRight } from 'lucide-react';

interface Work {
  name: string;
  description: string;
  image: string;
  url: string;
  i: number;
}

const SingleWork = (work: Work) => {
  const { ref, inView } = useInView({
    threshold: 0.14,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: work.i * 0.1 }}
      className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-2 bg-gray-100 relative overflow-hidden group"
    >
      <Link href={work.url} className="block h-full">
        <div className="relative h-[30rem]">
          <Image
            src={work.image || "/placeholder.svg"}
            layout="fill"
            objectFit="cover"
            alt={work.description + " | ROMAna Ebanistería"}
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <div className="h-full w-full absolute bg-gradient-to-b from-black/0 to-black/40 z-10" />
        </div>
        <div className="absolute z-20 bottom-0 left-0 right-0 p-6 transform transition-transform duration-300">
          <h3 className="font-medium text-white text-xl mb-2">{work.name}</h3>
          <p className="text-gray-200 text-sm mb-4">{work.description}</p>
          <motion.div
            className="inline-flex items-center text-white"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Ver más <ArrowRight size={18} className="ml-2" />
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
};

function getRandomImagePath() {
  const randomNum = Math.floor(Math.random() * 90) + 1;
  return `/projects/romana_ebanisteria_grupo_chavon${randomNum}.png`;
}

const ServiceList = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const dict = useTranslation();

  const randomWorks: Work[] = dict.serviceList.works.map((item, index) => ({
    ...item,
    i: index,
  }));

  return (
    <section id="work" className="bg-white py-24">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-medium text-gray-900 mb-6">
            {dict.serviceList.title}
          </h2>
          <div className="w-24 h-1 bg-gray-900 mx-auto" />
        </motion.div>
        
        <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-6">
          {randomWorks.map((work) => (
            <SingleWork
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
