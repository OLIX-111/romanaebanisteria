import { mapProduct, type ProductSource, type MappedProductDetail } from '@/types/catalog';

// The incoming body is an array of ProductSource-like objects already matching ProductSource interface.
// We provide two helpers: normalizeDetail (single) and normalizeList (for listing cards).

export function normalizeProducts(body: any[]): MappedProductDetail[] {
  if (!Array.isArray(body)) return [];
  return body
    .filter(p => p && typeof p === 'object' && p.product_id && Array.isArray(p.variants))
    .map(p => mapProduct(p as ProductSource));
}

export interface ProductCardItem {
  id: string;
  name: string;
  image: string;
  price: number;
  comparePrice?: number;
  description: string;
  category: string;
  financeable: boolean; // at least one variant financeable
  variantCount: number;
}

export function toProductCards(details: MappedProductDetail[]): ProductCardItem[] {
  return details.map(p => {
    const cheapest = p.variants.reduce((best, v) => best && best.price <= v.price ? best : v, p.variants[0]);
    return {
      id: p.id,
      name: p.name,
      image: cheapest?.image || p.thumbnail || '/placeholder.svg',
      price: cheapest.price,
      comparePrice: cheapest.comparePrice,
      description: p.description,
      category: p.category,
      financeable: p.variants.some(v => v.isFinanceable),
      variantCount: p.variants.length,
    };
  });
}

export function findProduct(details: MappedProductDetail[], id: string) {
  return details.find(p => p.id === id) || null;
}
