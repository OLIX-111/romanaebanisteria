import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

export default function CaseStudies() {
  const router = useRouter()

  return (
    <>
      <Head>
        <link rel="icon" type="image/png" href="/isotipo.png" />
      </Head>
      <main className={`${poppins.className} bg-black text-white py-28`}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-12">Noticias</h1>
          <p className="text-gray-400">Próximamente.</p>
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return { props: {} }
}
