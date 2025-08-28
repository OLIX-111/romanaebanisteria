import type { NextApiRequest, NextApiResponse } from "next"
import { createOrder } from "@/lib/falitechApi"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" })
    const payload = req.body
    if (!payload?.user_ns || !Array.isArray(payload?.items)) {
      return res.status(400).json({ message: "Missing user_ns or items" })
    }
    const data = await createOrder(payload)
    return res.status(200).json(data)
  } catch (error: any) {
    console.error("Error in /api/ecommerce/orders:", error)
    return res.status(400).json({ message: error.message || "Error" })
  }
}


