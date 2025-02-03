// pages/noticias/[slug].tsx
import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { client } from '../../../sanity/lib/client'
import { PortableText } from '@portabletext/react'
import imageUrlBuilder from '@sanity/image-url'
import Head from 'next/head'
import { GetSanityImageProps } from '../../utils/sanityImage'
import Link from 'next/link'
import { Poppins } from 'next/font/google'
import { useTranslation } from '@/hook/UseTranslation'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

const builder = imageUrlBuilder(client)

interface Noticia {
  title: { [key: string]: string }
  description: { [key: string]: any }
  coverImage: any
  publishedAt: string
  shortDescription: { [key: string]: string }
  slug: { current: string }
}

interface NoticiaProps {
  noticia: Noticia
}

const ptComponents = {
  block: {
    h1: ({ children }: any) => (
      <h1 className="text-3xl lg:text-7xl font-bold my-8">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-2xl lg:text-6xl font-semibold mt-8">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl lg:text-5xl font-medium mt-4 my-8">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-xl font-medium mt-3 my-8">{children}</h4>
    ),
    normal: ({ children }: any) => (
      <p className="text-lg lg:text-xl mb-6 text-gray-100">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="text-lg lg:text-xl list-disc pl-5 mb-4 space-y-7 text-gray-100">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="text-lg lg:text-xl list-decimal pl-5 mb-4 space-y-7 text-gray-100">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="text-lg lg:text-xl my-4 text-gray-100">{children}</li>
    ),
    number: ({ children }: any) => (
      <li className="text-lg lg:text-xl my-4 text-gray-100">{children}</li>
    ),
  },
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) {
        return null
      }
      return (
        <div className="relative w-full h-full my-12 lg:my-24">
          <Image
            src={builder.image(value).url()}
            alt={value.alt || ' '}
            height={1200}
            width={1800}
            className="w-full h-full rounded-xl ring-2 ring-gray-200/20"
            placeholder="blur"
            blurDataURL={builder.image(value).width(10).height(7).blur(10).url()}
          />
        </div>
      )
    },
  },
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
      return (
        <a href={value.href} rel={rel} className="text-blue-500 hover:underline">
          {children}
        </a>
      )
    },
    strong: ({ children }: any) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-gray-800 rounded px-1 py-0.5 text-sm font-mono">
        {children}
      </code>
    ),
  },
}

export default function Noticia({ noticia }: NoticiaProps) {
  const router = useRouter()
  const { locale }: any = router
  const dict = useTranslation()

  if (router.isFallback) {
    return <div>Loading...</div>
  }

  const coverImageProps = GetSanityImageProps(noticia.coverImage)

  // Se obtiene una porción de texto para el meta description
  const metaDescription =
    noticia.description[locale] &&
    noticia.description[locale][0] &&
    noticia.description[locale][0].children &&
    noticia.description[locale][0].children[0] &&
    noticia.description[locale][0].children[0].text
      ? noticia.description[locale][0].children[0].text.slice(0, 160)
      : ''

  return (
    <>
      <Head>
        <title>{`${noticia.title[locale]} | Geek Guys Studio`}</title>
        <meta name="description" content={metaDescription} />
        <link
          rel="canonical"
          href={`https://www.geekguysstudio.com${router.asPath}`}
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`https://www.geekguysstudio.com${router.asPath}`}
        />
        <link
          rel="alternate"
          hrefLang="en"
          href={`https://www.geekguysstudio.com/en${router.asPath}`}
        />
        <link
          rel="alternate"
          hrefLang="es"
          href={`https://www.geekguysstudio.com/es${router.asPath}`}
        />
      </Head>
      <main className={`${poppins.className} body-bg text-title py-28`}>
        <article className="max-w-7xl mx-auto px-4 py-8 text-white">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">{noticia.title[locale]}</h1>
            {/* Si se desea mostrar la fecha de publicación */}
            <p className="text-sm text-gray-300">
              {new Date(noticia.publishedAt).toLocaleDateString(locale)}
            </p>
          </header>
          <Image
            {...coverImageProps}
            alt={noticia.title[locale]}
            layout="responsive"
            sizes="(max-width: 768px) 100vw, 1200px"
            className="rounded-xl mb-8"
            placeholder="blur"
            blurDataURL={builder
              .image(noticia.coverImage)
              .width(20)
              .height(10)
              .blur(10)
              .url()}
          />
          <div className="prose prose-lg max-w-none prose-invert">
            <PortableText
              value={noticia.description[locale]}
              components={ptComponents}
            />
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await client.fetch(
    `*[_type == "noticias" && defined(slug.current)][].slug.current`
  )

  return {
    paths: slugs.map((slug: string) => ({ params: { slug } })),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const { slug = "" } = params as { slug: string }
  const noticia = await client.fetch(
    `
    *[_type == "noticias" && slug.current == $slug][0] {
      title,
      description,
      coverImage,
      publishedAt,
      shortDescription,
      slug
    }
  `,
    { slug }
  )

  return {
    props: { noticia },
    revalidate: 60,
  }
}
