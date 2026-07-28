import type { NextApiRequest, NextApiResponse } from "next"
// @ts-ignore nodemailer types may not resolve fully under bundler resolution
import nodemailer from "nodemailer"

// WARNING: Credenciales embebidas por petición del cliente. En producción, usar variables de entorno/secretos.
const SMTP_HOST = "smtp.sendgrid.net"
const SMTP_PORT = 465 // SSL
const SMTP_SECURE = true
const SMTP_USER = "apikey"
const SMTP_PASS = "***SENDGRID_KEY_REMOVED***"

const FROM_EMAIL = "info@grupochavon.com"
const INTERNAL_EMAILS = ["tecnologia@grupochavon.com", "info@grupochavon.com"]

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
})

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(amount || 0)
  } catch {
    return `RD$ ${Number(amount || 0).toLocaleString()}`
  }
}

function buildOrderHtml(data: any, opts: { client: boolean }): string {
  const currency = data.currency || "DOP"
  const storeUrl = "www.romanaebanisteria.com"
  const logoUrl = "https://storage.googleapis.com/portfoliprofiles/GG%20studio/RomanaEbanisteri%CC%81a.png"
  const items = (data.items || []) as Array<any>
  const itemsRows = items
    .map(
      (it) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;display:flex;align-items:center;gap:12px;">
            <img src="${it.image || ""}" width="48" height="48" style="border:1px solid #eee;object-fit:cover" alt="${it.name}"/>
            <div>
              <div style="font-weight:600;color:#111;">${it.name}</div>
              ${it.sku ? `<div style='font-size:12px;color:#666'>SKU: ${it.sku}</div>` : ""}
            </div>
          </td>
          <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;color:#111;">${it.num}</td>
          <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;color:#111;">${formatCurrency(it.subtotal || (it.price * it.num), currency)}</td>
        </tr>
      `
    )
    .join("")

  const customerBlock = `
    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:8px;">
      <tr>
        <td style="padding:6px 0;color:#444;font-size:14px;">${data.contact_name || ""}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#444;font-size:14px;">${data.contact_email || ""}${data.contact_phone ? ` • ${data.contact_phone}` : ""}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#444;font-size:14px;">${[data.shipping_address, data.shipping_suburb, data.shipping_state, data.shipping_postcode, data.shipping_country].filter(Boolean).join(", ")}</td>
      </tr>
    </table>
  `

  return `
  <div style="background:#f6f6f6;padding:24px 0;font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #eaeaea;">
      <tr>
        <td style="padding:20px 24px;border-bottom:1px solid #eaeaea;display:flex;align-items:center;gap:12px;">
          <img src="${logoUrl}" width="140" alt="La Fabbrica"/>
          <div style="margin-left:auto;text-align:right;">
            <div style="font-size:12px;color:#666;">Orden</div>
            <div style="font-size:16px;font-weight:700;color:#111;">#${data.order_no}</div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 24px;">
          <h2 style="margin:0 0 6px 0;color:#111;font-size:18px;">${opts.client ? "Gracias por tu compra" : "Nueva orden recibida"}</h2>
          <p style="margin:0 0 16px 0;color:#555;font-size:14px;">${opts.client ? "Hemos procesado tu pedido con éxito. Aquí tienes el resumen:" : "Se ha generado una nueva orden en la tienda."}</p>

          <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:8px;">
            <thead>
              <tr>
                <th style="text-align:left;padding:12px;border-bottom:2px solid #111;color:#111;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Producto</th>
                <th style="text-align:center;padding:12px;border-bottom:2px solid #111;color:#111;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Cant.</th>
                <th style="text-align:right;padding:12px;border-bottom:2px solid #111;color:#111;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;border-top:1px solid #eee;padding-top:8px;">
            <tr>
              <td style="text-align:right;color:#666;font-size:14px;padding:4px 0;">Subtotal</td>
              <td style="text-align:right;color:#111;font-weight:600;font-size:14px;padding:4px 0;width:160px;">${formatCurrency(data.subtotal || 0, currency)}</td>
            </tr>
            <tr>
              <td style="text-align:right;color:#666;font-size:14px;padding:4px 0;">Descuentos</td>
              <td style="text-align:right;color:#111;font-weight:600;font-size:14px;padding:4px 0;">${formatCurrency(data.discount_total || 0, currency)}</td>
            </tr>
            <tr>
              <td style="text-align:right;color:#111;font-size:15px;padding:8px 0;border-top:1px solid #eee;">Total</td>
              <td style="text-align:right;color:#111;font-weight:700;font-size:16px;padding:8px 0;border-top:1px solid #eee;">${formatCurrency(data.total || data.total_price || 0, currency)}</td>
            </tr>
          </table>

          <div style="margin-top:20px; display:flex; gap:24px; flex-wrap:wrap;">
            <div style="flex:1; min-width:260px;">
              <div style="font-weight:700;color:#111;margin-bottom:6px;font-size:14px;">Datos del cliente</div>
              ${customerBlock}
            </div>
          </div>

          <div style="margin-top:24px;color:#666;font-size:12px;">
            ¿Necesitas ayuda? Escríbenos a <a href="mailto:info@grupochavon.com" style="color:#111;">info@grupochavon.com</a> o visita <a href="${storeUrl}" style="color:#111;">${storeUrl}</a>.
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px;border-top:1px solid #eaeaea;background:#fafafa;color:#999;font-size:12px;text-align:center;">
          La Fabbrica · La Romana, República Dominicana
        </td>
      </tr>
    </table>
  </div>
  `
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" })

    const { order, toEmail } = req.body || {}
    if (!order || !toEmail) return res.status(400).json({ message: "Missing order or toEmail" })

    const data = order?.data || {}

    const clientHtml = buildOrderHtml(data, { client: true })
    const internalHtml = buildOrderHtml(data, { client: false })

    // Mail to client
    await transporter.sendMail({
      from: `La Fabbrica <${FROM_EMAIL}>`,
      to: toEmail,
      subject: `Confirmación de pedido #${data.order_no}`,
      html: clientHtml,
    })

    // Mail to internal team
    await transporter.sendMail({
      from: `La Fabbrica <${FROM_EMAIL}>`,
      to: INTERNAL_EMAILS.join(","),
      replyTo: data.contact_email || toEmail,
      subject: `Nueva orden #${data.order_no}`,
      html: internalHtml,
    })

    return res.status(200).json({ status: 'ok' })
  } catch (error: any) {
    console.error('Error sending order email:', error)
    return res.status(500).json({ message: error.message || 'Error' })
  }
}


