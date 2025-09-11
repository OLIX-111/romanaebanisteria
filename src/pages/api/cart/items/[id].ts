import type { NextApiRequest, NextApiResponse } from 'next'

const BASE_URL = process.env.ROMANA_API_INTERNAL || 'https://romana-ebanisteria-api-production.up.railway.app/api/v1'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (req.method === 'PUT') {
    if (!id || typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' })
    try {
      const { cantidad } = req.body || {}
      const upstream = await fetch(`${BASE_URL}/carrito/items/${id}?token=${encodeURIComponent(String(req.query.token||''))}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
        },
        body: JSON.stringify({ cantidad }),
        redirect: 'manual'
      })
      if (upstream.status === 301 || upstream.status === 302) {
        console.warn('Cart proxy PUT redirect', upstream.status, upstream.headers.get('Location'))
      }
      const data = await upstream.json().catch(()=>({}))
      if (!upstream.ok) return res.status(upstream.status).json(data)
      return res.status(200).json(data)
    } catch (e: any) {
      return res.status(500).json({ message: e?.message || 'Cart proxy error' })
    }
  }
  res.setHeader('Allow', 'PUT')
  return res.status(405).json({ message: 'Method not allowed' })
}
