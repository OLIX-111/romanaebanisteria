import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"

interface ProductCardProps {
  id: number
  name: string
  image: string
  price: number
  description: string
  type: string
  vendor: string
  currency?: string
  onQuickView?: (id: number) => void
}

export function ProductCard({ id, name, image, price, description, type, vendor, currency = "DOP", onQuickView }: ProductCardProps) {
  const priceFormatted = new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(price)
  return (
    <div className="group relative flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md focus-within:shadow-md">
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-50">
        <Link href={`/store/${id}`} className="absolute inset-0" aria-label={name} />
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          width={900}
          height={900}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <span className="rounded bg-white/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-700 backdrop-blur">{type}</span>
        </div>
        {onQuickView && (
          <button
            onClick={() => onQuickView(id)}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 transform rounded-full bg-white/90 px-4 py-1.5 text-xs font-medium text-gray-800 opacity-0 shadow backdrop-blur transition group-hover:opacity-100 hover:bg-white"
          >
            Vista rápida
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[40px] text-sm font-medium text-gray-900">
          <Link href={`/store/${id}`} className="focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded">
            {name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-gray-500 min-h-[34px]">{description}</p>
        <div className="mt-3 flex items-end justify-between gap-2">
          <span className="text-base font-semibold text-gray-900 tabular-nums">{priceFormatted}</span>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">{vendor}</span>
        </div>
      </div>
    </div>
  )
}

