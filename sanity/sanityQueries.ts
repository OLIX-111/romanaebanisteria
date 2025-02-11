import { createClient } from "next-sanity"

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-02-10",
  useCdn: true,
})

export async function getProducts() {
  return client.fetch(`
    *[_type == "product"] {
      _id,
      name,
      slug,
      price,
      "categoryName": category->title,
      "materialName": material->title,
      "finishName": finish->title,
      availability,
      deliveryTime,
      "imageUrl": image.asset->url,
      customizable
    }
  `)
}

export async function getServices() {
  return client.fetch(`
    *[_type == "service"] {
      _id,
      name,
      slug,
      price,
      description,
      shortdescription,
      "categoryName": category->title,
      duration,
      availability,
      "imageUrl": image.asset->url
    }
  `)
}

export async function getCategories() {
  return client.fetch(`*[_type == "category"] { _id, title }`)
}

export async function getMaterials() {
  return client.fetch(`*[_type == "material"] { _id, title }`)
}

export async function getFinishes() {
  return client.fetch(`*[_type == "finish"] { _id, title }`)
}

export async function getProductBySlug(slug: string) {
  return client.fetch(
    `
    *[_type == "product" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      price,
      "categoryName": category->title,
      "materialName": material->title,
      "finishName": finish->title,
      availability,
      deliveryTime,
      "imageUrl": image.asset->url,
      customizable,
      description,
      color,
      dimensions {
        width,
        height,
        depth
      }
    }
  `,
    { slug },
  )
}

export async function getProductBySlugWithRecommendations(slug: string) {
  return client.fetch(
    `
    {
      "product": *[_type == "product" && slug.current == $slug][0] {
        _id,
        name,
        slug,
        price,
        "categoryName": category->title,
        "materialName": material->title,
        "finishName": finish->title,
        availability,
        deliveryTime,
        "image": image.asset->url,
        "gallery": gallery[].asset->url,
        customizable,
        description,
        dimensions {
          width,
          height,
          depth
        }
      },
      "recommendations": *[_type == "product" && slug.current != $slug && category._ref == ^.category._ref][0...4] {
        _id,
        name,
        slug,
        price,
        "categoryName": category->title,
        "materialName": material->title,
        "finishName": finish->title,
        availability,
        deliveryTime,
        "image": image.asset->url,
        customizable
      }
    }
  `,
    { slug },
  )
}

export async function getFeaturedProducts() {
  return client.fetch(`
    *[_type == "product"][0...6] {
      _id,
      name,
      "slug": slug.current,
      price,
      "imageUrl": image.asset->url,
      description,
      "categoryName": category->title
    }
  `)
}



export async function getServiceBySlug(slug: string) {
  return client.fetch(
    `
    *[_type == "service" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug.current,
      price,
      "categoryName": category->title,
      duration,
      availability,
      "imageUrl": image.asset->url,
      "gallery": gallery[].asset->url,
      description
    }
  `,
    { slug },
  )
}

