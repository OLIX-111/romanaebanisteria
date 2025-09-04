export interface CartItem {
  id: string;            // unique cart line id (variant based)
  productId: string;
  variantId: string;
  name: string;          // product + variant name
  price: number;         // unit price actually paid (sale aware)
  comparePrice?: number; // original price if on sale
  image?: string;
  quantity: number;
  max?: number;          // optional stock cap
}

export interface CartState {
  items: CartItem[];
  updatedAt: number;
}

export type CartAction =
  | { type: 'ADD'; item: Omit<CartItem, 'id'> }
  | { type: 'REMOVE'; lineId: string }
  | { type: 'UPDATE_QTY'; lineId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; state: CartState };

export function generateLineId(productId: string, variantId: string) {
  return `${productId}::${variantId}`;
}
