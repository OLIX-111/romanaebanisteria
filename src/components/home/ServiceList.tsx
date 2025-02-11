"use client"

import Image from "next/image";
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from "next/link";
import { useTranslation } from "@/hook/UseTranslation";
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from "react";
import { getServices } from "../../../sanity/sanityQueries";

interface Service {
  _id: string;
  name: string;
  description: string;
  shortdescription: string;
  imageUrl: string;
  slug: { current: string };
  price: number;
  categoryName: string;
  duration: string;
  availability: string;
}

const SingleService = ({ service, index }: { service: Service; index: number }) => {
  const { ref, inView } = useInView({
    threshold: 0.14,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-2 bg-gray-100 relative overflow-hidden group"
    >
      <Link href={`/store/services/${service.slug.current}`} className="block h-full">
        <div className="relative h-[30rem]">
         <Image
            src={service.imageUrl || "/placeholder.svg"}
            width={900}
            height={900}
            alt={service.description + " | ROMAna Ebanistería"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 z-10"
          />
        </div>
        <div className="absolute z-20 bg-gradient-to-t flex justify-end flex-col from-black/50 via-text/40 to-black/0 bottom-0 left-0 right-0 p-6 transform transition-transform duration-300 h-full">
          <h3 className="font-medium text-white text-xl mb-2">{service.name}</h3>
          <p className="text-gray-200 text-sm mb-4">{service.shortdescription}</p>
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

const ServiceList = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const dict = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const fetchedServices = await getServices();
        setServices(fetchedServices);
      } catch (err) {
        setError("Error al cargar los servicios. Por favor, intente de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (isLoading) {
    return <div className="text-center py-24">Cargando servicios...</div>;
  }

  if (error) {
    return <div className="text-center py-24 text-red-500">{error}</div>;
  }

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
          {services.map((service, index) => (
            <SingleService
              key={service._id}
              service={service}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceList;
