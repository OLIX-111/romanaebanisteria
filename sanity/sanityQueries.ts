// sanityQueries.js

import { client } from "./lib/client"


// sanityQueries.js

export const fetchCaseStudies = async (locale: string) => {
  const query = `*[_type == "caseStudy"]{
    coverImage,
    slug,
    title,
    shortDescription,
    description{
      ...,
      _type == 'image' => {
        ...,
        asset->{
          _id,
          url
        }
      }
    }
  }`
  return await client.fetch(query)
}

export const fetchCaseStudy = async (id: string | number, locale: string) => {
  const query = `*[_type == "caseStudy" && _id == $id]{
    _id,
    coverImage,
    title,
    shortDescription,
    description{
      ...,
      _type == 'image' => {
        ...,
        asset->{
          _id,
          url
        }
      }
    }
  }[0]` // [0] para obtener el primer elemento de la respuesta

  return await client.fetch(query, { id })
}

export const fetchCaseStudyBySlug = async (slug: string, locale: string) => {
  const query = `*[_type == "caseStudy" && slug.current == $slug]{
    _id,
    coverImage,
    title,
    shortDescription,
    description{
      ...,
      _type == 'image' => {
        ...,
        asset->{
          _id,
          url
        }
      }
    }
  }[0]`

  return await client.fetch(query, { slug })
}

