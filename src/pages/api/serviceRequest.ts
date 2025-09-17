import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

// Unified endpoint: creates service request via external API THEN sends company + client emails.
// Expects body with: desiredDate, address, suburb, state, postcode, fullName, email, phone, company?, projectDescription, serviceName

const BASE_URL = process.env.NEXT_PUBLIC_ROMANA_API || 'https://romana-ebanisteria-api-production.up.railway.app/api/v1'

// SMTP Config (prefer env, fallback none)
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.sendgrid.net'
const SMTP_PORT = Number(process.env.SMTP_PORT || 465)
const SMTP_SECURE = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true
const SMTP_USER = process.env.SMTP_USER || 'apikey'
const SMTP_PASS = process.env.SMTP_PASS || '' // SHOULD be set in env

// Admin notification recipients
const COMPANY_RECIPIENTS = (process.env.SERVICE_REQUEST_RECIPIENTS || 'info@romanaebanisteria.com,jheremy802@gmail.com')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

interface ExternalPayload {
  desiredDate: string
  address: string
  suburb: string
  state: string
  postcode: string
  fullName: string
  email: string
  phone: string
  company?: string
  projectDescription: string
  serviceName: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' })
  }

  const {
    desiredDate,
    address,
    suburb,
    state,
    postcode,
    fullName,
    email,
    phone,
    company,
    projectDescription,
    serviceName
  } = req.body as ExternalPayload

  // Basic validation
  if(!fullName || !email || !phone || !projectDescription || !serviceName) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' })
  }

  // Prepare external API payload (mapping to backend expected fields)
  const externalPayload = {
    desiredDate,
    address,
    suburb,
    state,
    postcode,
    fullName,
    email,
    phone,
    company: company || null,
    projectDescription,
    serviceName
  }

  try {
    // Forward to external API (needs user auth token if provided)
    const authHeader = req.headers.authorization
    const apiRes = await fetch(`${BASE_URL}/servicios/solicitudes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      body: JSON.stringify({
        desiredDate,
        address,
        suburb,
        state,
        postcode,
        fullName,
        email,
        phone,
        company,
        projectDescription,
        serviceName
      })
    })

    const apiJson = await apiRes.json().catch(()=>({}))
    if(!apiRes.ok) {
      return res.status(apiRes.status).json({ message: apiJson?.message || apiJson?.error || 'Error creando solicitud', api: apiJson })
    }

    // After successful creation send emails (fire-and-wait to ensure deliverability feedback)
    try {
      if(!SMTP_PASS) {
        console.warn('[serviceRequest] SMTP_PASS no configurado; se omite envío de correos.')
      } else {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: SMTP_SECURE,
          auth: { user: SMTP_USER, pass: SMTP_PASS }
        })

        const companyHtml = buildCompanyEmail({ fullName, serviceName, email, phone, company, projectDescription })
        const clientHtml = buildClientEmail({ fullName, serviceName, phone, company, projectDescription })

        await transporter.sendMail({
          from: '"Solicitud de Cotización" <info@grupochavon.com>',
          to: COMPANY_RECIPIENTS,
          subject: `Nueva solicitud de cotización de ${fullName}`,
          html: companyHtml
        })

        await transporter.sendMail({
          from: '"ROMAna Ebanistería" <info@grupochavon.com>',
          to: [email, 'jheremy802@gmail.com'],
          subject: 'Confirmación de Solicitud de Cotización',
          html: clientHtml
        })
      }
    } catch(mailErr:any) {
      console.error('Error enviando correos de solicitud', mailErr)
      // No hacemos fail total si API creó la solicitud; devolvemos warning
      return res.status(200).json({ message: 'Solicitud creada con advertencia: no se enviaron correos', api: apiJson, email_error: mailErr?.message })
    }

    return res.status(200).json({ message: 'Solicitud creada y correos enviados', api: apiJson })
  } catch (err:any) {
    console.error('Fallo creando solicitud de servicio', err)
    return res.status(500).json({ message: 'Error interno procesando la solicitud', error: err?.message })
  }
}

function buildCompanyEmail({ fullName, serviceName, email, phone, company, projectDescription }: { fullName:string; serviceName:string; email:string; phone:string; company?:string; projectDescription:string }) {
  return `
  <html><head><style>
  body { font-family: Arial, sans-serif; }
  .container { max-width: 600px; margin: 20px auto; padding: 20px; background: #fff; border: 1px solid #ddd; }
  .header { background: #ee8e0b; color: #fff; padding: 15px; text-align: center; font-size: 20px; }
  .content { padding: 20px; line-height: 1.5; }
  .footer { padding: 10px; font-size: 12px; text-align: center; color: #888; }
  .label { font-weight: bold; }
  </style></head><body>
    <div class="container">
      <div class="header">Nueva Solicitud de Cotización</div>
      <div class="content">
        <p><span class="label">Nombre:</span> ${fullName}</p>
        <p><span class="label">Servicio:</span> ${serviceName}</p>
        <p><span class="label">Correo Electrónico:</span> ${email}</p>
        <p><span class="label">Teléfono:</span> ${phone}</p>
        ${company ? `<p><span class="label">Empresa / Proyecto:</span> ${company}</p>` : ''}
        <p><span class="label">Descripción del Proyecto:</span></p>
        <p>${projectDescription}</p>
      </div>
      <div class="footer">Este mensaje ha sido generado automáticamente. Favor de responder al cliente directamente.</div>
    </div>
  </body></html>`
}

function buildClientEmail({ fullName, serviceName, phone, company, projectDescription }: { fullName:string; serviceName:string; phone:string; company?:string; projectDescription:string }) {
  return `
  <html><head><style>
  body { font-family: Arial, sans-serif; }
  .container { max-width: 600px; margin: 20px auto; padding: 20px; background: #fff; border: 1px solid #ddd; }
  .header { background: #ee8e0b; color: #fff; padding: 15px; text-align: center; font-size: 20px; }
  .content { padding: 20px; line-height: 1.5; }
  .footer { padding: 10px; font-size: 12px; text-align: center; color: #888; }
  .label { font-weight: bold; }
  a { color: #ee8e0b; }
  </style></head><body>
    <div class="container">
      <div class="header">Confirmación de Solicitud de Cotización</div>
      <div class="content">
        <p>Hola <strong>${fullName}</strong>,</p>
        <p>Hemos recibido tu solicitud de cotización. Nuestro equipo revisará tu solicitud y nos pondremos en contacto contigo en un plazo máximo de 24 horas.</p>
        <p><span class="label">Detalles de tu solicitud:</span></p>
        <p><strong>Servicio:</strong> ${serviceName}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        ${company ? `<p><strong>Empresa / Proyecto:</strong> ${company}</p>` : ''}
        <p><strong>Descripción:</strong> ${projectDescription}</p>
        <p>Si necesitas más información, puedes escribirnos a <a href="mailto:info@grupochavon.com">info@grupochavon.com</a>.</p>
      </div>
      <div class="footer">ROMAna Ebanistería | La Romana, República Dominicana | info@grupochavon.com</div>
    </div>
  </body></html>`
}
