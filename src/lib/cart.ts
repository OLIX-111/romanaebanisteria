// Server cart integration helpers
// Assumptions: POST /carrito/items body accepts { producto_id, variacion_id, cantidad }
// If user authenticated include Authorization Bearer token.
// Response returns carrito_token we persist for guests & logged users.

const BASE_URL = process.env.NEXT_PUBLIC_ROMANA_API || 'https://romana-ebanisteria-api-production.up.railway.app/api/v1'
const CART_TOKEN_KEY = 'La Fabbrica_cart_token'

export interface AddCartItemResponseData {
  id: string
  carrito_token: string
  cantidad: number
  merged?: boolean
  message?: string
}

export interface AddCartItemResponse { data: AddCartItemResponseData }

export function getCartToken(): string | null {
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem(CART_TOKEN_KEY) } catch { return null }
}

export function setCartToken(token: string) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(CART_TOKEN_KEY, token) } catch {}
}

let creatingCart = false
export async function addItemToServerCart(params: { productId: string; variantId: string; quantity?: number; authToken?: string | null }) {
  const { productId, variantId, quantity = 1, authToken } = params
  const body: Record<string, any> = { id_producto: productId, id_variacion: variantId, cantidad: quantity }
  // Determine endpoint: first time (no token) -> POST /carrito/items (creates cart)
  // Subsequent (guest) -> POST /carrito/items?token=XYZ ; authenticated can also keep token but backend should accept both.
  const existingToken = getCartToken()
  const qs = existingToken ? `?token=${encodeURIComponent(existingToken)}` : ''
  // Simple guard to avoid parallel double-creation
  while (!existingToken && creatingCart) {
    await new Promise(r => setTimeout(r, 80))
  }
  if (!existingToken) creatingCart = true
  const attempt = async (direct: boolean) => {
    const base = direct ? BASE_URL : ''
    const url = direct ? `${base}/carrito/items${qs}` : `/api/cart/items${qs}`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify(body),
      credentials: direct ? 'omit' : 'include',
      redirect: 'manual'
    })
    if ([301,302].includes(res.status)) console.warn('addItem redirect', res.status, res.headers.get('Location'))
    const json = await res.json().catch(()=>({}))
    if (!res.ok) throw new Error(json?.message || json?.error || 'No se pudo agregar al carrito')
    const data = json as AddCartItemResponse
    if (data?.data?.carrito_token) setCartToken(data.data.carrito_token)
    return data.data
  }
  try {
    return await attempt(false)
  } catch (err) {
    // Fallback direct
    try {
      return await attempt(true)
    } finally {
      creatingCart = false
    }
  } finally {
    creatingCart = false
  }
}

// Fetch full cart (if token stored)
export async function fetchCart(cartToken?: string | null, authToken?: string | null) {
  const token = cartToken || getCartToken()
  if (!token) return null
  try {
    const res = await fetch(`/api/cart/items?token=${encodeURIComponent(token)}`, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      credentials: 'include',
      redirect: 'manual'
    })
    if (res.status === 301 || res.status === 302) {
      console.warn('Client fetchCart redirect', res.status, res.headers.get('Location'))
    }
    const json = await res.json().catch(()=>({}))
    if (!res.ok) throw new Error(json?.message || json?.error || 'No se pudo cargar el carrito')
    return json.data
  } catch (err) {
    // fallback external API
    const url = `${BASE_URL}/carrito?token=${encodeURIComponent(token)}`
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      redirect: 'manual'
    })
    if (res.status === 301 || res.status === 302) {
      console.warn('External fetchCart redirect', res.status, res.headers.get('Location'))
    }
    const json = await res.json().catch(()=>({}))
    if (!res.ok) throw new Error(json?.message || json?.error || 'No se pudo cargar el carrito')
    return json.data
  }
}

// Update quantity of existing line item
export async function updateCartItem(params: { lineItemId: string; quantity: number; cartToken?: string | null; authToken?: string | null }) {
  const { lineItemId, quantity, cartToken, authToken } = params
  const token = cartToken || getCartToken()
  if (!token) throw new Error('NO_CART_TOKEN')
  try {
    const res = await fetch(`/api/cart/items/${lineItemId}?token=${encodeURIComponent(token)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({ cantidad: quantity }),
      credentials: 'include',
      redirect: 'manual'
    })
    if (res.status === 301 || res.status === 302) {
      console.warn('Client updateCart redirect', res.status, res.headers.get('Location'))
    }
    const json = await res.json().catch(()=>({}))
    if (!res.ok) throw new Error(json?.message || json?.error || 'No se pudo actualizar el carrito')
    return json.data as { id: string; cantidad: number }
  } catch (err) {
    const res = await fetch(`${BASE_URL}/carrito/items/${lineItemId}?token=${encodeURIComponent(token)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({ cantidad: quantity }),
      redirect: 'manual'
    })
    if (res.status === 301 || res.status === 302) {
      console.warn('External updateCart redirect', res.status, res.headers.get('Location'))
    }
    const json = await res.json().catch(()=>({}))
    if (!res.ok) throw new Error(json?.message || json?.error || 'No se pudo actualizar el carrito')
    return json.data as { id: string; cantidad: number }
  }
}

export interface ServerCartItem {
  id: string
  producto_id: string
  producto_nombre: string
  variacion_id: string
  variacion_nombre: string
  cantidad: number
  unit_price: number
  subtotal: number
  imagen?: { id: string; url: string; alt?: string; is_variant?: boolean }
}

export interface ServerCart {
  id: string
  token: string
  items: ServerCartItem[]
  total: number
}

// Clear entire cart via API endpoint /carrito/clear?token=
export async function clearServerCart(cartToken?: string | null, authToken?: string | null) {
  const token = cartToken || getCartToken()
  if (!token) return
  try {
    const res = await fetch(`/api/cart/clear?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      redirect: 'manual'
    })
    if (res.status === 301 || res.status === 302) {
      console.warn('Client clearCart redirect', res.status, res.headers.get('Location'))
    }
    if (!res.ok) {
      const j = await res.json().catch(()=>({}))
      throw new Error(j?.message || j?.error || 'No se pudo limpiar el carrito')
    }
  } catch(err){
    const res = await fetch(`${BASE_URL}/carrito/clear?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      redirect: 'manual'
    })
    if (res.status === 301 || res.status === 302) {
      console.warn('External clearCart redirect', res.status, res.headers.get('Location'))
    }
    if (!res.ok) {
      const j = await res.json().catch(()=>({}))
      throw new Error(j?.message || j?.error || 'No se pudo limpiar el carrito')
    }
  }
}
