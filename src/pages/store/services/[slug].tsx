import type { GetServerSideProps } from "next"
import { Open_Sans } from "next/font/google"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { ServiceDetail } from "@/components/store/ServiceDetail"

const openSans = Open_Sans({ subsets: ["latin"] })

interface ServicePageProps {
  service: {
    name: string
    imageUrl: string
    slug: string
    gallery: string[]
    price: number
    categoryName: string
    description: string
    availability: string
    duration: string
  }
}

export default function ServicePage({ service }: ServicePageProps) {
  if (!service) {
    return <div>Servicio no encontrado</div>
  }

  return (
    <main className={`${openSans.className}`}>
      <Header />
      <div className="px-4 py-8 sm:px-6 lg:px-8 mt-24">
        <div className="container mx-auto lg:px-4">
          <ServiceDetail service={service} />
        </div>
      </div>
      <Footer />
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { notFound: true }
}
