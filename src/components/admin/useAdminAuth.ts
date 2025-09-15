"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface AdminUser {
  email: string | null
  user_metadata: { role: string }
  last_sign_in_at: string | null
}

// Simple hook encapsulating localStorage-based admin auth used across admin pages
export function useAdminAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<AdminUser | null>(null)

  const ADMIN_EMAIL = 'admin@romanaebanisteria.com'

  useEffect(() => {
    const check = () => {
      try {
        const authed = localStorage.getItem('ebadmin_authenticated') === 'true'
        const email = localStorage.getItem('ebadmin_email')
        const loginTime = localStorage.getItem('ebadmin_login_time')

        if (!authed || email !== ADMIN_EMAIL) {
          router.replace('/ebadmin/login')
          return
        }
        if (loginTime) {
          const hours = (Date.now() - new Date(loginTime).getTime()) / 36e5
          if (hours > 24) {
            localStorage.removeItem('ebadmin_authenticated')
            localStorage.removeItem('ebadmin_email')
            localStorage.removeItem('ebadmin_login_time')
            router.replace('/ebadmin/login')
            return
          }
        }
        setUser({ email, user_metadata: { role: 'admin' }, last_sign_in_at: loginTime })
        setIsAdmin(true)
      } catch (e) {
        console.error('Auth error', e)
        router.replace('/ebadmin/login')
      } finally {
        setLoading(false)
      }
    }
    check()
  }, [router])

  return { loading, isAdmin, user }
}
