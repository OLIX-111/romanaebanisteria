import type { NextApiRequest, NextApiResponse } from 'next'

// Endpoint retirado: CardNet deshabilitado
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({ error: 'CardNet integration removed' })
}
