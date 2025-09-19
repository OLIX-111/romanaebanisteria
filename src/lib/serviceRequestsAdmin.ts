const BASE_URL = process.env.NEXT_PUBLIC_ROMANA_API || 'https://romana-ebanisteria-api-production.up.railway.app/api/v1'

export interface EstadoHistorialItem {
  id: number
  estado: string
  nota: string | null
  fecha_cambio: string
  usuario?: {
    id: string
    nombre: string
    email: string | null
  } | null
}

export interface AdminServiceRequestItem {
  id: string
  estado: string
  nombre_servicio: string
  fecha_deseada: string | null
  direccion: {
    calle: string
    sector: string
    estado: string
    codigo_postal: string
  } | null
  contacto: {
    nombre_completo: string
    correo: string
    telefono: string
    empresa: string | null
  }
  descripcion_proyecto: string | null
  usuario: any
  created_at: string
  updated_at: string
  historial_estados?: EstadoHistorialItem[]
}

export interface AdminServiceRequestsResponse {
  data: AdminServiceRequestItem[]
  links?: any
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
    pagination?: {
      current_page: number
      per_page: number
      total: number
      last_page: number
    }
    filters?: {
      estado: string | null
      fecha_desde: string | null
      fecha_hasta: string | null
    }
  }
}

export interface FetchAdminServiceRequestsParams {
  page?: number
  per_page?: number
  estado?: string | null
  fecha_desde?: string | null
  fecha_hasta?: string | null
}

const ADMIN_BEARER = '15|WfF1qQjJdJrDWsJJJlCmyJ87Laa2Z878rObuHihn58c0db15'

export async function fetchAdminServiceRequests(params: FetchAdminServiceRequestsParams = {}): Promise<AdminServiceRequestsResponse> {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.per_page) qs.set('per_page', String(params.per_page))
  if (params.estado) qs.set('estado', params.estado)
  if (params.fecha_desde) qs.set('fecha_desde', params.fecha_desde)
  if (params.fecha_hasta) qs.set('fecha_hasta', params.fecha_hasta)

  const url = `${BASE_URL}/crm/servicios/solicitudes`
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${ADMIN_BEARER}`
    }
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Error ${res.status} listando solicitudes: ${text}`)
  }
  return res.json()
}

export interface AdminServiceRequestDetailResponse {
  data: AdminServiceRequestItem
}

export async function fetchAdminServiceRequestById(id: string): Promise<AdminServiceRequestDetailResponse> {
  const res = await fetch(`${BASE_URL}/crm/servicios/solicitudes/${id}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${ADMIN_BEARER}`
    }
  })
  const json = await res.json().catch(()=>({}))
  if(!res.ok) throw new Error(json?.message || json?.error || `Error obteniendo solicitud ${id}`)
  if(json?.data) return json as AdminServiceRequestDetailResponse
  return { data: json as AdminServiceRequestItem }
}

export interface UpdateServiceRequestEstadoBody {
  estado: string
  nota?: string
}

export interface UpdateServiceRequestEstadoResponse {
  message: string
  data: {
    id: string
    numero_servicio: string
    estado_anterior: string
    estado_nuevo: string
    fecha_cambio: string
  }
}

export async function updateServiceRequestEstado(id: string, body: UpdateServiceRequestEstadoBody): Promise<UpdateServiceRequestEstadoResponse> {
  const res = await fetch(`${BASE_URL}/crm/servicios/solicitudes/${id}/estado`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_BEARER}`
    },
    body: JSON.stringify(body)
  })
  const json = await res.json().catch(()=>({}))
  if(!res.ok) throw new Error(json?.message || json?.error || `Error actualizando estado solicitud ${id}`)
  return json as UpdateServiceRequestEstadoResponse
}
