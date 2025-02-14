import type { NextApiRequest, NextApiResponse } from "next"

const API_BASE_URL = "https://chat.falitech.com/api/shop"
const API_TOKEN = "AhB18akNiusd3VVey7KbOTqDWwZ9SmJd23FrDT4tLgmjYSJRkSI4MWtT0Vv9"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { id } = req.query

    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/get-info`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch product details")
      }

      const data = await response.json()
      res.status(200).json(data)
    } catch (error) {
      res.status(500).json({ error: "Error fetching product details" })
    }
  } else {
    res.setHeader("Allow", ["GET"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

