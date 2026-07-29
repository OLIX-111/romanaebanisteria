import { GetStaticProps, GetStaticPaths } from 'next'

export default function CaseStudy() {
  return null
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: false }
}

export const getStaticProps: GetStaticProps = async () => {
  return { notFound: true }
}
