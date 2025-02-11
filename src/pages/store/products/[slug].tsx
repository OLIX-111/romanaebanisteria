import { ProductDetail } from "@/components/store/ProductDetail"
import type { GetServerSideProps } from "next"
import { getProductBySlug, getProductBySlugWithRecommendations } from "../../../../sanity/sanityQueries"
import { RecommendedProducts } from "@/components/store/RecomendedProjects"
import { Inter, Open_Sans } from 'next/font/google'
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
const openSans = Open_Sans({ subsets: ['latin'] })



interface ProductPageProps {
  product: any // Reemplaza 'any' con el tipo correcto de tu producto
  recommendations: any[] // Reemplaza 'any' con el tipo correcto de tu producto
}

export default function ProductPage({ product, recommendations }: ProductPageProps) {
  if (!product) {
    return <div>Producto no encontrado</div>
  }

  return (
    <>
    <main
      className={`${openSans.className}`}
    >
      <Header/>
      <div className="px-4 py-8 sm:px-6 lg:px-8 mt-24">
        <div className="container mx-auto lg:px-4">
          <ProductDetail product={product} />
          <RecommendedProducts products={recommendations} />
        </div>
      </div>
      <Footer/>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string }
  const data = await getProductBySlugWithRecommendations(slug)

  if (!data.product) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      product: data.product,
      recommendations: data.recommendations,
    },
  }
}

