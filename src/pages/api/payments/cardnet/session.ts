import type { NextApiRequest, NextApiResponse } from 'next'
import { 
  cardnetEnv, 
  generateTransactionId, 
  toMinor12, 
  savePaymentIntent, 
  PaymentIntent,
  clientIpFromReq,
  formatMerchantName
} from '@/lib/cardnet'

// Realista: crea una sesión en CardNet (endpoint /sessions) y devuelve la URL /authorize + IDs.
// Si CardNet devuelve error, retornamos 502. Mantiene callback unificado /notify/success.

const TIMEOUT_MS = 15000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const {
      amount,            // number (ej: 1500.50)
      tax = 0,           // number
      currency = '214',  // numeric DOP por defecto
      tracking_number,
      useCuotas = false,
      customer = {},     // { firstName,lastName,email,phone,address,city,province,postalCode }
    } = req.body || {}

    if (typeof amount !== 'number' || amount <= 0 || !tracking_number) {
      return res.status(400).json({ error: 'Parámetros inválidos: amount>0 y tracking_number requeridos' })
    }

    const env = cardnetEnv()
    const transactionId = generateTransactionId()
    const orderId = `RMA-${tracking_number}`.slice(0,20)
    const amountMinor = toMinor12(amount)
    const taxMinor = toMinor12(tax)
    const abort = new AbortController()
    const timer = setTimeout(()=> abort.abort(), TIMEOUT_MS)

    const baseUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`
    // Ahora usamos directamente el tracking real (sin marcador) para que CardNet regrese a la URL correcta
    const successUrl = `${baseUrl}/store/checkout/success/${encodeURIComponent(tracking_number)}?from_gateway=1`
    const merchantName = formatMerchantName(
      process.env.CARDNET_MERCHANT_OWNER || 'ROMANA EBANISTERIA SRL',
      process.env.CARDNET_MERCHANT_CITY || 'LA ROMANA',
      process.env.CARDNET_MERCHANT_STATE || '   ',
      process.env.CARDNET_MERCHANT_COUNTRY || 'DO'
    )

    // Payload mínimo requerido por CardNet lab para /sessions
    const payload: Record<string,string> = {
      TransactionType: '0200',
      CurrencyCode: String(currency),
      AcquiringInstitutionCode: env.acquirer,
      MerchantType: env.merchantType,
      MerchantNumber: env.merchantNumber,
      MerchantTerminal: env.terminalId,
      MerchantTerminal_amex: '00000001',
    ReturnUrl: successUrl,
    CancelUrl: successUrl,
      PageLanguaje: 'ESP',
      OrdenId: orderId,
      TransactionId: transactionId,
      Tax: taxMinor,
      MerchantName: merchantName,
      Amount: amountMinor,
      Ipclient: clientIpFromReq(req),
      // (Opcional / placeholders de contacto; no bloquean)
      '3DS_email': customer.email || 'demo@example.com',
      '3DS_mobilePhone': (customer.phone || '18095551234').replace(/\D/g,''),
      '3DS_workPhone': (customer.phone || '18095551234').replace(/\D/g,''),
      '3DS_homePhone': (customer.phone || '18095551234').replace(/\D/g,''),
      '3DS_billAddr_line1': (customer.address || 'CALLE DEMO 123').toUpperCase().slice(0,50),
      '3DS_billAddr_line2': '',
      '3DS_billAddr_line3': (customer.address || 'CALLE DEMO 123').toUpperCase().slice(0,50),
      '3DS_billAddr_city': (customer.city || 'LA ROMANA').toUpperCase().slice(0,50),
      '3DS_billAddr_state': '12',
      '3DS_billAddr_country': '214',
      '3DS_billAddr_postcode': (customer.postalCode || '10111'),
      '3DS_shipAddr_line1': (customer.address || 'CALLE DEMO 123').toUpperCase().slice(0,50),
      '3DS_shipAddr_line2': '',
      '3DS_shipAddr_line3': (customer.address || 'CALLE DEMO 123').toUpperCase().slice(0,50),
      '3DS_shipAddr_city': (customer.city || 'LA ROMANA').toUpperCase().slice(0,50),
      '3DS_shipAddr_state': '12',
      '3DS_shipAddr_country': '214',
      '3DS_shipAddr_postcode': (customer.postalCode || '10111'),
    }

    const sessionResp = await fetch(`${env.baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: abort.signal
    })
    clearTimeout(timer)

    if (!sessionResp.ok) {
      const txt = await sessionResp.text().catch(()=> '')
      console.error('[CardNet] Fallo creando sesión', sessionResp.status, txt)
      return res.status(502).json({ error: 'CardNet session failed', status: sessionResp.status, details: txt })
    }
    const json = await sessionResp.json().catch(()=>null)
    if (!json || !json.SESSION || !json['session-key']) {
      console.error('[CardNet] Respuesta inválida de /sessions', json)
      return res.status(502).json({ error: 'Respuesta inválida de CardNet' })
    }

    const sessionId = json.SESSION as string
    const sessionKey = json['session-key'] as string

    // Guardar intent
    const intent: PaymentIntent = {
      orderId,
      sessionId,
      sessionKey,
      transactionId,
      currency: String(currency),
      amountMinor: parseInt(amountMinor,10),
      taxMinor: parseInt(taxMinor,10),
      status: 'created',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    savePaymentIntent(intent)

    const authorizePath = useCuotas ? env.cuotasPath : env.authorizePath
    const formUrl = `${env.baseUrl}${authorizePath}`

    // Campos para el POST de autorización (según docs: OrdenID / TransactionID / SESSION / MerchantNumber ... )
    // Reemplazo final del tracking real se hará en el cliente antes de submit (para no exponerlo antes de crear la orden)
    const fields: Record<string,string> = {
      OrdenID: orderId,
      TransactionID: transactionId,
      SESSION: sessionId,
      MerchantNumber: env.merchantNumber,
      MerchantTerminal: env.terminalId,
      Amount: amountMinor,
      CurrencyCode: String(currency),
  ReturnUrl: successUrl,
  CancelUrl: successUrl,
    }

    return res.status(200).json({ formUrl, fields, sessionId, orderId, transactionId })
  } catch (e:any) {
    const timeout = e?.name === 'AbortError'
    console.error('[CardNet] session error', timeout ? 'timeout' : e?.message || e)
    return res.status(500).json({ error: timeout ? 'Timeout creando sesión' : 'Error creando sesión', timeout })
  }
}

export const config = {
  api: { bodyParser: true }
}
