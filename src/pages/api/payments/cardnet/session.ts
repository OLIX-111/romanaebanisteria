import type { NextApiRequest, NextApiResponse } from "next"
import { 
  cardnetEnv, 
  clientIpFromReq, 
  formatMerchantName, 
  toMinor12, 
  generateTransactionId,
  savePaymentIntent,
  getProvinceCode,
  formatPhoneForCardNet,
  type ThreeDSData,
  type PaymentIntent
} from "@/lib/cardnet"

const TIMEOUT_MS = 15000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const abort = new AbortController()
    const timeout = setTimeout(() => abort.abort(), TIMEOUT_MS)

    const {
      orderId,
      amount,           // in units (e.g., 881.00)
      tax = 0,          // in units (e.g., 158.58)
      currency = process.env.CARDNET_CURRENCY || "214",
      transactionId = generateTransactionId(),
      useCuotas = false,
      threeDS,          // ThreeDSData object
    } = req.body || {}

    // Validation
    if (!orderId || !amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Missing or invalid orderId/amount" })
    }

    if (!threeDS?.email || !threeDS?.mobilePhone || !threeDS?.billAddr_line1 || !threeDS?.billAddr_city) {
      return res.status(400).json({ error: "Missing required 3DS data" })
    }

    // Format phone numbers according to CardNet requirements
    const mobilePhone = formatPhoneForCardNet(threeDS.mobilePhone)
    const workPhone = formatPhoneForCardNet(threeDS.workPhone || threeDS.mobilePhone)
    const homePhone = formatPhoneForCardNet(threeDS.homePhone || threeDS.mobilePhone)

    // Get province codes
    const billStateCode = getProvinceCode(threeDS.billAddr_state || "")
    const shipStateCode = getProvinceCode(threeDS.shipAddr_state || threeDS.billAddr_state || "")

    const config = cardnetEnv()
    const ip = clientIpFromReq(req)
    
    // Convert amounts to minor units (centavos)
    const amountMinor = toMinor12(Number(amount))
    const taxMinor = toMinor12(Number(tax))
    
    const merchantName = formatMerchantName(
      process.env.CARDNET_MERCHANT_OWNER || "ROMANA EBANISTERIA SRL",
      process.env.CARDNET_MERCHANT_CITY || "LA ROMANA",
      process.env.CARDNET_MERCHANT_STATE || "   ",
      process.env.CARDNET_MERCHANT_COUNTRY || "DO"
    )

    // Build CardNet payload
    const payload: Record<string, any> = {
      TransactionType: "0200",                                    // normal sale
      CurrencyCode: String(currency),
      AcquiringInstitutionCode: String(config.acquirer),
      MerchantType: String(config.merchantType),
      MerchantNumber: String(config.merchantNumber),
      MerchantTerminal: String(config.terminalId),
      MerchantTerminal_amex: "00000001",                          // default AMEX terminal
      ReturnUrl: process.env.CARDNET_RETURN_URL || `${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}/api/debug/cardnet-capture`,
      CancelUrl: process.env.CARDNET_CANCEL_URL || `${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}/api/debug/cardnet-capture`,
      PageLanguaje: process.env.CARDNET_PAGE_LANG || "ESP",
      OrdenId: String(orderId).slice(0, 20),                      // max 20 chars
      TransactionId: String(transactionId).padStart(6, "0"),
      Tax: taxMinor,
      MerchantName: merchantName,
      AVS: `${threeDS.billAddr_line1} ${threeDS.billAddr_line2 || ""} ${threeDS.billAddr_city}`.trim().slice(0, 50),
      Amount: amountMinor,
      Ipclient: ip,
      
      // 3DS mandatory fields (v1.2 requirements) - EXACT FORMAT REQUIRED
      "3DS_email": threeDS.email,
      "3DS_mobilePhone": mobilePhone,
      "3DS_workPhone": workPhone,
      "3DS_homePhone": homePhone,
      "3DS_billAddr_line1": threeDS.billAddr_line1.toUpperCase().slice(0, 50),
      "3DS_billAddr_line2": (threeDS.billAddr_line2 || "").toUpperCase().slice(0, 50),
      "3DS_billAddr_line3": (threeDS.billAddr_line3 || threeDS.billAddr_line1).toUpperCase().slice(0, 50),
      "3DS_billAddr_city": threeDS.billAddr_city.toUpperCase().slice(0, 50),
      "3DS_billAddr_state": billStateCode,
      "3DS_billAddr_country": "214", // Dominican Republic country code for CardNet
      "3DS_billAddr_postcode": threeDS.billAddr_postcode || "10111",
      
      // Shipping (mandatory, fallback to billing if not provided)
      "3DS_shipAddr_line1": (threeDS.shipAddr_line1 || threeDS.billAddr_line1).toUpperCase().slice(0, 50),
      "3DS_shipAddr_line2": (threeDS.shipAddr_line2 || threeDS.billAddr_line2 || "").toUpperCase().slice(0, 50),
      "3DS_shipAddr_line3": (threeDS.shipAddr_line3 || threeDS.billAddr_line3 || threeDS.shipAddr_line1 || threeDS.billAddr_line1).toUpperCase().slice(0, 50),
      "3DS_shipAddr_city": (threeDS.shipAddr_city || threeDS.billAddr_city).toUpperCase().slice(0, 50),
      "3DS_shipAddr_state": shipStateCode,
      "3DS_shipAddr_country": "214", // Dominican Republic country code for CardNet
      "3DS_shipAddr_postcode": threeDS.shipAddr_postcode || threeDS.billAddr_postcode || "10111",
    }

    console.log(`[CardNet] Creating session for order ${orderId}, amount: ${amount}, tax: ${tax}`)
    console.log(`[CardNet] Configuration:`, {
      env: config.env,
      baseUrl: config.baseUrl,
      merchantNumber: config.merchantNumber,
      terminalId: config.terminalId,
      returnUrl: payload.ReturnUrl,
      cancelUrl: payload.CancelUrl,
    })
    console.log(`[CardNet] Payload summary:`, {
      TransactionType: payload.TransactionType,
      Amount: payload.Amount,
      Tax: payload.Tax,
      OrdenId: payload.OrdenId,
      TransactionId: payload.TransactionId,
      email: payload["3DS_email"],
      phone: payload["3DS_mobilePhone"],
    })
    console.log(`[CardNet] 3DS Data:`, {
      email: payload["3DS_email"],
      mobilePhone: payload["3DS_mobilePhone"],
      workPhone: payload["3DS_workPhone"],
      homePhone: payload["3DS_homePhone"],
      billAddr_line1: payload["3DS_billAddr_line1"],
      billAddr_line2: payload["3DS_billAddr_line2"],
      billAddr_line3: payload["3DS_billAddr_line3"],
      billAddr_city: payload["3DS_billAddr_city"],
      billAddr_state: payload["3DS_billAddr_state"],
      billAddr_country: payload["3DS_billAddr_country"],
      billAddr_postcode: payload["3DS_billAddr_postcode"],
      shipAddr_line1: payload["3DS_shipAddr_line1"],
      shipAddr_city: payload["3DS_shipAddr_city"],
      shipAddr_state: payload["3DS_shipAddr_state"],
      shipAddr_country: payload["3DS_shipAddr_country"],
      shipAddr_postcode: payload["3DS_shipAddr_postcode"],
    })

    const response = await fetch(`${config.baseUrl}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: abort.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "")
      console.error(`[CardNet] Session creation failed: ${response.status} ${response.statusText}`, errorText)
      return res.status(502).json({ 
        error: "CardNet session failed", 
        details: errorText,
        status: response.status 
      })
    }

    const data = await response.json()
    
    if (!data.SESSION || !data["session-key"]) {
      console.error("[CardNet] Invalid session response", data)
      return res.status(502).json({ error: "Invalid session response from CardNet" })
    }

    // Save payment intent
    const intent: PaymentIntent = {
      orderId: String(orderId),
      sessionId: data.SESSION,
      sessionKey: data["session-key"],
      transactionId: String(transactionId).padStart(6, "0"),
      currency: String(currency),
      amountMinor: parseInt(amountMinor, 10),
      taxMinor: parseInt(taxMinor, 10),
      status: "created",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    savePaymentIntent(intent)

    console.log(`[CardNet] Session created: ${data.SESSION} for order ${orderId}`)

    // Determine authorize URL based on cuotas preference
    const authorizePath = useCuotas ? config.cuotasPath : config.authorizePath
    const authorizeUrl = `${config.baseUrl}${authorizePath}`

    return res.status(200).json({
      sessionId: data.SESSION,
      authorizeUrl,
      orderId: intent.orderId,
      transactionId: intent.transactionId,
    })

  } catch (err: any) {
    const isTimeout = err?.name === "AbortError"
    console.error("[CardNet] Session creation exception:", isTimeout ? "timeout" : err?.message || err)
    
    return res.status(500).json({ 
      error: isTimeout ? "Request timeout" : "Internal server error",
      timeout: isTimeout 
    })
  }
}
