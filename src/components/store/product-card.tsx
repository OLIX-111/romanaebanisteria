import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProductCardProps {
  id: string | number;
  name: string;
  image: string;
  price: number;
  description: string;
  type: string;
  vendor: string;
  currency?: string;
  onQuickView?: (id: string | number) => void;
  compare_price?: number;
  display_variant_id?: string | number;
  display_variant_name?: string;
  variants?: {
    id: string | number;
    name: string;
    price: number;
    sale_price?: number | null;
    is_on_sale?: boolean;
    image?: string;
  }[];
}

export function ProductCard({
  id,
  name,
  image,
  price,
  description,
  type,
  vendor,
  currency = "DOP",
  onQuickView,
  compare_price,
  display_variant_name,
  variants = [],
}: ProductCardProps) {
  const priceFormatted = new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency,
  }).format(price);
  const compareFormatted =
    typeof compare_price === "number" && compare_price > price
      ? new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(
          compare_price
        )
      : null;
  const gallery = [
    image,
    ...variants.map((v) => v.image).filter(Boolean),
  ] as string[];
  const uniqueGallery = Array.from(new Set(gallery)).filter(Boolean);
  const preview = uniqueGallery[0] || image;
  return (
    <Link
      href={`/store/${id}`}
      className="group relative flex flex-col border border-gray-200 bg-white transition"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <div className="absolute inset-0" aria-label={name} />
        <Image
          src={preview || "/placeholder.svg"}
          alt={name}
          width={900}
          height={900}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <span className="bg-white/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-700 backdrop-blur">
            {type}
          </span>
          {display_variant_name && (
            <span className="bg-white/80 px-2 py-0.5 text-[11px] font-medium tracking-wide text-gray-700 backdrop-blur">
              {display_variant_name}
            </span>
          )}
        </div>
        {onQuickView && (
          <button
            onClick={() => onQuickView(id)}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 transform bg-white/90 px-4 py-1.5 text-xs font-medium text-gray-800 opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-white border border-gray-200"
          >
            Vista rápida
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {variants.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {variants.slice(0, 6).map((v) => (
              <span
                key={String(v.id)}
                className="inline-flex items-center gap-2 rounded border border-gray-200 bg-white px-1.5 py-1 text-[11px] text-gray-700 hover:border-gray-300"
                onMouseEnter={(e) => {
                  const imgEl = (
                    e.currentTarget.closest(".group") as HTMLElement
                  )?.querySelector("img") as HTMLImageElement | null;
                  if (imgEl && v.image) {
                    imgEl.src = v.image;
                  }
                }}
                onMouseLeave={(e) => {
                  const imgEl = (
                    e.currentTarget.closest(".group") as HTMLElement
                  )?.querySelector("img") as HTMLImageElement | null;
                  if (imgEl && preview) {
                    imgEl.src = preview;
                  }
                }}
                title={v.name}
              >
                <Image
                  src={(v.image as string) || "/placeholder.svg"}
                  alt={v.name}
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded object-cover"
                />
                <span className="line-clamp-1 max-w-28" title={v.name}>
                  {v.name}
                </span>
              </span>
            ))}
            {variants.length > 6 && (
              <span className="text-[11px] text-gray-500">
                +{variants.length - 6}
              </span>
            )}
            <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
              <div className="focus:outline-none focus:ring-2 focus:ring-primary/50">
                {name}
              </div>
            </h3>
          </div>
        )}
        <p className="mt-1 line-clamp-2 text-xs text-gray-500 min-h-[34px]">
          {description}
        </p>
        <div className="mt-3 flex items-end justify-between gap-2">
          <span className="text-base font-semibold text-gray-900 tabular-nums">
            {priceFormatted}
          </span>
          {compareFormatted && (
            <span className="text-xs text-gray-500 line-through">
              {compareFormatted}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
