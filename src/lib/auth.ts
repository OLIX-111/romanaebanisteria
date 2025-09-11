// Simple client-side auth helper for Romana Ebanistería custom API
// Stores token + user in localStorage

export interface RomanaUser {
  id: string
  nombre: string
  correo: string
  telefono?: string
  is_guest?: boolean
  created_at?: string
  updated_at?: string
}

export interface AuthResponse {
  user: RomanaUser
  token: string
  token_type: string
}

const STORAGE_KEY = 'romana_auth'

export function saveAuth(data: AuthResponse) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export function getAuth(): AuthResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearAuth() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}

const BASE_URL = process.env.NEXT_PUBLIC_ROMANA_API || 'https://romana-ebanisteria-api-production.up.railway.app/api/v1'

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers||{}) },
    ...options,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (json && (json.message || json.error)) || 'Error de red'
    throw new Error(msg)
  }
  return json as T
}

export async function registerUser(data: { nombre: string; correo: string; password: string; password_confirmation: string; telefono?: string }) {
  const resp = await request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) })
  saveAuth(resp)
  return resp
}

export async function loginUser(data: { correo: string; password: string }) {
  const resp = await request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) })
  saveAuth(resp)
  return resp
}

export function logoutUser() {
  clearAuth()
}

// Fetch current authenticated user from /auth/me using stored bearer token
// Updates the cached auth user (preserving token) if successful.
export async function fetchCurrentUser(): Promise<RomanaUser> {
  const auth = getAuth()
  if (!auth?.token) throw new Error('NO_AUTH')
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${auth.token}`,
      'Accept': 'application/json'
    }
  })
  if (res.status === 401) {
    clearAuth()
    throw new Error('UNAUTHORIZED')
  }
  if (!res.ok) {
    throw new Error('No se pudo obtener el perfil')
  }
  const data = await res.json()
  // API returns id_usuario; map to our id field
  const mapped: RomanaUser = {
    id: data.id_usuario || data.id || '',
    nombre: data.nombre,
    correo: data.correo,
    telefono: data.telefono || undefined,
    is_guest: data.is_guest,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
  // Persist updated user while keeping token data
  saveAuth({ user: mapped, token: auth.token, token_type: auth.token_type })
  return mapped
}
