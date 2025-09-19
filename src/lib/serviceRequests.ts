const BASE_URL = process.env.NEXT_PUBLIC_ROMANA_API || 'https://romana-ebanisteria-api-production.up.railway.app/api/v1'

export interface CreateServiceRequestPayload {
  desiredDate: string
  address: string
  suburb: string
  state: string
  postcode: string
  fullName: string
  email: string
  phone: string
  company?: string
  projectDescription: string
  serviceName: string
}

export interface ServiceRequestResponse {
  data: {
    id: string
    estado: string
    nombre_servicio: string
    fecha_deseada: string
    direccion: {
      calle: string
      sector: string
      estado: string
      codigo_postal: string
    }
    contacto: {
      nombre_completo: string
      correo: string
      telefono: string
      empresa?: string | null
    }
    descripcion_proyecto: string
    created_at: string
    updated_at: string
  }
}

// Tracking (público) por número de solicitud
export interface ServiceRequestTrackingResponse {
  data: {
    id: string
    numero_solicitud: string
    cliente: {
      id: string
      nombre: string
      email: string
      telefono: string
      empresa?: string | null
    }
    servicio: {
      nombre: string
      descripcion: string
      fecha_deseada: string | null
    }
    direccion?: {
      calle: string
      sector: string
      estado: string
      codigo_postal: string
    } | null
    estado_actual: string
    fecha_creacion: string
    fecha_actualizacion: string
    historial_por_estado: Record<string, { fecha: string; nota: string | null; usuario?: { id: string; nombre: string } | null }[]> | null
  }
}

export async function fetchServiceRequestTrackingByNumber(numero: string): Promise<ServiceRequestTrackingResponse> {
  const clean = numero.trim()
  const res = await fetch(`${BASE_URL}/servicios/seguimiento/${encodeURIComponent(clean)}`, {
    headers: { 'Accept': 'application/json' }
  })
  const json = await res.json().catch(()=> ({}))
  if(!res.ok) throw new Error(json?.message || json?.error || 'No se encontró la solicitud')
  return json as ServiceRequestTrackingResponse
}

// ===== Listado de solicitudes del usuario autenticado =====
// Asumimos que GET /servicios/solicitudes (sin ID) devuelve sólo las del usuario (según token)
// Si el backend usa otro endpoint, ajustar en el futuro.

export interface UserServiceRequestItem {
  id: string
  // Backend may return either numero_servicio (new) or numero_solicitud (legacy)
  numero_solicitud?: string
  numero_servicio?: string
  estado: string
  nombre_servicio: string
  fecha_deseada: string | null
  created_at: string
  updated_at: string
}

export interface UserServiceRequestsResponse {
  data: UserServiceRequestItem[]
}

export async function fetchUserServiceServiceRequests(authToken: string): Promise<UserServiceRequestsResponse> {
  // Nueva ruta para solicitudes del usuario autenticado
  const res = await fetch(`${BASE_URL}/usuario/servicios/solicitudes`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  })
  const json = await res.json().catch(()=>({}))
  if(!res.ok) throw new Error(json?.message || json?.error || 'No se pudieron cargar las solicitudes')
  // La API devuelve paginado { data: [], meta: {} }. Normalizamos y mantenemos compatibilidad de campos
  const rawList: any[] = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : [])
  const data: UserServiceRequestItem[] = rawList.map((it:any) => ({
    id: it.id,
    numero_servicio: it.numero_servicio ?? it.numero_solicitud,
    numero_solicitud: it.numero_solicitud ?? it.numero_servicio, // compat con UI
    estado: it.estado,
    nombre_servicio: it.nombre_servicio,
    fecha_deseada: it.fecha_deseada ?? null,
    created_at: it.created_at,
    updated_at: it.updated_at,
  }))
  return { data }
}

export async function createServiceRequest(payload: CreateServiceRequestPayload, authToken: string | null): Promise<ServiceRequestResponse> {
  // Ahora se permite crear solicitudes como invitado; si hay token se envía.
  const res = await fetch(`${BASE_URL}/servicios/solicitudes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
    },
    body: JSON.stringify(payload)
  })
  const json = await res.json().catch(()=>({}))
  if(!res.ok) throw new Error(json?.message || json?.error || 'No se pudo crear la solicitud')
  return json as ServiceRequestResponse
}

// ===== Detalle de una solicitud del usuario autenticado =====
export interface UserServiceRequestDetail {
  id: string
  numero_servicio: string
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
    empresa?: string | null
  }
  descripcion_proyecto: string
  historial_estados: {
    id: number
    estado: string
    nota: string | null
    fecha_cambio: string
    usuario: { id: string; nombre: string; email: string | null } | null
  }[]
  created_at: string
  updated_at: string
}

export interface UserServiceRequestDetailResponse {
  data: UserServiceRequestDetail
}

export async function fetchUserServiceRequestById(id: string, authToken: string): Promise<UserServiceRequestDetailResponse> {
  const res = await fetch(`${BASE_URL}/usuario/servicios/solicitudes/${encodeURIComponent(id)}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  })
  const json = await res.json().catch(()=>({}))
  if(!res.ok) throw new Error(json?.message || json?.error || `No se pudo obtener la solicitud ${id}`)
  return json as UserServiceRequestDetailResponse
}
