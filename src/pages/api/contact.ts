import nodemailer from "nodemailer";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).send({ message: "Solo se permiten solicitudes POST." });
    }

    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !lastName || !email || !phone || !message) {
      return res.status(400).json({ message: "Todos los campos obligatorios deben ser completados." });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      auth: {
        user: "info@romanaebanisteria.com",
        pass: "TJ4XBTyNx,*3kWQ",
      },
    });

    // **Correo para la empresa**
    await transporter.sendMail({
      from: '"Geek Guys Studio" <info@geekguysstudio.com>',
      to: ["jheremy@geekguysstudio.com", "jheremy802@gmail.com"],
      subject: `Nueva solicitud de cotización de ${firstName} ${lastName}`,
      html: `
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; }
              .container { max-width: 600px; margin: 20px auto; padding: 20px; background: #fff; border: 1px solid #ddd; }
              .header { background: #ee8e0b; color: #fff; padding: 15px; text-align: center; font-size: 20px; }
              .content { padding: 20px; line-height: 1.5; }
              .footer { padding: 10px; font-size: 12px; text-align: center; color: #888; }
              .label { font-weight: bold; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  Nueva Solicitud de Cotización
              </div>
              <div class="content">
                  <p><span class="label">Nombre:</span> ${firstName} ${lastName}</p>
                  <p><span class="label">Correo Electrónico:</span> ${email}</p>
                  <p><span class="label">Teléfono:</span> ${phone}</p>
                  <p><span class="label">Mensaje:</span></p>
                  <p>${message}</p>
              </div>
              <div class="footer">
                  Este mensaje ha sido generado automáticamente. Favor de responder al cliente directamente.
              </div>
          </div>
      </body>
      </html>
      `,
    });

    // **Correo de confirmación al cliente**
    await transporter.sendMail({
      from: '"Geek Guys Studio" <info@geekguysstudio.com>',
      to: [email, "jheremy802@gmail.com"],
      subject: "Confirmación de Solicitud de Cotización",
      html: `
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; }
              .container { max-width: 600px; margin: 20px auto; padding: 20px; background: #fff; border: 1px solid #ddd; }
              .header { background: #ee8e0b; color: #fff; padding: 15px; text-align: center; font-size: 20px; }
              .content { padding: 20px; line-height: 1.5; }
              .footer { padding: 10px; font-size: 12px; text-align: center; color: #888; }
              .label { font-weight: bold; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  Confirmación de Solicitud de Cotización
              </div>
              <div class="content">
                  <p>Hola <strong>${firstName} ${lastName}</strong>,</p>
                  <p>Hemos recibido tu solicitud de cotización. Nuestro equipo revisará tu solicitud y nos pondremos en contacto contigo en un plazo máximo de 24 horas.</p>
                  <p><span class="label">Detalles de tu solicitud:</span></p>
                  <p><strong>Teléfono:</strong> ${phone}</p>
                  <p><strong>Mensaje:</strong> ${message}</p>
                  <p>Si necesitas más información, puedes escribirnos a <a href="mailto:info@geekguysstudio.com">info@geekguysstudio.com</a>.</p>
              </div>
              <div class="footer">
                  Geek Guys Studio
              </div>
          </div>
      </body>
      </html>
      `,
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
