// pages/api/ecommerce/cart.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { getCart, emptyCart } from "@/lib/falitechApi"

export default async function cartHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const user_ns = req.query.user_ns as string
      if (!user_ns) {
        return res.status(400).json({ message: "Missing user_ns" })
      }
      const cartData = await getCart(user_ns)
      return res.status(200).json(cartData)
    } else if (req.method === "DELETE") {
      const { user_ns } = req.body
      if (!user_ns) {
        return res.status(400).json({ message: "Missing user_ns" })
      }
      const result = await emptyCart(user_ns)
      return res.status(200).json(result)
    } else {
      return res.status(405).json({ message: "Method Not Allowed" })
    }
  } catch (error: any) {
    console.error("Error in /api/ecommerce/cart:", error)
    return res.status(400).json({ message: error.message })
  }
}
