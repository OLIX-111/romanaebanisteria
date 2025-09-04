import type { NextApiRequest, NextApiResponse } from 'next'
// @ts-ignore
import nodemailer from 'nodemailer'

interface OrderSnapshotItem {
  id: string
  name: string
  quantity: number
  price: number
  image?: string | null
  productId?: string
  variantId?: string
}
interface OrderSnapshot {
  orderId: string
  amount: number
  amountMinorUnits: string
  currency: string
  createdAt: number
  items: OrderSnapshotItem[]
  totals: { subtotal: number; tax: number; shipping: number; grandTotal: number }
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    province: string
    postalCode: string
    notes: string
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' })
  try {
    const { snapshot, payment } = req.body as { snapshot: OrderSnapshot; payment?: any }
    if (!snapshot || !snapshot.orderId || !snapshot.customer?.email) {
      return res.status(400).json({ message: 'Datos incompletos' })
    }

    // TODO: mover a variables de entorno seguras
    const SMTP_HOST = 'smtp.sendgrid.net'
    const SMTP_PORT = 465
    const SMTP_SECURE = true
    const SMTP_USER = 'apikey'
    const SMTP_PASS = '***SENDGRID_KEY_REMOVED***'

    const FROM_EMAIL = 'info@grupochavon.com'
    const INTERNAL_EMAILS = ['tecnologia@grupochavon.com', 'info@grupochavon.com']

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })

    const createdAt = new Date(snapshot.createdAt || Date.now())
    const issuedAtStr = createdAt.toLocaleString('es-DO', { hour12: false })

    const trackingCode = generateTrackingCode(snapshot.orderId)

    const itemsRows = snapshot.items.map(i => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;line-height:1.4;">${escapeHtml(i.name)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:center;">${i.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:right;">${formatCurrency(i.price)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:right;">${formatCurrency(i.price * i.quantity)}</td>
      </tr>`).join('')

    const totalsHtml = `
      <tr>
        <td colspan="3" style="padding:8px 12px;font-size:12px;text-align:right;color:#555;">Subtotal</td>
        <td style="padding:8px 12px;font-size:13px;text-align:right;font-weight:600;">${formatCurrency(snapshot.totals.subtotal)}</td>
      </tr>
      <tr>
        <td colspan="3" style="padding:8px 12px;font-size:12px;text-align:right;color:#555;">Envío</td>
        <td style="padding:8px 12px;font-size:13px;text-align:right;font-weight:600;">${formatCurrency(snapshot.totals.shipping)}</td>
      </tr>
      <tr>
        <td colspan="3" style="padding:12px 12px;font-size:12px;text-align:right;color:#111;border-top:2px solid #111;">Total</td>
        <td style="padding:12px 12px;font-size:14px;text-align:right;font-weight:700;border-top:2px solid #111;">${formatCurrency(snapshot.totals.grandTotal)}</td>
      </tr>`

    const paymentHtml = payment ? buildPaymentTable(payment) : ''

    const baseWrapperTop = `<div style="background:#f5f5f5;padding:30px 0;font-family:Arial,Helvetica,sans-serif;">\n<table width="100%" cellspacing="0" cellpadding="0" style="max-width:780px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;">`
    const baseWrapperBottom = `</table>\n</div>`

    const internalHtml = `
      ${baseWrapperTop}
      <tr>
        <td style="padding:28px 32px;border-bottom:1px solid #e5e5e5;">
          <h1 style="margin:0;font-size:20px;color:#111;font-weight:600;letter-spacing:-0.5px;">Nueva orden confirmada</h1>
          <p style="margin:10px 0 0 0;font-size:13px;color:#555;">Pedido ${snapshot.orderId} · ${issuedAtStr}</p>
          <p style="margin:4px 0 0 0;font-size:12px;color:#777;">Tracking: <strong>${trackingCode}</strong></p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 32px;">
          <h2 style="margin:0 0 16px 0;font-size:15px;color:#111;font-weight:600;">Detalle de artículos</h2>
          <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">\n<thead><tr><th align="left" style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #111;">Artículo</th><th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #111;">Cant.</th><th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #111;">Precio</th><th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #111;">Importe</th></tr></thead>\n<tbody>${itemsRows}${totalsHtml}</tbody></table>
          <h2 style="margin:32px 0 12px 0;font-size:15px;color:#111;font-weight:600;">Cliente</h2>
          <p style="margin:0 0 6px 0;font-size:13px;color:#111;font-weight:600;">${escapeHtml(snapshot.customer.firstName)} ${escapeHtml(snapshot.customer.lastName)}</p>
          <p style="margin:0 0 2px 0;font-size:13px;color:#555;">${escapeHtml(snapshot.customer.email)} · ${escapeHtml(snapshot.customer.phone)}</p>
          <p style="margin:0 0 16px 0;font-size:12px;color:#555;line-height:1.5;">${escapeHtml(snapshot.customer.address)}, ${escapeHtml(snapshot.customer.city)}, ${escapeHtml(snapshot.customer.province)}${snapshot.customer.postalCode ? ` ${escapeHtml(snapshot.customer.postalCode)}` : ''}</p>
          ${snapshot.customer.notes ? `<p style=\"margin:0 0 24px 0;font-size:12px;color:#777;font-style:italic;\">“${escapeHtml(snapshot.customer.notes)}”</p>` : ''}
          <h2 style="margin:0 0 12px 0;font-size:15px;color:#111;font-weight:600;">Pago</h2>
          ${paymentHtml || '<p style="margin:0;font-size:12px;color:#777;">(Sin datos adicionales)</p>'}
        </td>
      </tr>
      ${baseWrapperBottom}
    `

    const clientHtml = `
      ${baseWrapperTop}
      <tr>
        <td style="padding:28px 32px;border-bottom:1px solid #e5e5e5;">
          <h1 style="margin:0;font-size:20px;color:#111;font-weight:600;letter-spacing:-0.5px;">Confirmación de compra</h1>
          <p style="margin:10px 0 0 0;font-size:13px;color:#555;">Gracias por tu compra. Guarda este correo como comprobante oficial.</p>
          <p style="margin:6px 0 0 0;font-size:12px;color:#777;">Pedido <strong>${snapshot.orderId}</strong> · Tracking <strong>${trackingCode}</strong></p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 32px;">
          <h2 style="margin:0 0 16px 0;font-size:15px;color:#111;font-weight:600;">Resumen</h2>
          <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">\n<thead><tr><th align="left" style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #111;">Artículo</th><th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #111;">Cant.</th><th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #111;">Precio</th><th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #111;">Importe</th></tr></thead>\n<tbody>${itemsRows}${totalsHtml}</tbody></table>
          <h2 style="margin:28px 0 12px 0;font-size:15px;color:#111;font-weight:600;">Datos de contacto</h2>
          <p style="margin:0 0 2px 0;font-size:13px;color:#111;font-weight:600;">${escapeHtml(snapshot.customer.firstName)} ${escapeHtml(snapshot.customer.lastName)}</p>
          <p style="margin:0 0 2px 0;font-size:13px;color:#555;">${escapeHtml(snapshot.customer.email)} · ${escapeHtml(snapshot.customer.phone)}</p>
          <p style="margin:0 0 20px 0;font-size:12px;color:#555;line-height:1.5;">${escapeHtml(snapshot.customer.address)}, ${escapeHtml(snapshot.customer.city)}, ${escapeHtml(snapshot.customer.province)}${snapshot.customer.postalCode ? ` ${escapeHtml(snapshot.customer.postalCode)}` : ''}</p>
          <p style="margin:0;font-size:11px;color:#999;">Emitido: ${issuedAtStr}</p>
        </td>
      </tr>
      ${baseWrapperBottom}
    `

    await transporter.sendMail({
      from: `ROMAna Ebanistería <${FROM_EMAIL}>`,
      to: INTERNAL_EMAILS.join(','),
      subject: `Nueva orden ${snapshot.orderId}`,
      html: internalHtml,
      replyTo: snapshot.customer.email
    })

    await transporter.sendMail({
      from: `ROMAna Ebanistería <${FROM_EMAIL}>`,
      to: snapshot.customer.email,
      subject: `Confirmación de compra · ${snapshot.orderId}`,
      html: clientHtml,
    })

    return res.status(200).json({ message: 'Emails enviados', trackingCode })
  } catch (e: any) {
    return res.status(500).json({ message: 'Error enviando confirmación', error: e.message })
  }
}

function formatCurrency(v: number) {
  try { return v.toLocaleString('es-DO', { style: 'currency', currency: 'DOP' }) } catch { return v.toFixed(2) }
}
function escapeHtml(str: string) {
  return str.replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;' }[c] as string))
}
function generateTrackingCode(seed: string) {
  const base = seed.replace(/[^0-9]/g,'').slice(-6)
  const rand = Math.floor(Math.random()*9999).toString().padStart(4,'0')
  return `RMA-${base}-${rand}`
}
function buildPaymentTable(payment: any) {
  return `<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 8px 0;">\n<tbody>
    ${row('Código', payment.ResponseCode)}
    ${row('Autorización', payment.AuthorizationCode)}
    ${row('Referencia', payment.RetrivalReferenceNumber)}
    ${row('Tarjeta', payment.CreditCardNumber)}
    ${row('Mensaje', payment.Message)}
  </tbody></table>`
}
function row(label: string, value: any) {
  if (!value) return ''
  return `<tr><td style="padding:4px 0;font-size:12px;color:#555;width:120px;">${label}</td><td style="padding:4px 0;font-size:12px;color:#111;font-weight:600;">${escapeHtml(String(value))}</td></tr>`
}
