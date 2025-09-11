// Order creation helper
// POST /ordenes expects { carrito_token, direccion_envio:{...}, contacto:{...} }
// If user authenticated include Authorization Bearer. Guest allowed without.

const BASE_URL = process.env.NEXT_PUBLIC_ROMANA_API || 'https://romana-ebanisteria-api-production.up.railway.app/api/v1'

export interface ShippingAddress {
  calle: string
  ciudad: string
  provincia: string
  pais: string
  codigo_postal?: string
}

export interface ContactInfo {
  nombre: string
  apellido: string
  correo: string
  telefono: string
}

export interface CreateOrderPayload {
  carrito_token: string
  direccion_envio: ShippingAddress
  contacto: ContactInfo
}

export interface OrderItemDetail {
  id: string
  producto_id: string
  variacion_id: string
  producto_nombre: string
  variacion_nombre: string
  sku?: string
  captured_at?: string
  cantidad: number
  precio_unitario: string
  configuracion?: any
}

export interface OrderData {
  id: string
  estado: string
  monto_total: string
  calculated_subtotal: string
  direccion_envio: ShippingAddress
  contacto: ContactInfo
  reclamada: boolean
  order_number: number
  tracking_number: string
  items_count: number
  created_at: string
  detalles: OrderItemDetail[]
}

export interface CreateOrderResponse { data: OrderData }

// List Orders (paginated) response types
export interface OrdersListMeta {
  current_page: number
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
  pagination?: { current_page: number; per_page: number; total: number }
}

export interface OrdersListResponse {
  data: Omit<OrderData, 'detalles'>[]
  meta?: any
  links?: any
}

export async function createOrder(payload: CreateOrderPayload, authToken?: string | null) {
  // Try proxy first
  try {
    const r = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify(payload),
      redirect: 'manual'
    })
    const json = await r.json().catch(()=>({}))
    if (!r.ok) throw new Error(json?.message || json?.error || 'No se pudo crear la orden')
    return json as CreateOrderResponse
  } catch (err) {
    // Fallback direct
    const r = await fetch(`${BASE_URL}/ordenes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify(payload),
      redirect: 'manual'
    })
    const json = await r.json().catch(()=>({}))
    if (!r.ok) throw new Error(json?.message || json?.error || 'No se pudo crear la orden')
    return json as CreateOrderResponse
  }
}

export async function fetchOrders(authToken?: string | null, page: number = 1) : Promise<OrdersListResponse> {
  const qp = `?page=${page}`
  try {
    const r = await fetch(`/api/orders${qp}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      redirect: 'manual'
    })
    const json = await r.json().catch(()=>({}))
    if (!r.ok) throw new Error(json?.message || json?.error || 'No se pudieron obtener las órdenes')
    return json as OrdersListResponse
  } catch (err) {
    const r = await fetch(`${BASE_URL}/ordenes${qp}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      redirect: 'manual'
    })
    const json = await r.json().catch(()=>({}))
    if (!r.ok) throw new Error(json?.message || json?.error || 'No se pudieron obtener las órdenes')
    return json as OrdersListResponse
  }
}
