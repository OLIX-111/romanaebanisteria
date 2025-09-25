import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"

const apiUrl = process.env.VITE_API_URL
const apiKey = process.env.VITE_API_KEY

if (!apiUrl) {
  throw new Error("Missing VITE_API_URL environment variable")
}

if (!apiKey) {
  throw new Error("Missing VITE_API_KEY environment variable")
}

interface CardPaymentRequest {
  cardNumber: string
  expMonth: string
  expYear: string
  cvv: string
  name: string
  email: string
  amount: string
  pnRef?: string
  idempotencyKey?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({ error: "Method not allowed" })
  }

  const {
    cardNumber,
    expMonth,
    expYear,
    cvv,
    name,
    email,
    amount,
    pnRef,
    idempotencyKey,
  }: CardPaymentRequest = req.body

  if (!cardNumber || !expMonth || !expYear || !cvv || !name || !email || !amount) {
    return res.status(400).json({ error: "Missing required payment fields" })
  }

  const normalizedMonth = expMonth.padStart(2, "0")
  const normalizedYear = expYear.length === 4 ? expYear.slice(2) : expYear.padStart(2, "0")
  const expirationDate = `${normalizedMonth}/${normalizedYear}`

  const payload = {
    "idempotency-key": idempotencyKey || `ikey:${crypto.randomUUID()}`,
    "card-number": cardNumber.replace(/\s+/g, ""),
    "expiration-date": expirationDate,
    cvv,
    name,
    email,
    amount,
    pnRef: pnRef || `txn-${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
  }

  try {
    const response = await fetch(`${apiUrl}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    const text = await response.text()

    if (!response.ok) {
      let errorBody: unknown
      try {
        errorBody = JSON.parse(text)
      } catch {
        errorBody = text
      }
      return res.status(response.status).json({
        error: "Payment request failed",
        details: errorBody,
      })
    }

    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }

    return res.status(200).json({
      success: true,
      payload,
      data,
    })
  } catch (error: any) {
    console.error("[payments/card] error", error)
    return res.status(500).json({
      error: "Unexpected server error",
      details: error?.message || "Unknown error",
    })
  }
}
