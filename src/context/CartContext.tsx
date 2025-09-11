"use client"
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { addItemToServerCart, fetchCart, getCartToken, setCartToken, updateCartItem, ServerCart, ServerCartItem } from '@/lib/cart'
import { useAuth } from './AuthContext'

interface CartContextValue {
  cart: ServerCart | null
  loading: boolean
  error: string | null
  addItem: (opts: { productId: string; variantId: string; quantity?: number }) => Promise<void>
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>
  refresh: () => Promise<void>
  count: number
  total: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token: authToken } = useAuth()
  const [cart, setCart] = useState<ServerCart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        const existingToken = getCartToken()
        if (existingToken) {
          const c = await fetchCart(existingToken, authToken)
          setCart(c)
        }
      } catch (e: any) {
        setError(e?.message || 'No se pudo cargar el carrito')
      } finally {
        setLoading(false)
      }
    })()
  }, [authToken])

  const refresh = useCallback(async () => {
    const tk = getCartToken()
    if (!tk) return
    try {
      const c = await fetchCart(tk, authToken)
      setCart(c)
    } catch (e: any) {
      setError(e?.message || 'No se pudo refrescar el carrito')
    }
  }, [authToken])

  const addItem = useCallback(async ({ productId, variantId, quantity = 1 }: { productId: string; variantId: string; quantity?: number }) => {
    setError(null)
    const resp = await addItemToServerCart({ productId, variantId, quantity, authToken })
    // After adding we must fetch the full cart (need line details)
    await refresh()
  }, [authToken, refresh])

  const updateQuantity = useCallback(async (lineItemId: string, quantity: number) => {
    setError(null)
    await updateCartItem({ lineItemId, quantity, authToken })
    await refresh()
  }, [authToken, refresh])

  const value: CartContextValue = {
    cart,
    loading,
    error,
    addItem,
    updateQuantity,
    refresh,
    count: cart?.items?.reduce((a, i) => a + i.cantidad, 0) || 0,
    total: cart?.total || 0,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useServerCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useServerCart must be used within CartProvider')
  return ctx
}
