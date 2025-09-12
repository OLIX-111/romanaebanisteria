import type { NextApiRequest, NextApiResponse } from 'next'

const BASE_URL = process.env.ROMANA_API_INTERNAL || 'https://romana-ebanisteria-api-production.up.railway.app/api/v1'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id_producto, id_variacion, producto_id, variacion_id, cantidad } = req.body || {}
      const { token } = req.query
      // Prefer new naming (id_producto / id_variacion) fallback to old if provided
      const payload = {
        id_producto: id_producto || producto_id,
        id_variacion: id_variacion || variacion_id,
        cantidad,
      }
      const endpoint = `${BASE_URL}/carrito/items${token && typeof token==='string' ? `?token=${encodeURIComponent(token)}` : ''}`
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
        },
  body: JSON.stringify(payload),
        redirect: 'manual'
      })
      if (upstream.status === 301 || upstream.status === 302) {
        console.warn('Cart proxy POST redirect', upstream.status, upstream.headers.get('Location'))
      }
      const data = await upstream.json().catch(()=>({}))
      if (!upstream.ok) return res.status(upstream.status).json(data)
      return res.status(200).json(data)
    } catch (e: any) {
      return res.status(500).json({ message: e?.message || 'Cart proxy error' })
    }
  }
  if (req.method === 'GET') {
    const { token } = req.query
    if (!token || typeof token !== 'string') return res.status(400).json({ message: 'Token requerido' })
    try {
      const upstream = await fetch(`${BASE_URL}/carrito?token=${encodeURIComponent(token)}`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
        },
        redirect: 'manual'
      })
      if (upstream.status === 301 || upstream.status === 302) {
        console.warn('Cart proxy GET redirect', upstream.status, upstream.headers.get('Location'))
      }
      const data = await upstream.json().catch(()=>({}))
      if (!upstream.ok) return res.status(upstream.status).json(data)
      return res.status(200).json(data)
    } catch (e: any) {
      return res.status(500).json({ message: e?.message || 'Cart proxy error' })
    }
  }
  res.setHeader('Allow', 'POST,GET')
  return res.status(405).json({ message: 'Method not allowed' })
}
