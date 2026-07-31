import { Open_Sans } from 'next/font/google'
const openSans = Open_Sans({ subsets: ['latin'] })
import { useTranslation } from '@/hook/UseTranslation';
import Header from '@/components/layout/Header';
import Hero from '@/components/home/Hero';
import AboutUs from '@/components/home/AboutUs';
import WhyUs from '@/components/home/WhyUs';
import Cta from '@/components/home/Cta';
import StoreSection from '@/components/home/StoreSection';
import ProjectGrid from '@/components/home/ProjectGrid';
import Footer from '@/components/layout/Footer';
import Head from 'next/head';

export default function Home() {
  const dict = useTranslation();

  return (
    <>
      <Head>
        <title>
          Ebanistería y Carpintería en Aluminio de Alta Calidad | La Fabbrica
        </title>
        <meta name="description" content={"La Fabbrica, la fábrica más grande de ebanistería y carpintería en aluminio en La Romana. Más de 48 años ofreciendo soluciones personalizadas para proyectos residenciales, hoteleros e inmobiliarios en la República Dominicana."} />
        <link rel="icon" type="image/png" href="/isotipo.png" />
      </Head>
      <main className={`${openSans.className} bg-black overflow-x-hidden`}>
        <Header />
        <Hero />
        <AboutUs />
        <WhyUs />
        <Cta />
        <StoreSection />
        <ProjectGrid />
        <Footer />
      </main>
    </>
  )
}
