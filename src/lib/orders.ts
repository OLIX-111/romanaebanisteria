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

export interface OrderTrackingEvent {
  id?: string
  estado?: string
  comentario?: string
  created_at?: string
}

export interface OrderDetailResponse { data: OrderData & { seguimientos?: OrderTrackingEvent[] } }

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
    const r = await fetch(`${BASE_URL}/ordenes?include_detalles=true`, {
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

export async function fetchOrderAdmin(page: number = 1) : Promise<OrdersListResponse> {
  const qp = `?page=${page}`
  try {
    const r = await fetch(`/crm/ordenes${qp}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer 5|7yud9D0naVbdhuHOtTHRo6zM9AZAZAgER8AsVy3n17ded992`
      },
      redirect: 'manual'
    })
    const json = await r.json().catch(()=>({}))
    if (!r.ok) throw new Error(json?.message || json?.error || 'No se pudieron obtener las órdenes')
    return json as OrdersListResponse
  } catch (err) {
    const r = await fetch(`${BASE_URL}/crm/ordenes${qp}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer 5|7yud9D0naVbdhuHOtTHRo6zM9AZAZAgER8AsVy3n17ded992`
      },
      redirect: 'manual'
    })
    const json = await r.json().catch(()=>({}))
    if (!r.ok) throw new Error(json?.message || json?.error || 'No se pudieron obtener las órdenes')
    return json as OrdersListResponse
  }
}

export async function fetchOrderByTracking(tracking: string, authToken?: string | null, include: string = 'detalles,seguimientos'): Promise<OrderDetailResponse> {
  const qp = `?include=${encodeURIComponent(include)}`
  try {
    const r = await fetch(`/api/orders/track/${tracking}${qp}`, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      redirect: 'manual'
    })
    const json = await r.json().catch(()=>({}))
    if (!r.ok) throw new Error(json?.message || json?.error || 'No se pudo cargar la orden')
    return json as OrderDetailResponse
  } catch (err) {
    const r = await fetch(`${BASE_URL}/ordenes/track/${tracking}${qp}`, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      redirect: 'manual'
    })
    const json = await r.json().catch(()=>({}))
    if (!r.ok) throw new Error(json?.message || json?.error || 'No se pudo cargar la orden')
    return json as OrderDetailResponse
  }
}

// Admin: fetch single order by ID (includes detalles by default)
export async function fetchAdminOrderById(id: string, include: string = 'detalles'): Promise<OrderDetailResponse> {
  const qp = include ? `?include=${encodeURIComponent(include)}` : ''
  const headers: Record<string,string> = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Authorization': `Bearer 5|7yud9D0naVbdhuHOtTHRo6zM9AZAZAgER8AsVy3n17ded992`
  }
  const url = `${BASE_URL}/crm/ordenes/${id}${qp}`
  const r = await fetch(url, { method: 'GET', headers, redirect: 'manual' })
  const json = await r.json().catch(()=>({}))
  if(!r.ok) throw new Error((json as any)?.message || (json as any)?.error || 'No se pudo cargar la orden')
  // API sometimes returns the object directly (not wrapped). If it already has data, trust it.
  if((json as any)?.data) {
    return json as OrderDetailResponse
  }
  return { data: json as any } as OrderDetailResponse
}

// Admin: update order status
export interface AdminUpdateOrderStatusPayload { estado: string; nota?: string }
export interface AdminUpdateOrderStatusResponse {
  message?: string
  data?: {
    id: string
    order_number?: string
    estado_anterior?: string
    estado_nuevo?: string
    nota?: string
    fecha_cambio?: string
  }
}

export async function updateAdminOrderStatus(id: string, payload: AdminUpdateOrderStatusPayload): Promise<AdminUpdateOrderStatusResponse> {
  const path = `/crm/ordenes/${id}/estado`
  const headers: Record<string,string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Authorization': `Bearer 5|7yud9D0naVbdhuHOtTHRo6zM9AZAZAgER8AsVy3n17ded992`
  }
  // Try proxy first
  try {
    const r = await fetch(path, { method: 'PUT', headers, body: JSON.stringify(payload), redirect: 'manual' })
    const json = await r.json().catch(()=>({}))
    if (!r.ok) throw new Error(json?.message || json?.error || 'No se pudo actualizar el estado')
    return json as AdminUpdateOrderStatusResponse
  } catch (err) {
    const url = `${BASE_URL}${path}`
    const r = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(payload), redirect: 'manual' })
    const json = await r.json().catch(()=>({}))
    if (!r.ok) throw new Error(json?.message || json?.error || 'No se pudo actualizar el estado')
    return json as AdminUpdateOrderStatusResponse
  }
}
