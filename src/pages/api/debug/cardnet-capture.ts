import type { NextApiRequest, NextApiResponse } from 'next'
// (Retirado) Endpoint de captura debug de CardNet
export default function handler(req: NextApiRequest, res: NextApiResponse){
  return res.status(410).json({ error: 'CardNet debug capture removed' })
}
