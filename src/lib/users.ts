const BASE_URL = process.env.NEXT_PUBLIC_ROMANA_API || 'https://romana-ebanisteria-api-production.up.railway.app/api/v1'

export interface AdminUserOrderSummary {
  id_orden: string
  numero_orden: number
  tracking_number: string
  estado: string
  monto_total: number
  fecha_orden: string
  fecha_orden_raw: string
  direccion_envio?: {
    pais: string
    calle: string
    ciudad: string
    provincia: string
    codigo_postal: string
  } | null
  contacto_json?: {
    correo: string
    nombre: string
    apellido: string
    telefono: string
  } | null
  reclamada: boolean
  updated_at: string
}

export interface AdminUserDetailResponse {
  data: {
    usuario: {
      id: string
      nombre: string
      email: string
      telefono: string | null
      numero_codia: string | null
      origen_usuario: string | null
      is_guest: boolean
      fecha_creacion: string
      fecha_creacion_raw: string
      tipo_usuario: string
      metadata: any
      estadisticas?: {
        total_ordenes: number
        total_gastado: number
        orden_mas_reciente: string | null
        orden_mas_antigua: string | null
      }
    }
    ordenes: AdminUserOrderSummary[]
  }
}

export async function fetchAdminUserById(id: string): Promise<AdminUserDetailResponse> {
  const token = process.env.NEXT_PUBLIC_ADMIN_BEARER || process.env.NEXT_PUBLIC_ORDER_TOKEN || ''
  const res = await fetch(`${BASE_URL}/crm/usuarios/${id}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer 5|7yud9D0naVbdhuHOtTHRo6zM9AZAZAgER8AsVy3n17ded992'
    },
    // cache: 'no-store' // we want fresh
  })
  if(!res.ok) {
    const text = await res.text()
    throw new Error(`Error ${res.status} cargando usuario: ${text}`)
  }
  return res.json()
}

export interface AdminUserListItem {
  id: string
  cliente: string
  contacto: { email: string; telefono: string | null }
  ordenes: number
  total_gastado: number
  ultima_orden: string | null
  fecha_creacion: string
  tipo_usuario: string
}

export interface AdminUserListResponse {
  data: AdminUserListItem[]
  meta: {
    pagination: {
      current_page: number
      per_page: number
      total: number
      last_page: number
    }
    filters: {
      busqueda: string | null
      fecha_desde: string | null
      fecha_hasta: string | null
    }
  }
}

export async function fetchAdminUsers(params: { page?: number; per_page?: number; busqueda?: string } = {}): Promise<AdminUserListResponse> {
  const token = process.env.NEXT_PUBLIC_ADMIN_BEARER || process.env.NEXT_PUBLIC_ORDER_TOKEN || ''
  const qs = new URLSearchParams()
  if(params.page) qs.set('page', String(params.page))
  if(params.per_page) qs.set('per_page', String(params.per_page))
  if(params.busqueda) qs.set('busqueda', params.busqueda)
  const url = `${BASE_URL}/crm/usuarios${qs.toString() ? `?${qs.toString()}` : ''}`
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer 5|7yud9D0naVbdhuHOtTHRo6zM9AZAZAgER8AsVy3n17ded992'
    }
  })
  if(!res.ok) {
    const text = await res.text()
    throw new Error(`Error ${res.status} listando usuarios: ${text}`)
  }
  return res.json()
}
