"use client";
// Backwards-compatible wrapper around server CartContext
import { useServerCart } from '@/context/CartContext'

export function useCart() {
  const { cart, addItem, updateQuantity, refresh, count, total, loading, clearCart, clearing } = useServerCart()
  return {
    items: (cart?.items || []).map(i => ({
      id: i.id,
      productId: i.producto_id,
      variantId: i.variacion_id,
      name: i.producto_nombre + (i.variacion_nombre ? ` - ${i.variacion_nombre}` : ''),
      price: i.unit_price,
      quantity: i.cantidad,
      image: i.imagen?.url,
    })),
    updatedAt: Date.now(),
    addItem: (item: { productId: string; variantId: string; name?: string; price?: number; quantity?: number }) => addItem({ productId: item.productId, variantId: item.variantId, quantity: item.quantity || 1 }),
  removeItem: async () => { console.warn('Eliminar individual deshabilitado') },
  updateQty: () => { console.warn('Ajuste de cantidad deshabilitado') },
  clear: () => clearCart(),
    count,
    subtotal: total,
    compareTotal: total,
    savings: 0,
    refresh,
  loading,
  clearing,
  }
}
