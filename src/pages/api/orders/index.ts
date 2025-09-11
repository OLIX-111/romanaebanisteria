import type { NextApiRequest, NextApiResponse } from 'next'

const BASE_URL = process.env.ROMANA_API_INTERNAL || 'https://romana-ebanisteria-api-production.up.railway.app/api/v1'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const qs = req.url?.includes('?') ? req.url?.split('?')[1] : ''
      const upstream = await fetch(`${BASE_URL}/ordenes${qs ? `?${qs}` : ''}` , {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
        },
        redirect: 'manual'
      })
      if (upstream.status === 301 || upstream.status === 302) {
        console.warn('Orders proxy redirect', upstream.status, upstream.headers.get('Location'))
      }
      const data = await upstream.json().catch(()=>({}))
      if (!upstream.ok) return res.status(upstream.status).json(data)
      return res.status(200).json(data)
    } catch (e:any) {
      return res.status(500).json({ message: e?.message || 'Orders proxy error' })
    }
  }
  if (req.method === 'POST') {
    try {
      const upstream = await fetch(`${BASE_URL}/ordenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
        },
        body: JSON.stringify(req.body),
        redirect: 'manual'
      })
      if (upstream.status === 301 || upstream.status === 302) {
        console.warn('Orders proxy redirect', upstream.status, upstream.headers.get('Location'))
      }
      const data = await upstream.json().catch(()=>({}))
      if (!upstream.ok) return res.status(upstream.status).json(data)
      return res.status(200).json(data)
    } catch (e:any) {
      return res.status(500).json({ message: e?.message || 'Orders proxy error' })
    }
  }
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ message: 'Method not allowed' })
}
