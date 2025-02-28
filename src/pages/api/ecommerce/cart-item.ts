// pages/api/ecommerce/cart-item.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { addToCart } from "@/lib/falitechApi"

export default async function cartItemHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "POST") {
      // Agregar
      const { user_ns, variant_id, qty } = req.body
      if (!user_ns || !variant_id) {
        return res.status(400).json({ message: "Missing user_ns or variant_id" })
      }
      const result = await addToCart(user_ns, variant_id, qty || 1)
      return res.status(200).json(result)
    } else {
      return res.status(405).json({ message: "Method Not Allowed" })
    }
  } catch (error: any) {
    console.error("Error in /api/ecommerce/cart-item:", error)
    return res.status(400).json({ message: error.message })
  }
}
