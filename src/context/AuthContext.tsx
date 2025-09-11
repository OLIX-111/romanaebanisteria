"use client"
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthResponse, RomanaUser, getAuth, saveAuth, loginUser, registerUser, logoutUser as baseLogoutUser, fetchCurrentUser, clearAuth } from '@/lib/auth'

interface AuthContextValue {
  user: RomanaUser | null
  token: string | null
  loading: boolean
  error: string | null
  login: (correo: string, password: string) => Promise<void>
  register: (data: { nombre: string; correo: string; password: string; password_confirmation: string; telefono?: string }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<RomanaUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize from localStorage
  useEffect(() => {
    const auth = getAuth()
    if (auth?.token) {
      setToken(auth.token)
      setUser(auth.user)
      // Try to refresh user in background
      fetchCurrentUser().then(fresh => {
        setUser(fresh)
      }).catch(e => {
        if (e?.message === 'UNAUTHORIZED') {
          handleLogout()
        }
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogout = useCallback(() => {
    baseLogoutUser()
    setUser(null)
    setToken(null)
    setError(null)
  }, [])

  const login = useCallback(async (correo: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      const resp = await loginUser({ correo, password })
      setUser(resp.user)
      setToken(resp.token)
    } catch (e: any) {
      setError(e?.message || 'No se pudo iniciar sesión')
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (data: { nombre: string; correo: string; password: string; password_confirmation: string; telefono?: string }) => {
    setError(null)
    setLoading(true)
    try {
      const resp = await registerUser(data)
      setUser(resp.user)
      setToken(resp.token)
    } catch (e: any) {
      setError(e?.message || 'No se pudo registrar')
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    if (!token) return
    try {
      const fresh = await fetchCurrentUser()
      setUser(fresh)
    } catch (e: any) {
      if (e?.message === 'UNAUTHORIZED') handleLogout()
    }
  }, [token, handleLogout])

  const value: AuthContextValue = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout: handleLogout,
    refreshUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
