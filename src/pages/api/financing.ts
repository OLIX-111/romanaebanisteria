import type { NextApiRequest, NextApiResponse } from "next"
// @ts-ignore nodemailer types may not resolve fully under bundler resolution
import nodemailer from "nodemailer"

// Using SendGrid SMTP as in send-order-email.ts; allow env overrides for robustness
const SMTP_HOST = process.env.SMTP_HOST || "smtp.sendgrid.net"
const SMTP_PORT = Number(process.env.SMTP_PORT || 465)
const SMTP_SECURE = String(process.env.SMTP_SECURE || "true") === "true"
const SMTP_USER = process.env.SMTP_USER || "apikey"
const SMTP_PASS = process.env.SMTP_PASS || "***SENDGRID_KEY_REMOVED***"

const FROM_EMAIL = process.env.FINANCING_FROM_EMAIL || "info@grupochavon.com"
const INTERNAL_EMAIL = process.env.FINANCING_INTERNAL_EMAIL || "tecnologia@grupochavon.com"

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
})

function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(value || 0)
  } catch {
    return `${currency} ${Number(value || 0).toLocaleString()}`
  }
}

function sanitizeString(input: any): string {
  return (typeof input === "string" ? input : "").toString().trim()
}

function sanitizeCartItems(input: any): Array<{ name: string; qty: number; price: number; subtotal: number; currency: string; productId?: number }>{
  if (!Array.isArray(input)) return []
  return input
    .map((it) => {
      const name = sanitizeString(it?.name)
      const qty = Number(it?.qty || 0)
      const price = Number(it?.price || 0)
      const subtotal = Number(it?.subtotal || price * qty)
      const currency = sanitizeString(it?.currency) || "DOP"
      const productId = typeof it?.productId === "number" ? it.productId : undefined
      if (!name || !qty || !price) return null
      return { name, qty, price, subtotal, currency, productId }
    })
    .filter(Boolean) as Array<{ name: string; qty: number; price: number; subtotal: number; currency: string; productId?: number }>
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" })

    const body = req.body || {}

    const saleAmount = Number(body.saleAmount || 0)
    const downPayment = Number(body.downPayment || 0)
    const financedAmount = Number(body.financedAmount || 0)
    const saleCurrency = sanitizeString(body.saleCurrency) || "DOP"
    const cartItems = sanitizeCartItems(body.cartItems)
    const idType = sanitizeString(body.idType)
    const idNumber = sanitizeString(body.idNumber)
    const fullName = sanitizeString(body.fullName)
    const birthDate = sanitizeString(body.birthDate)
    const email = sanitizeString(body.email)
    const phone = sanitizeString(body.phone)
    const monthlyIncome = Number(body.monthlyIncome || 0)
    const incomeCurrency = sanitizeString(body.incomeCurrency) || saleCurrency
    const country = sanitizeString(body.country)
    const bankOption1 = sanitizeString(body.bankOption1)
    const bankOption2 = sanitizeString(body.bankOption2)
    const acceptTerms = Boolean(body.acceptTerms)
    const certifyInfo = Boolean(body.certifyInfo)

    const requiredErrors: string[] = []
    if (!saleAmount) requiredErrors.push("saleAmount")
    if (!downPayment && downPayment !== 0) requiredErrors.push("downPayment")
    // saleCurrency now defaults to DOP if not provided
    if (!idType) requiredErrors.push("idType")
    if (!idNumber) requiredErrors.push("idNumber")
    if (!fullName) requiredErrors.push("fullName")
    if (!birthDate) requiredErrors.push("birthDate")
    if (!email) requiredErrors.push("email")
    if (!phone) requiredErrors.push("phone")
    if (!monthlyIncome) requiredErrors.push("monthlyIncome")
    // incomeCurrency defaults to saleCurrency when missing
    if (!country) requiredErrors.push("country")
    if (!bankOption1) requiredErrors.push("bankOption1")
    if (!bankOption2) requiredErrors.push("bankOption2")
    if (!acceptTerms) requiredErrors.push("acceptTerms")
    if (!certifyInfo) requiredErrors.push("certifyInfo")

    if (requiredErrors.length) {
      return res.status(400).json({ message: "Missing or invalid fields", fields: requiredErrors })
    }

    // Age validation: must be 18+
    try {
      const b = new Date(birthDate)
      const now = new Date()
      const minBirth = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate())
      if (isNaN(b.getTime()) || b > minBirth) {
        return res.status(400).json({ message: "Debes ser mayor de 18 años.", fields: ["birthDate"] })
      }
    } catch {}

    const submittedAt = new Date().toLocaleString("es-DO", { hour12: false })

    const summaryRows = [
      { k: "Monto solicitado", v: formatCurrency(saleAmount, saleCurrency) },
      { k: "Pago inicial", v: formatCurrency(downPayment, saleCurrency) },
      { k: "Monto a financiar", v: formatCurrency(financedAmount, saleCurrency) },
      { k: "Moneda", v: saleCurrency },
      { k: "Tipo de identificación", v: idType },
      { k: "Número de identificación", v: idNumber },
      { k: "Nombre completo", v: fullName },
      { k: "Fecha de nacimiento", v: birthDate },
      { k: "Correo electrónico", v: email },
      { k: "Teléfono", v: phone },
      { k: "Ingreso mensual", v: formatCurrency(monthlyIncome, incomeCurrency) },
      { k: "Moneda de ingreso", v: incomeCurrency },
      { k: "País de residencia", v: country },
      { k: "Opción de banco 1", v: bankOption1 },
      { k: "Opción de banco 2", v: bankOption2 },
      { k: "Aceptó términos", v: acceptTerms ? "Sí" : "No" },
      { k: "Certificación de datos", v: certifyInfo ? "Sí" : "No" },
      { k: "Fecha/Hora", v: submittedAt },
    ]

    const tableHtml = summaryRows
      .map(r => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;color:#555;">${r.k}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;color:#111;font-weight:600;">${r.v}</td>
        </tr>`)
      .join("")

    // Optional cart section
    const cartTotal = cartItems.reduce((s, it) => s + (Number(it.subtotal) || 0), 0)
    const cartRowsHtml = cartItems
      .map((it) => `
        <tr>
          <td style="padding:6px;border-bottom:1px solid #f0f0f0;color:#333;">${it.name}</td>
          <td style="padding:6px;border-bottom:1px solid #f0f0f0;color:#555;" align="right">${it.qty}</td>
          <td style="padding:6px;border-bottom:1px solid #f0f0f0;color:#555;" align="right">${formatCurrency(it.price, it.currency)}</td>
          <td style="padding:6px;border-bottom:1px solid #f0f0f0;color:#111;font-weight:600;" align="right">${formatCurrency(it.subtotal, it.currency)}</td>
        </tr>`)
      .join("")
    const cartHtmlSection = cartItems.length
      ? `
        <h3 style="margin:24px 0 8px 0;color:#111;font-size:16px;">Carrito a financiar</h3>
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          <thead>
            <tr>
              <th align="left" style="padding:6px;border-bottom:2px solid #e5e5e5;color:#555;font-size:12px;">Producto</th>
              <th align="right" style="padding:6px;border-bottom:2px solid #e5e5e5;color:#555;font-size:12px;">Cant.</th>
              <th align="right" style="padding:6px;border-bottom:2px solid #e5e5e5;color:#555;font-size:12px;">Precio</th>
              <th align="right" style="padding:6px;border-bottom:2px solid #e5e5e5;color:#555;font-size:12px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${cartRowsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:8px;border-top:2px solid #e5e5e5;color:#111;font-weight:600;">Total del carrito</td>
              <td align="right" style="padding:8px;border-top:2px solid #e5e5e5;color:#111;font-weight:700;">${formatCurrency(cartTotal, saleCurrency)}</td>
            </tr>
          </tfoot>
        </table>
      `
      : ""

    const internalHtml = `
      <div style="font-family:Arial, Helvetica, sans-serif;background:#f6f6f6;padding:24px 0;">
        <table width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #eaeaea;">
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #eaeaea;">
              <h2 style="margin:0;color:#111;">Nueva solicitud de financiamiento</h2>
              <p style="margin:4px 0 0 0;color:#666;">${fullName} &lt;${email}&gt;</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                ${tableHtml}
              </table>
              ${cartHtmlSection}
            </td>
          </tr>
        </table>
      </div>
    `

    const clientHtml = `
      <div style="font-family:Arial, Helvetica, sans-serif;background:#f6f6f6;padding:24px 0;">
        <table width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #eaeaea;">
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #eaeaea;">
              <h2 style="margin:0;color:#111;">Hemos recibido tu solicitud</h2>
              <p style="margin:8px 0 0 0;color:#555;">Gracias, ${fullName}. Tu evaluación sin costo puede tomar hasta 72 horas. Te contactaremos por correo o teléfono.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <h3 style="margin:0 0 8px 0;color:#111;font-size:16px;">Resumen</h3>
              <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                ${tableHtml}
              </table>
              ${cartItems.length ? `
                <h3 style=\"margin:16px 0 8px 0;color:#111;font-size:16px;\">Detalle de producto(s) a financiar</h3>
                <table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"border-collapse:collapse;\">
                  <thead>
                    <tr>
                      <th align=\"left\" style=\"padding:6px;border-bottom:2px solid #e5e5e5;color:#555;font-size:12px;\">Producto</th>
                      <th align=\"right\" style=\"padding:6px;border-bottom:2px solid #e5e5e5;color:#555;font-size:12px;\">Cant.</th>
                      <th align=\"right\" style=\"padding:6px;border-bottom:2px solid #e5e5e5;color:#555;font-size:12px;\">Precio</th>
                      <th align=\"right\" style=\"padding:6px;border-bottom:2px solid #e5e5e5;color:#555;font-size:12px;\">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${cartRowsHtml}
                  </tbody>
                </table>
              ` : ""}
              <p style="margin:16px 0 0 0;color:#777;font-size:12px;">ROMAna Ebanistería</p>
            </td>
          </tr>
        </table>
      </div>
    `

    // 1) Internal email
    await transporter.sendMail({
      from: `ROMAna Ebanistería <${FROM_EMAIL}>`,
      to: INTERNAL_EMAIL,
      subject: `Nueva solicitud de financiamiento - ${fullName}`,
      html: internalHtml,
      replyTo: email || undefined,
    })

    // 2) Client confirmation
    if (email) {
      await transporter.sendMail({
        from: `ROMAna Ebanistería <${FROM_EMAIL}>`,
        to: email,
        subject: "Confirmación de solicitud de financiamiento",
        html: clientHtml,
      })
    }

    return res.status(200).json({ status: "ok" })
  } catch (error: any) {
    console.error("Error in /api/financing:", error)
    return res.status(500).json({ message: error.message || "Error" })
  }
}


