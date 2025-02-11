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
import ServiceHero from '@/components/services/ServicesHero';
import ServicesCta from '@/components/services/ServicesCta';

export default function Home() {

  const dict = useTranslation();

  return (
    <main
      className={`${openSans.className}`}
    >
      <Header enableScroll/>
      <ServiceHero/>
      <ServiceList/>
      <ServicesCta/>
      <Footer/>
    </main>
  )
}
