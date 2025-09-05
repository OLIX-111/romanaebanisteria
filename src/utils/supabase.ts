
import { createClient } from "@supabase/supabase-js";
import { mapProduct, type ProductSource } from '@/types/catalog';

const supabaseUrl: any = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey: any = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch products via RPC and normalize to the store UI shape
export async function getAllProductsWithDetails() {
  const { data, error } = await supabase.rpc("get_all_products_with_details");
  if (error) throw error;

  const payload: any = data;
  const productsArray: any[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.products)
      ? payload.products
      : Array.isArray(payload?.data?.products)
        ? payload.data.products
        : [];

  return productsArray.map((item: any) => {
    const variants: any[] = Array.isArray(item?.variants) ? item.variants : []
    const pickVariantPrice = (v: any) => (v?.is_on_sale && typeof v?.sale_price === "number") ? v.sale_price : (typeof v?.price === "number" ? v.price : 0)
    const minPrice = variants.length > 0 ? Math.min(...variants.map(pickVariantPrice)) : 0
    const totalQty = variants.reduce((acc, v) => acc + (Number(v?.stock) || 0), 0)
    const cheapestVariant = variants.reduce((best: any | null, v: any) => {
      const price = pickVariantPrice(v)
      if (!best) return { v, price }
      return price < best.price ? { v, price } : best
    }, null as any)
    const firstVariantImage = cheapestVariant?.v?.variant_images?.[0]?.image_url || variants?.[0]?.variant_images?.[0]?.image_url
    const image = item?.main_image?.image_url || firstVariantImage || "/placeholder.svg"

    return {
      id: item.product_id,
      code: item.code,
      name: item.name,
      image,
      price: minPrice,
      compare_price: (cheapestVariant?.v?.is_on_sale && typeof cheapestVariant?.v?.price === "number") ? cheapestVariant.v.price : 0,
      display_variant_id: cheapestVariant?.v?.variant_id || variants?.[0]?.variant_id || item.product_id,
      display_variant_name: cheapestVariant?.v?.variant_name || variants?.[0]?.variant_name || "",
      variants: variants.map(v => ({
        id: v.variant_id,
        name: v.variant_name,
        price: pickVariantPrice(v),
        sale_price: typeof v?.sale_price === 'number' ? v.sale_price : null,
        is_on_sale: !!v?.is_on_sale,
        image: v?.variant_images?.[0]?.image_url || image,
      })),
      description: item.description || "",
      type: item.category || "",
      vendor: "Romana Ebanistería",
      track_stock: variants.length > 0,
      total_qty: totalQty,
      use_variant: variants.length > 1,
    }
  })
}

export async function getProductWithDetailsById(id: string) {
  const { data, error } = await supabase.rpc('get_product_details_by_id', { product_id: id });
  if (error) throw error;
  if (!data) return null;
  // Data already matches ProductSource shape for mapProduct
  try {
    return mapProduct(data as ProductSource);
  } catch (e) {
    console.error('Map product error', e);
    return null;
  }
}

// Hay que hacer que se envien los datos faltantes
export async function AddProductsToCart(
  userId: string,
  productId: string,
  quantity: number
) {
  const { data, error } = await supabase.rpc('add_product_to_cart', {
    p_id_usuario: userId,
    p_id_producto: productId,
    p_cantidad: quantity
  });
}


export async function getProductDetailMapped(id: string) {
  return getProductWithDetailsById(id);
}