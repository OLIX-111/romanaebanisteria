// sanityQueries.ts

import { client } from "./lib/client"

export const fetchNoticias = async (locale: string) => {
  const query = `*[_type == "noticias"]{
    coverImage,
    publishedAt,
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

export const fetchNoticia = async (id: string | number, locale: string) => {
  const query = `*[_type == "noticias" && _id == $id]{
    _id,
    coverImage,
    publishedAt,
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

  return await client.fetch(query, { id })
}

export const fetchNoticiasBySlug = async (slug: string, locale: string) => {
  const query = `*[_type == "noticias" && slug.current == $slug]{
    _id,
    coverImage,
    publishedAt,
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

// ------------------------
// QUERIES PARA EMPRESAS
// ------------------------

export const fetchEmpresas = async (locale: string) => {
  const query = `*[_type == "empresas"]{
    portada,
    sectorImg,
    sector,
    type,
    nombreEmpresa,
    tituloLargo,
    slug,
    descripcionCorta,
    descripcionDetallada{
      ...,
      _type == 'image' => {
        ...,
        asset->{
          _id,
          url
        }
      }
    },
    website,
    featured
  }`
  return await client.fetch(query)
}

export const fetchEmpresa = async (id: string | number, locale: string) => {
  const query = `*[_type == "empresas" && _id == $id]{
    _id,
    portada,
    sectorImg,
    sector,
    type,
    nombreEmpresa,
    tituloLargo,
    slug,
    descripcionCorta,
    descripcionDetallada{
      ...,
      _type == 'image' => {
        ...,
        asset->{
          _id,
          url
        }
      }
    },
    website,
    featured
  }[0]`

  return await client.fetch(query, { id })
}

export const fetchEmpresasBySlug = async (slug: string, locale: string) => {
  const query = `*[_type == "empresas" && slug.current == $slug]{
    _id,
    portada,
    sectorImg,
    sector,
    type,
    nombreEmpresa,
    tituloLargo,
    slug,
    descripcionCorta,
    descripcionDetallada{
      ...,
      _type == 'image' => {
        ...,
        asset->{
          _id,
          url
        }
      }
    },
    website,
    featured
  }[0]`

  return await client.fetch(query, { slug })
}

type EmpresaType = 'empresa' | 'marca' | 'proyecto' | 'extra';

export const fetchEmpresasByType = async (type: EmpresaType, locale: string) => {
  const query = `*[_type == "empresas" && type == $type]{
    portada,
    sectorImg,
    sector,
    type,
    nombreEmpresa,
    tituloLargo,
    slug,
    descripcionCorta,
    descripcionDetallada{
      ...,
      _type == 'image' => {
        ...,
        asset->{
          _id,
          url
        }
      }
    },
    website,
    featured
  }`

  return await client.fetch(query, { type })
}
