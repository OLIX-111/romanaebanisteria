import type { NextApiRequest, NextApiResponse } from "next"
import { 
  cardnetEnv, 
  normalizeResponse, 
  getPaymentIntent, 
  updatePaymentIntent 
} from "@/lib/cardnet"

const TIMEOUT_MS = 12000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({ error: "Method not allowed" })
  }

  const sessionId = String(req.query.session || req.query.SESSION || "")
  if (!sessionId) {
    return res.status(400).json({ error: "Missing session parameter" })
  }

  try {
    // Find payment intent by session ID
    const intent = getPaymentIntent(sessionId)
    if (!intent || !intent.sessionKey) {
      console.warn(`[CardNet] Session not found: ${sessionId}`)
      return res.status(404).json({ error: "Session not found or expired" })
    }

    // If already processed, return cached result
    if (intent.status === "approved" || intent.status === "failed") {
      console.log(`[CardNet] Returning cached status for session ${sessionId}: ${intent.status}`)
      return res.status(200).json({
        cached: true,
        normalized: {
          orderId: intent.orderId,
          transactionId: intent.transactionId,
          responseCode: intent.responseCode,
          approved: intent.status === "approved",
          authCode: intent.authCode,
          rrn: intent.rrn,
          maskedPan: intent.maskedPan,
          remoteRespCode: intent.remoteRespCode,
          txToken: intent.txToken,
        }
      })
    }

    const { baseUrl } = cardnetEnv()
    const abort = new AbortController()
    const timeout = setTimeout(() => abort.abort(), TIMEOUT_MS)

    const verifyUrl = `${baseUrl}/sessions/${encodeURIComponent(sessionId)}?sk=${encodeURIComponent(intent.sessionKey)}`
    
    console.log(`[CardNet] Verifying session: ${sessionId}`)

    const response = await fetch(verifyUrl, {
      method: "GET",
      signal: abort.signal,
    })

    clearTimeout(timeout)

    if (response.status === 404) {
      // Session expired (>30 minutes)
      console.warn(`[CardNet] Session expired: ${sessionId}`)
      updatePaymentIntent(sessionId, { status: "expired" })
      return res.status(410).json({ error: "Session expired" })
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "")
      console.error(`[CardNet] Status verification failed: ${response.status} ${response.statusText}`, errorText)
      updatePaymentIntent(sessionId, { status: "error" })
      return res.status(502).json({ 
        error: "CardNet verification failed", 
        details: errorText,
        status: response.status 
      })
    }

    const rawData = await response.json()
    const normalized = normalizeResponse(rawData)

    console.log(`[CardNet] Transaction result for ${sessionId}:`, {
      orderId: normalized.orderId,
      responseCode: normalized.responseCode,
      approved: normalized.approved,
      rrn: normalized.rrn
    })

    // Update payment intent with final status
    const newStatus = normalized.approved ? "approved" : "failed"
    updatePaymentIntent(sessionId, {
      status: newStatus,
      responseCode: normalized.responseCode,
      authCode: normalized.authCode,
      rrn: normalized.rrn,
      maskedPan: normalized.maskedPan,
      remoteRespCode: normalized.remoteRespCode,
      txToken: normalized.txToken,
    })

    return res.status(200).json({
      raw: rawData,
      normalized,
      intent: {
        orderId: intent.orderId,
        amountMinor: intent.amountMinor,
        taxMinor: intent.taxMinor,
        currency: intent.currency,
      }
    })

  } catch (err: any) {
    const isTimeout = err?.name === "AbortError"
    console.error("[CardNet] Status verification exception:", isTimeout ? "timeout" : err?.message || err)
    
    if (!isTimeout) {
      updatePaymentIntent(sessionId, { status: "error" })
    }
    
    return res.status(500).json({ 
      error: isTimeout ? "Request timeout" : "Internal server error",
      timeout: isTimeout 
    })
  }
}
