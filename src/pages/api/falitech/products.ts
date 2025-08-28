import type { NextApiRequest, NextApiResponse } from "next"

// Proxy API para ocultar el token y evitar CORS.
// Define FALITECH_TOKEN en .env.local (no se expone al cliente).
// Si se deja el fallback, recuerda quitarlo en producción.
const EXTERNAL_BASE = "https://chat.falitech.com/api/shop/products"
const TOKEN = process.env.FALITECH_TOKEN || "toY1MJxsmGUHQOAjXVx6vMp2TxiPrKpQDY70wX7W1GlVuZ8WNNPrtKJu53bt" // TODO: quitar fallback en prod

interface FalitechMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  [k: string]: any
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  const { page = "1", all, limit = "100", name } = req.query
  const pageNum = parseInt(Array.isArray(page) ? page[0] : page, 10) || 1
  const fetchAll = all === "1" || all === "true"
  // Sanitizar limit (1..100)
  let limitNum = parseInt(Array.isArray(limit) ? limit[0] : limit, 10)
  if (!Number.isFinite(limitNum) || limitNum < 1) limitNum = 10
  if (limitNum > 100) limitNum = 100
  const nameParam = Array.isArray(name) ? name[0] : name

  try {
    if (!fetchAll) {
      // Passthrough de una sola página (meta intacta)
      const query: string[] = [`page=${pageNum}`, `limit=${limitNum}`]
      if (nameParam) query.push(`name=${encodeURIComponent(nameParam)}`)
      const url = `${EXTERNAL_BASE}?${query.join("&")}`
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
    }

    // Modo agregador: traer todas las páginas y unir data
  const firstQuery: string[] = ["page=1", `limit=${limitNum}`]
  if (nameParam) firstQuery.push(`name=${encodeURIComponent(nameParam)}`)
  const firstRes = await fetch(`${EXTERNAL_BASE}?${firstQuery.join("&")}`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      cache: "no-store",
    })
    if (!firstRes.ok) {
      const txt = await firstRes.text()
      return res.status(firstRes.status).json({ error: txt || firstRes.statusText })
    }
    const firstJson = await firstRes.json()
    const meta: FalitechMeta | undefined = firstJson?.meta
    const lastPage = meta?.last_page || 1
    let allData = firstJson?.data || []

    if (lastPage > 1) {
      const promises: Promise<any[]>[] = []
      for (let p = 2; p <= lastPage; p++) {
        const pageQuery: string[] = [`page=${p}`, `limit=${limitNum}`]
        if (nameParam) pageQuery.push(`name=${encodeURIComponent(nameParam)}`)
        promises.push(
          fetch(`${EXTERNAL_BASE}?${pageQuery.join("&")}`, {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${TOKEN}`,
            },
            cache: "no-store",
          })
            .then(r => {
              if (!r.ok) throw new Error(`Error página ${p}`)
              return r.json()
            })
            .then(j => j.data || [])
        )
      }
      const rest = await Promise.all(promises)
      allData = allData.concat(...rest)
    }

    return res.status(200).json({ data: allData, meta: { total_items: allData.length, pages: lastPage }, aggregated: true })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Error interno proxy" })
  }
}
