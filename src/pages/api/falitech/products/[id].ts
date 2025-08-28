import type { NextApiRequest, NextApiResponse } from "next"

// Proxy detalle de producto Falitech: /api/falitech/products/:id
// Repite la lógica de token (recuerda quitar fallback en producción)
const EXTERNAL_BASE = "https://chat.falitech.com/api/shop/products"
const TOKEN = process.env.FALITECH_TOKEN || "toY1MJxsmGUHQOAjXVx6vMp2TxiPrKpQDY70wX7W1GlVuZ8WNNPrtKJu53bt"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "Method Not Allowed" })
  }
  const { id } = req.query
  const productId = Array.isArray(id) ? id[0] : id
  if (!productId || isNaN(Number(productId))) {
    return res.status(400).json({ error: "ID inválido" })
  }
  try {
    const url = `${EXTERNAL_BASE}/${productId}/get-info`
    const extRes = await fetch(url, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      cache: "no-store",
    })
    if (!extRes.ok) {
      const txt = await extRes.text()
      return res.status(extRes.status).json({ error: txt || extRes.statusText })
    }
    const json = await extRes.json()
    return res.status(200).json(json)
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Error interno proxy" })
  }
}
