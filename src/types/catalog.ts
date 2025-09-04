export interface ImageAsset {
  id: string;
  alt_text: string | null;
  image_url: string;
  created_at?: string;
  product_id?: string;
  variant_id?: string | null;
  is_thumbnail?: boolean;
}

export interface VariantSource {
  price: number;
  stock: number;
  is_on_sale: boolean;
  sale_price: number | null;
  variant_id: string;
  is_available: boolean;
  variant_name: string;
  is_financeable: boolean;
  variant_main_images: ImageAsset[];
  secondary_images: ImageAsset[];
}

export interface ProductSource {
  product_id: string;
  name: string;
  description: string;
  category: string;
  main_image: ImageAsset;
  variants: VariantSource[];
}

export interface MappedVariant {
  id: string;
  name: string;
  price: number;
  // solo presente si hay oferta
  comparePrice?: number;
  image: string;
  gallery: string[];
  stock: number;
  onSale: boolean;
  salePrice?: number | null;
  isFinanceable: boolean;
}

export interface MappedProductDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  variants: MappedVariant[];
  minPrice: number;
}

export function mapProduct(raw: ProductSource): MappedProductDetail {
  const variants = raw.variants.map(v => {
    // Tomar exactamente todas las secondary_images (permite duplicados si vienen así).
    const secondary = (v.secondary_images || [])
      .map(img => img?.image_url)
      .filter((u): u is string => Boolean(u));
    // Fallback a main/variant si no hay ninguna secondary.
    const fallback = v.variant_main_images?.[0]?.image_url || raw.main_image?.image_url || '';
    const gallery = secondary.length > 0 ? secondary : (fallback ? [fallback] : []);

    const price = v.is_on_sale && typeof v.sale_price === 'number' && v.sale_price !== null
      ? v.sale_price
      : v.price;

    const mainImage = v.variant_main_images?.[0]?.image_url || raw.main_image?.image_url || fallback;
    const variant: MappedVariant = {
      id: v.variant_id,
      name: v.variant_name,
      price,
      image: mainImage, // siempre la imagen principal de la variante
      gallery,          // solo secondary_images
      stock: v.stock,
      onSale: v.is_on_sale,
      salePrice: v.sale_price,
      isFinanceable: v.is_financeable
    };
    if (v.is_on_sale) {
      variant.comparePrice = v.price;
    }
    return variant;
  });

  const minPrice = Math.min(...variants.map(v => v.price));
  return {
    id: raw.product_id,
    name: raw.name,
    description: raw.description,
    category: raw.category,
    thumbnail: raw.main_image?.image_url,
    variants,
    minPrice
  };
}
