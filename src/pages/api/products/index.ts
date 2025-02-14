import type { NextApiRequest, NextApiResponse } from "next"

const API_BASE_URL = "https://chat.falitech.com/api/shop"
const API_TOKEN = "AhB18akNiusd3VVey7KbOTqDWwZ9SmJd23FrDT4tLgmjYSJRkSI4MWtT0Vv9"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { limit = 20, page = 1 } = req.query

    try {
      const response = await fetch(`${API_BASE_URL}/products?limit=${limit}&page=${page}`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      res.status(200).json(data)
    } catch (error) {
      res.status(500).json({ error: "Error fetching products" })
    }
  } else {
    res.setHeader("Allow", ["GET"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

