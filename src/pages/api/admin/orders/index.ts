import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
  // Hardcoded token (requested) – backend currently only accepts this token
  const auth = '14|uCaqMI5FqZXPbXzZwCm6SFDtOst7WSRJMbyMQskS1ad782f9'
  if (!auth) return res.status(401).json({ error: 'Missing Authorization token' })

    // Pass through query params (e.g., page, per_page)
    const qs = new URLSearchParams()
    Object.entries(req.query).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(val => qs.append(k, val))
      else if (v != null) qs.append(k, String(v))
    })
    // Some backends issue 301 for missing trailing slash; include it to avoid redirect.
    const resource = '/crm/ordenes/'
    const url = 'https://romana-ebanisteria-api-production.up.railway.app/api/v1/crm/ordenes'

    let upstream = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': "Bearer 14|uCaqMI5FqZXPbXzZwCm6SFDtOst7WSRJMbyMQskS1ad782f9",
      },
      redirect: 'manual'
    })

    // Manually follow a single redirect (301/302) if present
    if ([301, 302, 307, 308].includes(upstream.status)) {
      const location = upstream.headers.get('location')
      if (location) {
        const followUrl = location.startsWith('http') ? location : new URL(location, url).toString()
        upstream = await fetch(followUrl, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Authorization': auth,
          },
          redirect: 'manual'
        })
      }
    }

    const rawText = await upstream.text()
    let json: any = null
    try { json = rawText ? JSON.parse(rawText) : null } catch {}

    res.setHeader('x-upstream-status', String(upstream.status))
    if (!upstream.ok) {
      return res.status(upstream.status).json(json || { error: 'Upstream error', upstreamStatus: upstream.status })
    }
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json(json)
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Server error' })
  }
}
