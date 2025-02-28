interface Product {
  id: number
  name: string
  image: string
  status: string
  price: number
  description: string
  use_variant: boolean
  total_qty: number
  num_of_variants: number
  track_stock: boolean
  product_type_id: number
  vendor_id: number
  type: string
  vendor: string
  variants: Variant[]
}

interface Variant {
  id: number
  variant_id: number
  product_id: number
  name: string
  desc: string
  image: string
  price: number
  compare_price: number
  currency: string
  sku: string
  barcode: string
  sku_desc: string
  option_1: string
  option_2: string
  option_1_value: string
  option_2_value: string
}

interface ProductsResponse {
  data: Product[]
  total: number
  current_page: number
  per_page: number
  last_page: number
}

interface ProductDetailResponse {
  data: Product
  status: string
}

export async function getProducts(limit = 20, page = 1): Promise<ProductsResponse> {
  const response = await fetch(`/api/products?limit=${limit}&page=${page}`)

  if (!response.ok) {
    throw new Error("Failed to fetch products")
  }

  return response.json()
}

export async function getProductsTableros(){
  const response = await fetch(`/api/products/tableros`)

  if (!response.ok) {
    throw new Error("Failed to fetch products")
  }

  return response.json()
}

export async function getProductById(id: number): Promise<ProductDetailResponse> {
  const response = await fetch(`/api/products/${id}`)

  if (!response.ok) {
    throw new Error("Failed to fetch product details")
  }

  return response.json()
}

