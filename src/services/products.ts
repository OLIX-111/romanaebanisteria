// Servicio para obtener todos los productos desde la API externa
// (El usuario solicitó NO usar variables de entorno, token embebido aquí.)

export interface ApiProductRaw {
  id: number
  name: string
  image: string
  price: number
  description: string
  type: string
  vendor: string
  [k: string]: any
}

export interface Product {
  id: number
  name: string
  image: string
  price: number
  description: string
  type: string
  vendor: string
}

const API_URL = "https://chat.falitech.com/api/shop/products"
const API_TOKEN = "toY1MJxsmGUHQOAjXVx6vMp2TxiPrKpQDY70wX7W1GlVuZ8WNNPrtKJu53bt"

export async function fetchAllProducts(signal?: AbortSignal): Promise<Product[]> {
  const firstRes = await fetch(`${API_URL}?page=1`, {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
    },
    signal,
    cache: 'no-store', // aseguramos datos frescos
  })
  if (!firstRes.ok) throw new Error('Error al obtener productos (página 1)')
  const firstJson = await firstRes.json()
  const lastPage: number = firstJson?.meta?.last_page || 1
  let all: ApiProductRaw[] = firstJson?.data || []

  if (lastPage > 1) {
    const promises: Promise<ApiProductRaw[]>[] = []
    for (let p = 2; p <= lastPage; p++) {
      promises.push(
        fetch(`${API_URL}?page=${p}`, {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${API_TOKEN}`,
          },
          signal,
          cache: 'no-store',
        })
          .then(r => {
            if (!r.ok) throw new Error(`Error al obtener productos (página ${p})`)
            return r.json()
          })
          .then(j => j.data || [])
      )
    }
    const rest = await Promise.all(promises)
    all = all.concat(...rest)
  }

  return all.map(mapApiProduct)
}

export function mapApiProduct(item: ApiProductRaw): Product {
  return {
    id: item.id,
    name: item.name,
    image: item.image,
    price: item.price,
    description: item.description,
    type: item.type,
    vendor: item.vendor,
  }
}
