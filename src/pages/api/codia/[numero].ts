import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Simple in-memory cache to avoid hammering external site.
 * Not critical persistence; resets on server restart.
 */
const cache = new Map<string, { timestamp: number; data: any }>()
const TTL_MS = 1000 * 60 * 60; // 1h

interface SuccessResponse {
  ok: true
  data: {
    numero: string
    nombre?: string
    regional?: string
    delegacion?: string
    nucleo?: string
    raw?: boolean
  }
}

interface ErrorResponse {
  ok: false
  reason: 'not_found' | 'bad_request' | 'error'
  message?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuccessResponse | ErrorResponse>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, reason: 'bad_request', message: 'Method not allowed' })
  }

  const numero = (req.query.numero as string || '').trim()
  if (!/^\d{1,8}$/.test(numero)) {
    return res.status(400).json({ ok: false, reason: 'bad_request', message: 'Número inválido' })
  }

  const now = Date.now()
  const cached = cache.get(numero)
  if (cached && (now - cached.timestamp) < TTL_MS) {
    return res.status(200).json({ ok: true, data: cached.data })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  const url = `https://consulta.codiaenlinea.com/ConsultaCodias/Details/${numero}`

  let html: string
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; romana-ebanisteria/1.0; +https://romanaebanisteria.com)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    })
    if (!response.ok) {
      clearTimeout(timeout)
      return res.status(502).json({ ok: false, reason: 'error', message: 'Error remoto' })
    }
    html = await response.text()
  } catch (e: any) {
    clearTimeout(timeout)
    const aborted = e?.name === 'AbortError'
    return res.status(504).json({ ok: false, reason: 'error', message: aborted ? 'Timeout validando CODIA' : 'Fallo de red' })
  } finally {
    clearTimeout(timeout)
  }

  if (/NO HAY COLEGIADO REGISTRADO CON ESTE NUMERO/i.test(html)) {
    return res.status(200).json({ ok: false, reason: 'not_found', message: 'No encontrado' })
  }

  // Parse table values with simple regexes
  function extract(label: string) {
    const regex = new RegExp(`<th>\\s*${label}\\s*:<\\/th>\\s*<td>\\s*([^<]+)<\\/td>`, 'i')
    const m = html.match(regex)
    return m ? m[1].trim() : undefined
  }

  const data = {
    numero,
    nombre: extract('NOMBRE'),
    regional: extract('REGIONAL'),
    delegacion: extract('DELEGACION'),
    nucleo: extract('NUCLEO')
  }

  cache.set(numero, { timestamp: now, data })
  return res.status(200).json({ ok: true, data })
}
