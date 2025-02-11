import { ProductCard } from "./product-card"

interface RecommendedProductsProps {
  products: any[] // Reemplaza 'any' con el tipo correcto de tu producto
}

export function RecommendedProducts({ products }: RecommendedProductsProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-8">Productos recomendados</h2>
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {products.map((product) => (
          <ProductCard key={product._id} {...product} />
        ))}
      </div>
    </div>
  )
}

