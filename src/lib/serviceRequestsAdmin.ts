const BASE_URL = process.env.NEXT_PUBLIC_ROMANA_API || 'https://romana-ebanisteria-api-production.up.railway.app/api/v1'

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

const ADMIN_BEARER = '5|7yud9D0naVbdhuHOtTHRo6zM9AZAZAgER8AsVy3n17ded992'

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
