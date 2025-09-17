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
