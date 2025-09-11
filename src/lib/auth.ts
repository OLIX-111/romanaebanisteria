// Simple client-side auth helper for Romana Ebanistería custom API
// Stores token + user in localStorage

export interface RomanaUser {
  id: string
  nombre: string
  correo: string
  telefono?: string
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
