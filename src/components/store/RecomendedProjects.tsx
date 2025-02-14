import { ProductCard } from "./product-card"

interface Product {
  id: number
  name: string
  image: string
  price: number
  description: string
  type: string
  vendor: string
}

interface RecommendedProductsProps {
  products: Product[]
}

export function RecommendedProducts({ products }: RecommendedProductsProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-8">Productos recomendados</h2>
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  )
}

