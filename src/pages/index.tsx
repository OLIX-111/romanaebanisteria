import Image from 'next/image'
import { Inter, Open_Sans } from 'next/font/google'
const openSans = Open_Sans({ subsets: ['latin'] })
import { useTranslation } from '@/hook/UseTranslation';
import Header from '@/components/layout/Header';
import Hero from '@/components/home/Hero';
import ServiceList from '@/components/home/ServiceList';
import AboutUs from '@/components/home/AboutUs';
import WhyUs from '@/components/home/WhyUs';
import ProjectGrid from '@/components/home/ProjectGrid';
import StoreSection from '@/components/home/StoreSection';
import Cta from '@/components/home/Cta';
import Footer from '@/components/layout/Footer';
import Head from 'next/head';
import { SuspendedBanner } from '@/components/Suspended';

export default function Home() {

  const dict = useTranslation();

  return (
    <>
      <Head>
        <title>
          Ebanistería y Carpintería en Aluminio de Alta Calidad | ROMAna Ebanistería
        </title>
        <meta name="description" content={"ROMAna Ebanistería, la fábrica más grande de ebanistería y carpintería en aluminio en La Romana. Más de 48 años ofreciendo soluciones personalizadas para proyectos residenciales, hoteleros e inmobiliarios en la República Dominicana."} />
        <link rel="icon" href="/home/ebanisteria.png" />
      </Head>
      <main
        className={`${openSans.className}`}
      >
        <Header enableScroll/>
        <Hero/>
        <StoreSection/>
        <AboutUs/>
        <ServiceList/>
        <WhyUs/>
        <ProjectGrid/>
        <Cta/>
        <Footer/>
      </main>
    </>
  )
}
