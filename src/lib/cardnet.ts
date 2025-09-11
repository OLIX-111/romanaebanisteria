// CardNet payment gateway utilities
export interface CardNetConfig {
  env: 'lab' | 'prod'
  baseUrl: string
  authorizePath: string
  cuotasPath: string
  merchantNumber: string
  terminalId: string
  merchantType: string
  acquirer: string
}

export interface PaymentIntent {
  orderId: string
  sessionId?: string
  sessionKey?: string
  transactionId: string
  currency: string
  amountMinor: number
  taxMinor: number
  status: 'created' | 'redirected' | 'approved' | 'failed' | 'cancelled' | 'expired' | 'error' | 'preauthorized' | 'captured'
  responseCode?: string
  authCode?: string
  rrn?: string
  maskedPan?: string
  remoteRespCode?: string
  txToken?: string
  createdAt: number
  updatedAt: number
}

export interface ThreeDSData {
  email: string
  mobilePhone: string
  workPhone: string
  homePhone: string
  billAddr_line1: string
  billAddr_line2: string
  billAddr_line3: string
  billAddr_city: string
  billAddr_state: string
  billAddr_country: string
  billAddr_postcode: string
  shipAddr_line1: string
  shipAddr_line2: string
  shipAddr_line3: string
  shipAddr_city: string
  shipAddr_state: string
  shipAddr_country: string
  shipAddr_postcode: string
}

export function toMinor12(amount: number): string {
  // Convert amount in units (e.g., 881.00 DOP) to minor units 12-digit 0-padded
  const minor = Math.round(amount * 100)
  const s = String(minor)
  if (s.length > 12) throw new Error("Amount too large for CardNet")
  return s.padStart(12, "0")
}

export function fromMinor(minorStr: string): number {
  return parseInt(minorStr, 10) / 100
}

export function formatMerchantName(owner: string, city: string, state3: string, country2: string): string {
  const sanitize = (str: string, len: number) =>
    (str ?? "").toUpperCase().normalize("NFKD").replace(/[^\x20-\x7E]/g, "").slice(0, len).padEnd(len, " ")
  
  return sanitize(owner, 22) + sanitize(city, 13) + sanitize(state3, 3) + sanitize(country2, 2)
}

export function clientIpFromReq(req: any): string {
  const xf = (req.headers["x-forwarded-for"] || "") as string
  const ip = xf.split(",")[0]?.trim() || req.socket?.remoteAddress || "0.0.0.0"
  return ip.replace("::ffff:", "")
}

export function cardnetEnv(): CardNetConfig {
  const env = process.env.CARDNET_ENV === "prod" ? "prod" : "lab"
  
  if (env === "prod") {
    return {
      env,
      baseUrl: process.env.CARDNET_PROD_BASE_URL!,
      authorizePath: process.env.CARDNET_PROD_AUTHORIZE_PATH || "/authorize",
      cuotasPath: process.env.CARDNET_PROD_CUOTAS_PATH || "/servicios/pagosxcuotas/cardnetPagosCuotas",
      merchantNumber: process.env.CARDNET_PROD_MERCHANT_NUMBER!,
      terminalId: process.env.CARDNET_PROD_TERMINAL_ID!,
      merchantType: process.env.CARDNET_PROD_MERCHANT_TYPE!,
      acquirer: process.env.CARDNET_PROD_ACQUIRER || "349",
    }
  } else {
    return {
      env,
      baseUrl: process.env.CARDNET_LAB_BASE_URL || "https://lab.cardnet.com.do",
      authorizePath: process.env.CARDNET_LAB_AUTHORIZE_PATH || "/authorize",
      cuotasPath: process.env.CARDNET_LAB_CUOTAS_PATH || "/servicios/pagosxcuotas/cardnetPagosCuotas",
      merchantNumber: process.env.CARDNET_LAB_MERCHANT_NUMBER || "349000000",
      terminalId: process.env.CARDNET_LAB_TERMINAL_ID || "58585858",
      merchantType: process.env.CARDNET_LAB_MERCHANT_TYPE || "7997",
      acquirer: process.env.CARDNET_LAB_ACQUIRER || "349",
    }
  }
}

export function normalizeResponse(resp: any) {
  const approved = resp?.ResponseCode === "00"
  return {
    orderId: resp?.OrdenID,
    transactionId: resp?.TransactionID,
    responseCode: resp?.ResponseCode,
    approved,
    authCode: resp?.AuthorizationCode,
    rrn: resp?.RetrivalReferenceNumber || resp?.RetrievalReferenceNumber,
    maskedPan: resp?.CreditCardNumber || resp?.CreditcardNumber,
    remoteRespCode: resp?.RemoteResponseCode,
    txToken: resp?.TxToken,
    message: getResponseMessage(resp?.ResponseCode),
  }
}

export function getResponseMessage(code: string): string {
  const messages: Record<string, string> = {
    "00": "Transacción aprobada",
    "01": "Llamar al Banco",
    "02": "Llamar al Banco", 
    "03": "Comercio Inválido",
    "04": "Transacción rechazada",
    "05": "Transacción rechazada",
    "06": "Error en mensaje",
    "07": "Tarjeta rechazada",
    "08": "Llamar al Banco",
    "09": "Procesando solicitud",
    "10": "Aprobación parcial",
    "12": "Transacción inválida",
    "13": "Monto inválido",
    "14": "Cuenta inválida",
    "19": "Reintentar transacción",
    "33": "Tarjeta expirada",
    "39": "Tarjeta inválida",
    "51": "Fondos insuficientes",
    "54": "Tarjeta vencida",
    "57": "Transacción no permitida",
    "61": "Excedió límite de retiro",
    "62": "Tarjeta restringida",
    "65": "Excedió cantidad de intentos",
    "75": "PIN excedió límite de intentos",
    "81": "PIN inválido",
    "94": "Transacción duplicada",
    "99": "Error CVV/CVC",
    "TF": "Autenticación 3DSecure rechazada o no completada",
  }
  
  return messages[code] || `Error de transacción (Código: ${code})`
}

export function generateTransactionId(): string {
  // Generate 6-digit unique transaction ID
  return String(Date.now() % 1000000).padStart(6, "0")
}

export function generateOrderId(): string {
  // Generate unique order ID (max 20 chars)
  const timestamp = Date.now()
  return `ORD-${timestamp}`
}

// Map Dominican provinces to CardNet state codes
export function getProvinceCode(provinceName: string): string {
  const provinceMap: Record<string, string> = {
    // Major provinces
    'Distrito Nacional': '01',
    'Santo Domingo': '32',
    'Santiago': '25',
    'La Romana': '12',
    'Puerto Plata': '18',
    'San Cristóbal': '21',
    'La Vega': '13',
    'Moca': '14',
    'San Pedro de Macorís': '23',
    'Barahona': '04',
    'Higüey': '11',
    'Mao': '19',
    'Azua': '02',
    'Bani': '03',
    'Bonao': '28',
    'Cotuí': '29',
    'Jarabacoa': '30',
    'Nagua': '15',
    'Salcedo': '31',
    'San Francisco de Macorís': '22',
    'Samaná': '20',
    'Monte Cristi': '16',
    'Dajabón': '05',
    'Elías Piña': '06',
    'San Juan': '24',
    'Bahoruco': '33',
    'Independencia': '10',
    'Pedernales': '17',
    'Monte Plata': '29',
    'Hato Mayor': '09',
    'El Seibo': '08',
    'San José de Ocoa': '31',
    'Peravia': '17',
    'Espaillat': '07',
    'Hermanas Mirabal': '19',
    'Duarte': '06',
    'María Trinidad Sánchez': '14',
    'Valverde': '27',
    'Santiago Rodríguez': '26',
  }
  
  // Clean and normalize province name
  const cleanName = provinceName.trim()
  
  // Direct match
  if (provinceMap[cleanName]) {
    return provinceMap[cleanName]
  }
  
  // Partial match
  for (const [province, code] of Object.entries(provinceMap)) {
    if (province.toLowerCase().includes(cleanName.toLowerCase()) || 
        cleanName.toLowerCase().includes(province.toLowerCase())) {
      return code
    }
  }
  
  // Default fallback
  return '01' // Distrito Nacional as default
}

// Format phone number for CardNet (remove all non-digits)
export function formatPhoneForCardNet(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  // Ensure it starts with country code for DR (1809, 1829, 1849)
  if (digits.length === 10 && digits.startsWith('809')) {
    return `1${digits}`
  }
  if (digits.length === 10 && (digits.startsWith('829') || digits.startsWith('849'))) {
    return `1${digits}`
  }
  return digits.length >= 10 ? digits : `1809${digits}`.slice(0, 15)
}

// Simple in-memory storage for payment intents (replace with database in production)
const paymentIntents = new Map<string, PaymentIntent>()

export function savePaymentIntent(intent: PaymentIntent): PaymentIntent {
  paymentIntents.set(intent.sessionId || intent.orderId, intent)
  return intent
}

export function getPaymentIntent(sessionId: string): PaymentIntent | null {
  return paymentIntents.get(sessionId) || null
}

export function updatePaymentIntent(sessionId: string, updates: Partial<PaymentIntent>): PaymentIntent | null {
  const existing = paymentIntents.get(sessionId)
  if (!existing) return null
  
  const updated = { ...existing, ...updates, updatedAt: Date.now() }
  paymentIntents.set(sessionId, updated)
  return updated
}
