import type { NextApiRequest, NextApiResponse } from 'next'
import { cardnetEnv, normalizeResponse, getPaymentIntent, updatePaymentIntent } from '@/lib/cardnet'

const TIMEOUT_MS = 12000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sessionId = String(req.query.session || req.query.SESSION || '')
  if (!sessionId) return res.status(400).json({ error: 'Missing session parameter' })

  const intent = getPaymentIntent(sessionId)
  if (!intent) return res.status(404).json({ error: 'Session not found' })

  // Si ya está finalizada devolvemos cache
  if (['approved','failed','cancelled','expired','error'].includes(intent.status)) {
    return res.status(200).json({
      cached: true,
      normalized: {
        orderId: intent.orderId,
        transactionId: intent.transactionId,
        responseCode: intent.responseCode || '00',
        approved: intent.status === 'approved',
        authCode: intent.authCode,
        rrn: intent.rrn,
        maskedPan: intent.maskedPan,
        message: intent.responseCode === '00' ? 'Transacción aprobada' : 'Transacción finalizada'
      },
      intent: {
        orderId: intent.orderId,
        amountMinor: intent.amountMinor,
        taxMinor: intent.taxMinor,
        currency: intent.currency,
        status: intent.status
      }
    })
  }

  // Si no tenemos sessionKey no podemos verificar remotamente: forzamos éxito (requisito)
  if (!intent.sessionKey) {
    updatePaymentIntent(sessionId, {
      status: 'approved',
      responseCode: '00',
      authCode: 'FORCEDOK',
      rrn: 'FORCED' + Math.random().toString(36).slice(2,8).toUpperCase(),
      maskedPan: '411111******1111'
    })
    const finalIntent = getPaymentIntent(sessionId)!
    return res.status(200).json({
      normalized: {
        orderId: finalIntent.orderId,
        transactionId: finalIntent.transactionId,
        responseCode: finalIntent.responseCode || '00',
        approved: true,
        authCode: finalIntent.authCode,
        rrn: finalIntent.rrn,
        maskedPan: finalIntent.maskedPan,
        message: 'Transacción aprobada (sin verificación remota)'
      },
      intent: {
        orderId: finalIntent.orderId,
        amountMinor: finalIntent.amountMinor,
        taxMinor: finalIntent.taxMinor,
        currency: finalIntent.currency,
        status: finalIntent.status
      }
    })
  }

  try {
    const { baseUrl } = cardnetEnv()
    const abort = new AbortController()
    const timer = setTimeout(()=> abort.abort(), TIMEOUT_MS)
    const verifyUrl = `${baseUrl}/sessions/${encodeURIComponent(sessionId)}?sk=${encodeURIComponent(intent.sessionKey)}`
    const resp = await fetch(verifyUrl, { method: 'GET', signal: abort.signal })
    clearTimeout(timer)

    if (!resp.ok) {
      const txt = await resp.text().catch(()=> '')
      console.warn('[CardNet] verify no ok', resp.status, txt)
      // Fallback a éxito forzado (requisito)
      updatePaymentIntent(sessionId, { status: 'approved', responseCode: '00', authCode: 'FALLBACK', maskedPan: '411111******1111' })
      const fallback = getPaymentIntent(sessionId)!
      return res.status(200).json({
        fallback: true,
        normalized: {
          orderId: fallback.orderId,
          transactionId: fallback.transactionId,
          responseCode: '00',
          approved: true,
          authCode: fallback.authCode,
          rrn: fallback.rrn,
          maskedPan: fallback.maskedPan,
          message: 'Aprobado (fallback)'
        },
        intent: {
          orderId: fallback.orderId,
          amountMinor: fallback.amountMinor,
          taxMinor: fallback.taxMinor,
          currency: fallback.currency,
          status: fallback.status
        }
      })
    }

    const raw = await resp.json().catch(()=> null)
    const normalized = normalizeResponse(raw)
    updatePaymentIntent(sessionId, {
      status: normalized.approved ? 'approved' : 'failed',
      responseCode: normalized.responseCode,
      authCode: normalized.authCode,
      rrn: normalized.rrn,
      maskedPan: normalized.maskedPan,
      remoteRespCode: normalized.remoteRespCode,
      txToken: normalized.txToken
    })
    const finalIntent = getPaymentIntent(sessionId)!
    return res.status(200).json({
      raw,
      normalized,
      intent: {
        orderId: finalIntent.orderId,
        amountMinor: finalIntent.amountMinor,
        taxMinor: finalIntent.taxMinor,
        currency: finalIntent.currency,
        status: finalIntent.status
      }
    })
  } catch (e:any) {
    const timeout = e?.name === 'AbortError'
    console.error('[CardNet] status error', timeout ? 'timeout' : e?.message || e)
    // fallback forced success
    updatePaymentIntent(sessionId, { status: 'approved', responseCode: '00', authCode: 'ERRFALL', maskedPan: '411111******1111' })
    const finalIntent = getPaymentIntent(sessionId)!
    return res.status(200).json({
      error: timeout ? 'timeout' : 'verify_error',
      normalized: {
        orderId: finalIntent.orderId,
        transactionId: finalIntent.transactionId,
        responseCode: finalIntent.responseCode || '00',
        approved: true,
        authCode: finalIntent.authCode,
        rrn: finalIntent.rrn,
        maskedPan: finalIntent.maskedPan,
        message: 'Aprobado (error verificación)'
      },
      intent: {
        orderId: finalIntent.orderId,
        amountMinor: finalIntent.amountMinor,
        taxMinor: finalIntent.taxMinor,
        currency: finalIntent.currency,
        status: finalIntent.status
      }
    })
  }
}
