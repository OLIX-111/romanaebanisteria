import type { NextApiRequest, NextApiResponse } from 'next'

// Consulta resultado de sesión CardNET (QA)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })
  const { session, sessionKey } = req.query
  if (!session || !sessionKey) return res.status(400).json({ error: 'Faltan parámetros' })

  try {
    const url = `https://lab.cardnet.com.do/sessions/${session}?sk=${sessionKey}`
    const response = await fetch(url)
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error consultando CardNET', status: response.status })
    }
    const data = await response.json()
    res.status(200).json(data)
  } catch (error: any) {
    res.status(500).json({ error: 'Error interno', details: error?.message })
  }
}
