"use client";
// Backwards-compatible wrapper around server CartContext
import { useServerCart } from '@/context/CartContext'

export function useCart() {
  const { cart, addItem, updateQuantity, refresh, count, total } = useServerCart()
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
    removeItem: async (_lineId: string) => {
      // TODO: Implement DELETE /carrito/items/{id}?token= if backend provides it.
      console.warn('removeItem no implementado: falta endpoint DELETE en API')
    },
    updateQty: (lineId: string, quantity: number) => updateQuantity(lineId, quantity),
    clear: async () => {
      // TODO: Implement bulk clear if /carrito/clear or iterate over items with DELETE endpoint.
      console.warn('clear no implementado: falta endpoint para limpiar carrito')
    },
    count,
    subtotal: total,
    compareTotal: total,
    savings: 0,
    refresh,
  }
}
