import type { NextApiRequest, NextApiResponse } from "next"
import { getSubscriberInfo } from "@/lib/falitechApi"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") return res.status(405).json({ message: "Method Not Allowed" })
    const user_ns = req.query.user_ns as string
    if (!user_ns) return res.status(400).json({ message: "Missing user_ns" })
    const info = await getSubscriberInfo(user_ns)
    return res.status(200).json(info)
  } catch (error: any) {
    console.error("Error in /api/ecommerce/subscriber-info:", error)
    return res.status(400).json({ message: error.message || "Error" })
  }
}


