// pages/noticias/index.tsx
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { client } from '../../../sanity/lib/client'
import Head from 'next/head'
import { GetSanityImageProps } from '@/utils/sanityImage'
import { Poppins } from 'next/font/google'
import { motion } from 'framer-motion'
import { useTranslation } from '@/hook/UseTranslation'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

interface Noticia {
  _id: string
  slug: { current: string }
  title: { [key: string]: string }
  shortDescription: { [key: string]: string }
  coverImage: any
  publishedAt: string
}

interface NoticiasProps {
  noticias: Noticia[]
}

export default function Noticias({ noticias }: NoticiasProps) {
  const router = useRouter()
  const { locale }: any = router
  const dict = useTranslation()

  return (
    <>
      <Head>
        <link rel="canonical" href={`https://www.geekguysstudio.com${router.asPath}`} />
        <link rel="alternate" hrefLang="x-default" href={`https://www.geekguysstudio.com${router.asPath}`} />
        <link rel="alternate" hrefLang="en" href={`https://www.geekguysstudio.com/en${router.asPath}`} />
        <link rel="alternate" hrefLang="es" href={`https://www.geekguysstudio.com/es${router.asPath}`} />
      </Head>
      <main className={`${poppins.className} body-bg text-title py-28`}>
        <div className="container-gg mx-auto px-4 py-8">
          <motion.h1
            className="text-3xl md:text-4xl font-bold mb-12 text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Noticias
          </motion.h1>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {noticias.map((noticia, index) => {
              const imageProps = GetSanityImageProps(noticia.coverImage)
              return (
                <motion.div
                  key={noticia._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Link href={`/noticias/${noticia.slug.current}`} className="block overflow-hidden transition-all duration-300">
                    <div className="relative h-48 md:h-96 rounded-xl border-2 border-gray-100/20 overflow-hidden">
                      <Image
                        {...imageProps}
                        alt={noticia.title[locale]}
                        objectFit="cover"
                      />
                    </div>
                    <div className="py-6 px-2">
                      <h2 className="text-xl lg:text-3xl font-semibold mb-2 text-white">
                        {noticia.title[locale]}
                      </h2>
                      {/* Si deseas mostrar la descripción corta, descomenta la siguiente línea */}
                      {/* <p className="text-gray-300 mb-4">{noticia.shortDescription[locale]}</p> */}
                      {/* Puedes agregar más detalles según lo necesites */}
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const noticias = await client.fetch(`
    *[_type == "noticias"] | order(publishedAt desc) {
      _id,
      slug,
      title,
      shortDescription,
      coverImage,
      publishedAt
    }
  `)

  return {
    props: { noticias },
    revalidate: 60,
  }
}
