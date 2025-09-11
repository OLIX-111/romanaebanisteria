export interface ApiProductVariant {
  variant_id: string;
  variant_name: string;
  price: number;
  stock: number;
  is_on_sale: boolean;
  sale_price: number | null;
  is_available: boolean;
  is_financeable: boolean;
  variant_main_images: any[];
  secondary_images: { image_url: string }[];
}

export interface ApiProduct {
  product_id: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  main_image?: { image_url: string } | null;
  variants: ApiProductVariant[];
}

export interface MappedVariant {
  id: string;
  name: string;
  price: number;
  sale_price?: number | null;
  is_on_sale?: boolean;
  image?: string;
}

export interface MappedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  type: string; // category
  vendor: string; // brand
  compare_price?: number;
  display_variant_id?: string;
  display_variant_name?: string;
  variants?: MappedVariant[];
}

export interface ProductSourceDetail extends ApiProduct {}

const BASE_URL = process.env.NEXT_PUBLIC_ROMANA_API || 'https://romana-ebanisteria-api-production.up.railway.app/api/v1'

export async function fetchProducts(): Promise<MappedProduct[]> {
  const res = await fetch(`${BASE_URL}/productos`, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error('Error al obtener productos')
  const json = await res.json()
  const data: ApiProduct[] = json.data || []
  return data.map(mapApiProduct)
}

function mapApiProduct(p: ApiProduct): MappedProduct {
  const firstVariant = p.variants?.[0]
  const variants: MappedVariant[] = (p.variants || []).map(v => ({
    id: v.variant_id,
    name: v.variant_name,
    price: v.price,
    sale_price: v.sale_price,
    is_on_sale: v.is_on_sale,
    image: v.secondary_images?.[0]?.image_url || p.main_image?.image_url || ''
  }))
  return {
    id: p.product_id,
    name: p.name,
    image: p.main_image?.image_url || variants[0]?.image || '/placeholder.svg',
    price: (firstVariant?.price) ?? 0,
    description: p.description || '',
    type: p.category || '',
    vendor: p.brand || '',
    compare_price: firstVariant?.is_on_sale && firstVariant.sale_price !== null && firstVariant.sale_price < firstVariant.price ? firstVariant.price : undefined,
    display_variant_id: firstVariant?.variant_id,
    display_variant_name: firstVariant?.variant_name,
    variants
  }
}

export async function fetchProductById(id: string) {
  const res = await fetch(`${BASE_URL}/productos/${id}`)
  if (!res.ok) throw new Error('Producto no encontrado')
  const json = await res.json()
  const raw = json.data as ProductSourceDetail
  // Map using similar logic as catalog.ts mapProduct but inline to avoid circular import
  const variants = (raw.variants || []).map(v => {
    const secondary = (v.secondary_images || []).map(img => img?.image_url).filter((u): u is string => Boolean(u))
    const fallback = raw.main_image?.image_url || ''
    const gallery = secondary.length > 0 ? secondary : (fallback ? [fallback] : [])
    const price = v.is_on_sale && typeof v.sale_price === 'number' && v.sale_price !== null ? v.sale_price : v.price
    const variantImage = v.secondary_images?.[0]?.image_url || raw.main_image?.image_url || ''
    const mapped = {
      id: v.variant_id,
      name: v.variant_name,
      price,
      image: variantImage,
      gallery,
      stock: v.stock,
      onSale: v.is_on_sale,
      salePrice: v.sale_price,
      isFinanceable: v.is_financeable as boolean,
    } as any
    if (v.is_on_sale) mapped.comparePrice = v.price
    return mapped
  })
  const minPrice = variants.length > 0 ? Math.min(...variants.map(v => v.price)) : 0
  return {
    id: raw.product_id,
    name: raw.name,
    description: raw.description,
    category: raw.category,
    thumbnail: raw.main_image?.image_url || '',
    variants,
    minPrice
  }
}
