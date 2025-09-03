
import { createClient } from "@supabase/supabase-js";

const supabaseUrl: any = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey: any = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch products via RPC and normalize to the store UI shape
export async function getAllProductsWithDetails() {
  const { data, error } = await supabase.rpc("get_all_products_with_details_2");
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
  // Fetch all and find the product in the new array structure
  const { data, error } = await supabase.rpc("get_all_products_with_details_2");
  if (error) throw error;
  const payload: any = data;
  const productsArray: any[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.products)
      ? payload.products
      : Array.isArray(payload?.data?.products)
        ? payload.data.products
        : [];

  const item = productsArray.find((p: any) => String(p?.product_id) === String(id))
  if (!item) return null

  const variants: any[] = Array.isArray(item?.variants) ? item.variants : []
  const pickVariantPrice = (v: any) => (v?.is_on_sale && typeof v?.sale_price === "number") ? v.sale_price : (typeof v?.price === "number" ? v.price : 0)
  const minPrice = variants.length > 0 ? Math.min(...variants.map(pickVariantPrice)) : 0
  const totalQty = variants.reduce((acc, v) => acc + (Number(v?.stock) || 0), 0)
  const firstVariantImage = variants?.[0]?.variant_images?.[0]?.image_url
  const image = item?.main_image?.image_url || firstVariantImage || "/placeholder.svg"

  const mappedVariants = variants.length > 0
    ? variants.map((v: any) => ({
        id: v.variant_id,
        variant_id: v.variant_id,
        product_id: item.product_id,
        name: v.variant_name,
        desc: "",
        image: v?.variant_images?.[0]?.image_url || image,
        price: pickVariantPrice(v),
        compare_price: (v?.is_on_sale && typeof v?.price === "number") ? v.price : 0,
        currency: "DOP",
        sku: "",
        barcode: "",
        sku_desc: "",
        option_1: "",
        option_2: "",
        option_1_value: "",
        option_2_value: "",
      }))
    : [{
        id: item.product_id,
        variant_id: item.product_id,
        product_id: item.product_id,
        name: item.name,
        desc: "",
        image,
        price: minPrice,
        compare_price: 0,
        currency: "DOP",
        sku: "",
        barcode: "",
        sku_desc: "",
        option_1: "",
        option_2: "",
        option_1_value: "",
        option_2_value: "",
      }]

  return {
    id: item.product_id,
    name: item.name,
    image,
    status: "",
    price: minPrice,
    description: item.description || "",
    use_variant: mappedVariants.length > 1,
    total_qty: totalQty,
    num_of_variants: mappedVariants.length,
    track_stock: mappedVariants.length > 0,
    product_type_id: "",
    vendor_id: "",
    type: item.category || "",
    vendor: "Romana Ebanistería",
    sku: "",
    variants: mappedVariants,
  }
}