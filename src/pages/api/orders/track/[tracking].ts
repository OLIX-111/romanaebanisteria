import type { NextApiRequest, NextApiResponse } from 'next'

const BASE_URL = process.env.ROMANA_API_INTERNAL || 'https://romana-ebanisteria-api-production.up.railway.app/api/v1'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method not allowed' })
  }
  const { tracking } = req.query
  if (!tracking || Array.isArray(tracking)) return res.status(400).json({ message: 'Tracking inválido' })

  const include = req.query.include || 'detalles,seguimientos'
  const qs = new URLSearchParams()
  qs.set('include', Array.isArray(include) ? include.join(',') : String(include))

  try {
    const upstream = await fetch(`${BASE_URL}/ordenes/track/${tracking}?${qs.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
      },
      redirect: 'manual'
    })
    if (upstream.status === 301 || upstream.status === 302) {
      console.warn('Order track proxy redirect', upstream.status, upstream.headers.get('Location'))
    }
    const data = await upstream.json().catch(()=>({}))
    if (!upstream.ok) return res.status(upstream.status).json(data)
    return res.status(200).json(data)
  } catch (e:any) {
    return res.status(500).json({ message: e?.message || 'Order detail proxy error' })
  }
}
