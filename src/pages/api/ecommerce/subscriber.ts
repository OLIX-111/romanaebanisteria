// pages/api/ecommerce/subscriber.ts
import { createSubscriber } from "@/lib/falitechApi"
import type { NextApiRequest, NextApiResponse } from "next"


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "POST") {
      const subscriberData = await createSubscriber(req.body)
      return res.status(200).json(subscriberData)
    } else {
      return res.status(405).json({ message: "Method Not Allowed" })
    }
  } catch (error: any) {
    console.error("Error in /api/ecommerce/subscriber:", error)
    return res.status(400).json({ message: error.message || "Error" })
  }
}
