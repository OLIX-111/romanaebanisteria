import type { NextApiRequest, NextApiResponse } from "next"
// @ts-ignore nodemailer types may not resolve fully under bundler resolution
import nodemailer from "nodemailer"
import QRCode from 'qrcode'

// Using SendGrid SMTP configuration (same as other email APIs)
const SMTP_HOST = "smtp.sendgrid.net"
const SMTP_PORT = 465
const SMTP_SECURE = true
const SMTP_USER = "apikey"
const SMTP_PASS = "***SENDGRID_KEY_REMOVED***"

const FROM_EMAIL = "info@grupochavon.com"
const INTERNAL_EMAILS = ["jheremy802@gmail.com"]

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
})

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  image?: string
}

interface CustomerData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  notes?: string
}

interface ProcessOrderPayload {
  orderId: string
  // Opcional si es una compra simulada (sin gateway real)
  sessionId?: string
  transactionId?: string
  // Si ya tenemos trackingNumber (porque se creó la orden antes) lo usamos, si no generamos uno
  trackingNumber?: string
  items: OrderItem[]
  customer: CustomerData
  totals: {
    subtotal: number
    tax: number
    total: number
  }
  payment: {
    // Para simulaciones forzamos "00" y aprobamos siempre
    responseCode: string
    authCode?: string
    rrn?: string
    maskedPan?: string
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-DO", { 
    style: "currency", 
    currency: "DOP" 
  }).format(amount)
}

function generateTrackingCode(orderId: string): string {
  const base = orderId.replace(/[^0-9]/g, "").slice(-6)
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, "0")
  return `RMA-${base}-${rand}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const {
      orderId,
      sessionId,
      transactionId,
      trackingNumber,
      items,
      customer,
      totals,
      payment
    }: ProcessOrderPayload = req.body

    // Validation
    if (!orderId || !items || !customer || !totals || !payment) {
      return res.status(400).json({ error: "Missing required order data" })
    }
    // En modo simulación aceptamos cualquier responseCode diferente de "00" y lo convertimos a éxito.
    if (payment.responseCode !== "00") {
      // Normalmente rechazaríamos, pero el requerimiento indica siempre éxito.
      payment.responseCode = "00"
    }

  const trackingCode = trackingNumber || generateTrackingCode(orderId)
    const orderDate = new Date().toLocaleString("es-DO", { hour12: false })
    const trackingUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/store/orders/${trackingCode}`
    let qrDataUrl: string | null = null
    try {
      qrDataUrl = await QRCode.toDataURL(trackingUrl, { margin: 1, width: 220 })
    } catch (qrErr) {
      console.warn('QR generation failed:', qrErr)
    }

    // Build order items HTML for email
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;display:flex;align-items:center;gap:12px;">
          ${item.image ? `<img src="${item.image}" width="48" height="48" style="border:1px solid #eee;object-fit:cover" alt="${item.name}"/>` : ''}
          <div>
            <div style="font-weight:600;color:#111;">${item.name}</div>
          </div>
        </td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;color:#111;">${item.quantity}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;color:#111;">${formatCurrency(item.price)}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;color:#111;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `).join("")

    const customerHtml = `
      <div style="margin-top:20px;">
        <h3 style="margin:0 0 8px 0;color:#111;font-size:16px;">Datos del cliente</h3>
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#444;font-size:14px;"><strong>Nombre:</strong> ${customer.firstName} ${customer.lastName}</td></tr>
          <tr><td style="padding:6px 0;color:#444;font-size:14px;"><strong>Email:</strong> ${customer.email}</td></tr>
          <tr><td style="padding:6px 0;color:#444;font-size:14px;"><strong>Teléfono:</strong> ${customer.phone}</td></tr>
          <tr><td style="padding:6px 0;color:#444;font-size:14px;"><strong>Dirección:</strong> ${customer.address}, ${customer.city}, ${customer.province} ${customer.postalCode}</td></tr>
          ${customer.notes ? `<tr><td style="padding:6px 0;color:#444;font-size:14px;"><strong>Notas:</strong> ${customer.notes}</td></tr>` : ''}
        </table>
      </div>
    `

    const paymentHtml = `
      <div style="margin-top:20px;">
        <h3 style="margin:0 0 8px 0;color:#111;font-size:16px;">Información del pago</h3>
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          <tr><td style="padding:4px 0;font-size:12px;color:#555;width:120px;">Código de respuesta:</td><td style="padding:4px 0;font-size:12px;color:#111;font-weight:600;">${payment.responseCode}</td></tr>
          ${payment.authCode ? `<tr><td style="padding:4px 0;font-size:12px;color:#555;width:120px;">Autorización:</td><td style="padding:4px 0;font-size:12px;color:#111;font-weight:600;">${payment.authCode}</td></tr>` : ''}
          ${payment.rrn ? `<tr><td style="padding:4px 0;font-size:12px;color:#555;width:120px;">Referencia:</td><td style="padding:4px 0;font-size:12px;color:#111;font-weight:600;">${payment.rrn}</td></tr>` : ''}
          ${payment.maskedPan ? `<tr><td style="padding:4px 0;font-size:12px;color:#555;width:120px;">Tarjeta:</td><td style="padding:4px 0;font-size:12px;color:#111;font-weight:600;">${payment.maskedPan}</td></tr>` : ''}
          ${transactionId ? `<tr><td style="padding:4px 0;font-size:12px;color:#555;width:120px;">ID Transacción:</td><td style="padding:4px 0;font-size:12px;color:#111;font-weight:600;">${transactionId}</td></tr>` : ''}
          ${sessionId ? `<tr><td style="padding:4px 0;font-size:12px;color:#555;width:120px;">Sesión:</td><td style="padding:4px 0;font-size:12px;color:#111;font-weight:600;">${sessionId}</td></tr>` : ''}
        </table>
      </div>
    `

    // Client confirmation email
    const clientEmailHtml = `
      <div style="background:#f6f6f6;padding:24px 0;font-family:Arial, Helvetica, sans-serif;">
        <table width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #eaeaea;">
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #eaeaea;display:flex;align-items:center;gap:12px;">
              <img src="https://storage.googleapis.com/portfoliprofiles/GG%20studio/romanaEbanisteri%CC%81a.png" width="140" alt="ROMAna Ebanistería"/>
              <div style="margin-left:auto;text-align:right;">
                <div style="font-size:12px;color:#666;">Orden</div>
                <div style="font-size:16px;font-weight:700;color:#111;">#${orderId}</div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <h2 style="margin:0 0 6px 0;color:#111;font-size:18px;">¡Gracias por tu compra!</h2>
              <p style="margin:0 0 16px 0;color:#555;font-size:14px;">Tu pago ha sido procesado exitosamente. Aquí tienes el resumen de tu pedido:</p>
              <p style="margin:0 0 6px 0;color:#555;font-size:14px;"><strong>Código de seguimiento:</strong> ${trackingCode}</p>
              ${qrDataUrl ? `<div style="margin:12px 0 20px 0;text-align:center;">
                <div style=\"font-size:12px;color:#555;margin-bottom:6px;\">Escanea para ver el estado de tu orden</div>
                <a href="${trackingUrl}" style="display:inline-block;text-decoration:none;" target="_blank" rel="noopener">
                  <img src="${qrDataUrl}" alt="Tracking QR" style="display:block;width:220px;height:220px;border:8px solid #f5f5f5;border-radius:12px;box-shadow:0 2px 4px rgba(0,0,0,0.08);" />
                </a>
                <div style="margin-top:8px;font-size:11px;color:#888;word-break:break-all;">${trackingUrl}</div>
              </div>` : ''}

              <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:8px;">
                <thead>
                  <tr>
                    <th style="text-align:left;padding:12px;border-bottom:2px solid #111;color:#111;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Producto</th>
                    <th style="text-align:center;padding:12px;border-bottom:2px solid #111;color:#111;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Cant.</th>
                    <th style="text-align:right;padding:12px;border-bottom:2px solid #111;color:#111;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Precio</th>
                    <th style="text-align:right;padding:12px;border-bottom:2px solid #111;color:#111;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;border-top:1px solid #eee;padding-top:8px;">
                <tr>
                  <td style="text-align:right;color:#666;font-size:14px;padding:4px 0;">Subtotal</td>
                  <td style="text-align:right;color:#111;font-weight:600;font-size:14px;padding:4px 0;width:160px;">${formatCurrency(totals.subtotal)}</td>
                </tr>
                ${totals.tax > 0 ? `
                <tr>
                  <td style="text-align:right;color:#666;font-size:14px;padding:4px 0;">Impuesto</td>
                  <td style="text-align:right;color:#111;font-weight:600;font-size:14px;padding:4px 0;">${formatCurrency(totals.tax)}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="text-align:right;color:#111;font-size:15px;padding:8px 0;border-top:1px solid #eee;"><strong>Total</strong></td>
                  <td style="text-align:right;color:#111;font-weight:700;font-size:16px;padding:8px 0;border-top:1px solid #eee;">${formatCurrency(totals.total)}</td>
                </tr>
              </table>

              ${customerHtml}

              <div style="margin-top:24px;padding:16px;background:#f8f9fa;border-radius:8px;">
                <h3 style="margin:0 0 8px 0;color:#111;font-size:14px;">¿Qué sigue?</h3>
                <ul style="margin:0;padding-left:20px;color:#555;font-size:13px;">
                  <li>Nuestro equipo procesará tu pedido en las próximas 24-48 horas</li>
                  <li>Te contactaremos para coordinar la entrega e instalación</li>
                  <li>Recibirás actualizaciones por correo y WhatsApp</li>
                </ul>
              </div>

              <div style="margin-top:24px;color:#666;font-size:12px;">
                ¿Necesitas ayuda? Escríbenos a <a href="mailto:info@grupochavon.com" style="color:#111;">info@grupochavon.com</a> o llámanos al +1 (829) 222-2483.
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;border-top:1px solid #eaeaea;background:#fafafa;color:#999;font-size:12px;text-align:center;">
              ROMAna Ebanistería · La Romana, República Dominicana · ${orderDate}
            </td>
          </tr>
        </table>
      </div>
    `

    // Internal notification email
    const internalEmailHtml = `
      <div style="background:#f6f6f6;padding:24px 0;font-family:Arial, Helvetica, sans-serif;">
        <table width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #eaeaea;">
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #eaeaea;">
              <h2 style="margin:0;color:#111;">🎉 Nueva orden pagada - ${formatCurrency(totals.total)}</h2>
              <p style="margin:4px 0 0 0;color:#666;">Orden #${orderId} · ${customer.firstName} ${customer.lastName} &lt;${customer.email}&gt;</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <div style="background:#e8f5e8;border:1px solid #4ade80;border-radius:8px;padding:16px;margin-bottom:20px;">
                <h3 style="margin:0 0 8px 0;color:#166534;font-size:16px;">✅ Pago confirmado</h3>
                <p style="margin:0;color:#166534;font-size:14px;">El cliente ha completado el pago exitosamente a través de CardNet.</p>
              </div>
              ${qrDataUrl ? `<div style=\"margin:0 0 20px 0;display:flex;align-items:center;gap:16px;\">
                <div>
                  <div style=\"font-size:12px;color:#555;margin-bottom:4px;\">QR Tracking</div>
                  <img src="${qrDataUrl}" width="140" height="140" style="display:block;border:4px solid #f5f5f5;border-radius:10px;" />
                  <div style=\"font-size:10px;color:#999;margin-top:4px;word-break:break-all;width:140px;\">${trackingUrl}</div>
                </div>
                <div style=\"font-size:12px;color:#555;line-height:1.5;\">
                  <strong>Tracking URL:</strong><br/>
                  <a href="${trackingUrl}" style=\"color:#0369a1;text-decoration:none;\" target="_blank" rel="noopener">${trackingUrl}</a>
                </div>
              </div>` : ''}

              <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:8px;">
                <thead>
                  <tr>
                    <th style="text-align:left;padding:12px;border-bottom:2px solid #111;color:#111;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Producto</th>
                    <th style="text-align:center;padding:12px;border-bottom:2px solid #111;color:#111;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Cant.</th>
                    <th style="text-align:right;padding:12px;border-bottom:2px solid #111;color:#111;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Precio</th>
                    <th style="text-align:right;padding:12px;border-bottom:2px solid #111;color:#111;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;border-top:1px solid #eee;padding-top:8px;">
                <tr>
                  <td style="text-align:right;color:#666;font-size:14px;padding:4px 0;">Subtotal</td>
                  <td style="text-align:right;color:#111;font-weight:600;font-size:14px;padding:4px 0;width:160px;">${formatCurrency(totals.subtotal)}</td>
                </tr>
                ${totals.tax > 0 ? `
                <tr>
                  <td style="text-align:right;color:#666;font-size:14px;padding:4px 0;">Impuesto</td>
                  <td style="text-align:right;color:#111;font-weight:600;font-size:14px;padding:4px 0;">${formatCurrency(totals.tax)}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="text-align:right;color:#111;font-size:15px;padding:8px 0;border-top:1px solid #eee;"><strong>TOTAL PAGADO</strong></td>
                  <td style="text-align:right;color:#111;font-weight:700;font-size:16px;padding:8px 0;border-top:1px solid #eee;">${formatCurrency(totals.total)}</td>
                </tr>
              </table>

              ${customerHtml}
              ${paymentHtml}

              <div style="margin-top:24px;padding:16px;background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;">
                <h3 style="margin:0 0 8px 0;color:#92400e;font-size:14px;">🚀 Acciones requeridas</h3>
                <ul style="margin:0;padding-left:20px;color:#92400e;font-size:13px;">
                  <li>Contactar al cliente para confirmar detalles</li>
                  <li>Programar producción/entrega</li>
                  <li>Enviar actualizaciones de estado</li>
                </ul>
                <div style="margin-top:12px;">
                  <a href="tel:${customer.phone}" style="display:inline-block;background:#0369a1;color:white;padding:8px 16px;text-decoration:none;border-radius:4px;font-size:12px;margin-right:8px;">📞 Llamar</a>
                  <a href="mailto:${customer.email}?subject=Orden%20${orderId}%20-%20Confirmación" style="display:inline-block;background:#059669;color:white;padding:8px 16px;text-decoration:none;border-radius:4px;font-size:12px;">✉️ Email</a>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;border-top:1px solid #eaeaea;background:#fafafa;color:#999;font-size:12px;text-align:center;">
              ROMAna Ebanistería · Sistema de Órdenes · ${orderDate}
            </td>
          </tr>
        </table>
      </div>
    `

    // Send emails
    await Promise.all([
      // Client confirmation email
      transporter.sendMail({
        from: `ROMAna Ebanistería <${FROM_EMAIL}>`,
        to: customer.email,
        subject: `Confirmación de compra #${orderId} - ${formatCurrency(totals.total)}`,
        html: clientEmailHtml,
      }),

      // Internal notification email
      transporter.sendMail({
        from: `ROMAna Ebanistería <${FROM_EMAIL}>`,
        to: INTERNAL_EMAILS.join(","),
        replyTo: customer.email,
        subject: `💰 Nueva orden pagada #${orderId} - ${customer.firstName} ${customer.lastName} - ${formatCurrency(totals.total)}`,
        html: internalEmailHtml,
      }),
    ])

    console.log(`[Order] Processed order ${orderId} for ${customer.email}, amount: ${formatCurrency(totals.total)}`)

    // Store order in session for confirmation page
    const orderSnapshot = {
      orderId,
      trackingCode,
      customer,
      items,
      totals,
      payment,
      trackingUrl,
      qrDataUrl,
      createdAt: Date.now(),
    }

    return res.status(200).json({
      success: true,
      orderId,
      trackingCode,
      trackingUrl,
      qrDataUrl,
      orderSnapshot,
      message: "Order processed and emails sent successfully"
    })

  } catch (error: any) {
    console.error("[Order] Error processing order:", error)
    return res.status(500).json({ 
      error: "Failed to process order",
      details: error.message 
    })
  }
}
