import type { NextApiRequest, NextApiResponse } from 'next'

// Endpoint para crear sesión CardNET (QA)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const {
    amount,
    orderId,
    tax,
    email,
    mobilePhone,
    workPhone,
    homePhone,
    billAddr_line1,
    billAddr_line2,
    billAddr_line3,
    billAddr_city,
    billAddr_state,
    billAddr_country,
    billAddr_postCode,
    ipClient
  } = req.body

  if (!amount || !orderId) {
    return res.status(400).json({ error: 'Datos insuficientes' })
  }

  // Detect base URL dynamically so it works in dev/prod without hardcoding
  const host = req.headers.host
  const proto = (req.headers['x-forwarded-proto'] as string) || 'http'
  const baseUrl = `${proto}://${host}`

  const successUrl = `${baseUrl}/cardnet/success`

  const payload = {
    TransactionType: '0200',
    CurrencyCode: '214',
    AcquiringInstitutionCode: '349',
    MerchantType: '7997',
    MerchantNumber: '349219968',
    MerchantTerminal: '99947395',
    MerchantTerminal_amex: '00000001',
    // Unificamos para que siempre retorne al success (éxito o fallo)
    ReturnUrl: successUrl,
    CancelUrl: successUrl,
    PageLanguaje: 'ESP',
    OrdenId: orderId,
    TransactionId: (Math.floor(Math.random() * 900000) + 100000).toString(),
    Tax: tax || '000000000000',
    MerchantName: 'Romana Ebanistería',
    AVS: `${billAddr_line1} ${billAddr_city} ${billAddr_state} ${billAddr_country}`.trim(),
    Amount: amount,
    Ipclient: ipClient || '127.0.0.1',
    '3DS_email': email,
    '3DS_mobilePhone': mobilePhone,
    '3DS_workPhone': workPhone,
    '3DS_homePhone': homePhone,
    '3DS_billAddr_line1': billAddr_line1,
    '3DS_billAddr_line2': billAddr_line2,
    '3DS_billAddr_line3': billAddr_line3,
    '3DS_billAddr_city': billAddr_city,
    '3DS_billAddr_state': billAddr_state,
    '3DS_billAddr_country': billAddr_country,
    '3DS_billAddr_postCode': billAddr_postCode
  }

  try {
    const response = await fetch('https://lab.cardnet.com.do/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error creando sesión en CardNET', status: response.status })
    }
    const data = await response.json()
    res.status(200).json(data)
  } catch (error: any) {
    res.status(500).json({ error: 'Error interno', details: error?.message })
  }
}
