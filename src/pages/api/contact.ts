// @ts-ignore nodemailer types may not resolve fully under bundler resolution
import nodemailer from "nodemailer";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).send({ message: "Solo se permiten solicitudes POST." });
    }

    const { firstName, lastName, email, phone, message } = req.body || {};

    if (!firstName || !lastName || !email || !phone || !message) {
      return res.status(400).json({ message: "Todos los campos obligatorios deben ser completados." });
    }

    // Use the same SMTP provider and keys as other emails (SendGrid)
    const SMTP_HOST = "smtp.sendgrid.net";
    const SMTP_PORT = 465; // SSL
    const SMTP_SECURE = true;
    const SMTP_USER = "apikey";
    const SMTP_PASS = process.env.SMTP_PASS || "";

    const FROM_EMAIL = "info@grupochavon.com";
    const INTERNAL_EMAILS = ["tecnologia@grupochavon.com", "info@grupochavon.com"];

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const submittedAt = new Date().toLocaleString("es-DO", { hour12: false });

    const tableRows = [
      { k: "Nombre", v: `${firstName} ${lastName}` },
      { k: "Correo Electrónico", v: email },
      { k: "Teléfono", v: phone },
      { k: "Fecha/Hora", v: submittedAt },
    ]
      .map(
        (r) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;color:#555;">${r.k}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;color:#111;font-weight:600;">${r.v}</td>
        </tr>`
      )
      .join("");

    const internalHtml = `
      <div style="background:#f6f6f6;padding:24px 0;font-family:Arial, Helvetica, sans-serif;">
        <table width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #eaeaea;">
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #eaeaea;">
              <h2 style="margin:0;color:#111;">Nueva solicitud de contacto</h2>
              <p style="margin:4px 0 0 0;color:#666;">${firstName} ${lastName} &lt;${email}&gt;</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                ${tableRows}
              </table>
              <div style="margin-top:16px;">
                <div style="color:#555;font-size:13px;margin-bottom:6px;">Mensaje</div>
                <div style="white-space:pre-wrap;color:#111;">${message}</div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;

    const clientHtml = `
      <div style="background:#f6f6f6;padding:24px 0;font-family:Arial, Helvetica, sans-serif;">
        <table width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #eaeaea;">
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #eaeaea;">
              <h2 style="margin:0;color:#111;">Hemos recibido tu solicitud</h2>
              <p style="margin:8px 0 0 0;color:#555;">Gracias, ${firstName}. Nuestro equipo revisará tu solicitud y te contactará en un plazo máximo de 24 horas.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <h3 style="margin:0 0 8px 0;color:#111;font-size:16px;">Resumen</h3>
              <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                ${tableRows}
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    // Internal email
    await transporter.sendMail({
      from: `La Fabbrica <${FROM_EMAIL}>`,
      to: INTERNAL_EMAILS.join(","),
      replyTo: email,
      subject: `Nueva solicitud de contacto de ${firstName} ${lastName}`,
      html: internalHtml,
    });

    // Client confirmation
    await transporter.sendMail({
      from: `La Fabbrica <${FROM_EMAIL}>`,
      to: email,
      subject: "Confirmación de solicitud de contacto",
      html: clientHtml,
    });

    return res.status(200).json({
      message: "Solicitud enviada exitosamente",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al enviar la solicitud",
      error: error.message,
    });
  }
}
