import nodemailer from "nodemailer";
import { NextApiRequest, NextApiResponse } from "next";
import { jsPDF } from "jspdf";
import * as fs from 'fs';
import * as path from 'path';

interface CotizacionItem {
  id: number;
  name: string;
  image: string;
  price: number;
  description: string;
  type: string;
  vendor: string;
  qty: number;
}

interface CustomerData {
  nombre: string;
  numero: string;
  email: string;
  tipo?: string;
  tipoDesarrollador?: boolean;
  tipoCodia?: boolean;
  empresa?: string;
  website?: string;
  codia?: string;
}

function formatCurrency(n: number, currency = "DOP") {
  try {
    return new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(n);
  } catch {
    return `RD$ ${n.toFixed(2)}`;
  }
}

function generateQuoteNumber(): string {
  return `COT-${Date.now().toString().slice(-6)}`;
}

async function loadImageAsDataURL(src: string): Promise<string> {
  // En entorno de servidor, simplemente retornamos un placeholder
  // o podríamos intentar leer desde el sistema de archivos si es una ruta local
  try {
    // Si es una ruta relativa, intentar leer desde public
    if (src.startsWith('/')) {
      const publicPath = path.join(process.cwd(), 'public', src.substring(1));
      if (fs.existsSync(publicPath)) {
        const buffer = fs.readFileSync(publicPath);
        return `data:image/png;base64,${buffer.toString('base64')}`;
      }
    }
    // Para URLs externas o imágenes no encontradas, retornar null para que no se intente agregar
    return '';
  } catch (error) {
    console.warn('Error loading image:', error);
    return '';
  }
}

function generatePDF(items: CotizacionItem[], customerData: CustomerData, subtotal: number, tax: number, total: number, quoteNumber?: string): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Número de cotización y fecha
      const finalQuoteNumber = quoteNumber || generateQuoteNumber();
      const currentDate = new Date();
      const validityDate = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 días de validez

      let y = 20;

      // Header con logo y información de la empresa
      try {
        const logoPath = "/RomanaEbanistería.png";
        const dataUrl = await loadImageAsDataURL(logoPath);
        if (dataUrl) {
          doc.addImage(dataUrl, "PNG", 15, y, 35, 15);
        }
      } catch {}

      // Información de la empresa (derecha)
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("La Fabbrica", 120, y + 5);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("La Romana, República Dominicana", 120, y + 10);
      doc.text("Tel: (809) 000-0000", 120, y + 15);
      doc.text("Email: info@romanaebanisteria.com", 120, y + 20);
      doc.text("Web: www.romanaebanisteria.com", 120, y + 25);

      y += 35;

      // Título de la cotización
      doc.setFillColor(238, 142, 11); // Color primario
      doc.rect(15, y, pageWidth - 30, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("COTIZACIÓN", pageWidth / 2, y + 10, { align: "center" });
      doc.setTextColor(0, 0, 0);
      y += 20;

      // Información de la cotización
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`N° de Cotización: ${finalQuoteNumber}`, 15, y);
      doc.text(`Fecha: ${currentDate.toLocaleDateString("es-DO")}`, 120, y);
      doc.text(`Válida hasta: ${validityDate.toLocaleDateString("es-DO")}`, 15, y + 5);

      y += 15;

      // Información del cliente en tabla
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("INFORMACIÓN DEL CLIENTE", 15, y);
      y += 8;

      // Tabla de cliente
      const clientTableData = [
        ["Nombre:", customerData.nombre || ""],
        ["Teléfono:", customerData.numero || ""],
        ["Email:", customerData.email || ""],
      ];

      if (customerData.tipo) clientTableData.push(["Tipo:", customerData.tipo]);
      if (customerData.empresa) clientTableData.push(["Empresa:", customerData.empresa]);
      if (customerData.website) clientTableData.push(["Sitio Web:", customerData.website]);
      if (customerData.codia) clientTableData.push(["CODIA:", customerData.codia]);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      clientTableData.forEach(([label, value]) => {
        if (y > pageHeight - 30) {
          doc.addPage();
          y = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.text(label, 15, y);
        doc.setFont("helvetica", "normal");
        doc.text(value, 50, y);
        y += 6;
      });

      y += 10;

      // Tabla de productos
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("DETALLE DE PRODUCTOS", 15, y);
      y += 8;

      // Headers de la tabla
      const tableHeaders = ["Cant.", "Descripción", "Precio Unit.", "Subtotal"];
      const colWidths = [20, 90, 35, 35];
      const colPositions = [15, 35, 125, 160, 195];

      // Header de tabla
      doc.setFillColor(240, 240, 240);
      doc.rect(15, y, pageWidth - 30, 8, 'F');

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      tableHeaders.forEach((header, index) => {
        doc.text(header, colPositions[index], y + 5);
      });

      y += 10;

      // Productos
      doc.setFont("helvetica", "normal");
      items.forEach((item, index) => {
        if (y > pageHeight - 40) {
          doc.addPage();
          y = 20;

          // Repetir headers en nueva página
          doc.setFillColor(240, 240, 240);
          doc.rect(15, y, pageWidth - 30, 8, 'F');
          doc.setFont("helvetica", "bold");
          tableHeaders.forEach((header, i) => {
            doc.text(header, colPositions[i], y + 5);
          });
          y += 10;
          doc.setFont("helvetica", "normal");
        }

        // Línea de producto
        doc.text(item.qty.toString(), colPositions[0], y);
        doc.text(item.name.substring(0, 35), colPositions[1], y);
        doc.text(formatCurrency(item.price), colPositions[2], y, { align: "right" });
        doc.text(formatCurrency(item.price * item.qty), colPositions[3], y, { align: "right" });

        // Línea divisoria
        doc.line(15, y + 2, pageWidth - 15, y + 2);
        y += 8;
      });

      y += 5;

      // Totales
      const totalsX = 140;
      doc.setFont("helvetica", "normal");
      doc.text("Subtotal:", totalsX, y);
      doc.text(formatCurrency(subtotal), 190, y, { align: "right" });
      y += 6;

      doc.text("Impuesto (18%):", totalsX, y);
      doc.text(formatCurrency(tax), 190, y, { align: "right" });
      y += 6;

      // Línea total
      doc.setFillColor(238, 142, 11);
      doc.rect(totalsX - 5, y - 3, 65, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL:", totalsX, y + 2);
      doc.text(formatCurrency(total), 190, y + 2, { align: "right" });
      doc.setTextColor(0, 0, 0);

      y += 20;

      // Términos y condiciones
      if (y > pageHeight - 60) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("TÉRMINOS Y CONDICIONES:", 15, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      const terms = [
        "• Precios válidos por 30 días a partir de la fecha de emisión.",
        "• Los precios no incluyen transporte e instalación.",
        "• Tiempo de entrega: 15-30 días hábiles aproximadamente.",
        "• 50% anticipo requerido para iniciar la producción.",
        "• Garantía de 1 año en defectos de fabricación.",
        "• Medidas sujetas a verificación in situ.",
        "• Colores pueden variar ligeramente según disponibilidad."
      ];

      terms.forEach(term => {
        if (y > pageHeight - 15) {
          doc.addPage();
          y = 20;
        }
        doc.text(term, 15, y);
        y += 4;
      });

      // Footer
      y = pageHeight - 15;
      doc.setFontSize(7);
      doc.text(`Cotización ${finalQuoteNumber} - Generada el ${currentDate.toLocaleString("es-DO")}`, pageWidth / 2, y, { align: "center" });
      doc.text("La Fabbrica - La Romana, República Dominicana", pageWidth / 2, y + 4, { align: "center" });

      resolve(Buffer.from(doc.output('arraybuffer')));
    } catch (error) {
      reject(error);
    }
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Solo se permiten solicitudes POST." });
  }

  try {
    const { items, customerData, subtotal, tax, total } = req.body;

    if (!items || !customerData || !Array.isArray(items)) {
      return res.status(400).json({ message: "Datos incompletos para generar la cotización." });
    }

    // Generar número de cotización
    const quoteNumber = generateQuoteNumber();
    const currentDate = new Date();
    const validityDate = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000));

    // Configuración SMTP
    const SMTP_HOST = "smtp.sendgrid.net";
    const SMTP_PORT = 465;
    const SMTP_SECURE = true;
    const SMTP_USER = "apikey";
    const SMTP_PASS = process.env.SMTP_PASS || "";

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Generar PDF
    const pdfBuffer = await generatePDF(items, customerData, subtotal, tax, total, quoteNumber);

    // Email para el cliente
    const clientEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Cotización La Fabbrica - ${quoteNumber}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f6f6f6; }
          .container { max-width: 800px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #111111 0%, #d97706 100%); color: white; padding: 30px 40px; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .header .company-info { margin-top: 15px; font-size: 14px; opacity: 0.9; }
          .quote-info { background: #f8f9fa; padding: 20px 40px; border-bottom: 2px solid #111111; }
          .quote-info table { width: 100%; border-collapse: collapse; }
          .quote-info td { padding: 5px 0; }
          .quote-info .label { font-weight: bold; width: 150px; }
          .client-section { padding: 30px 40px; }
          .client-section h2 { color: #333; margin-top: 0; font-size: 20px; border-bottom: 2px solid #111111; padding-bottom: 10px; }
          .client-table { width: 100%; margin: 20px 0; }
          .client-table td { padding: 8px 0; border-bottom: 1px solid #eee; }
          .client-table .label { font-weight: bold; width: 120px; color: #555; }
          .products-section { padding: 0 40px 30px; }
          .products-section h2 { color: #333; margin-top: 0; font-size: 20px; border-bottom: 2px solid #111111; padding-bottom: 10px; }
          .products-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .products-table th { background: #111111; color: white; padding: 12px; text-align: left; font-weight: bold; }
          .products-table td { padding: 12px; border-bottom: 1px solid #eee; }
          .products-table .qty { text-align: center; width: 60px; }
          .products-table .description { width: 300px; }
          .products-table .price { text-align: right; width: 100px; }
          .products-table .subtotal { text-align: right; width: 100px; }
          .totals-section { background: #f8f9fa; padding: 20px 40px; }
          .totals-table { width: 100%; max-width: 300px; margin-left: auto; }
          .totals-table td { padding: 8px 0; }
          .totals-table .label { font-weight: bold; }
          .totals-table .amount { text-align: right; }
          .total-row { background: #111111; color: white; font-weight: bold; font-size: 16px; }
          .terms-section { padding: 30px 40px; background: #f9f9f9; }
          .terms-section h3 { color: #333; margin-top: 0; font-size: 16px; }
          .terms-list { margin: 15px 0; padding-left: 20px; }
          .terms-list li { margin-bottom: 5px; color: #666; }
          .footer { background: #333; color: white; padding: 20px 40px; text-align: center; }
          .footer p { margin: 5px 0; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>La Fabbrica</h1>
            <div class="company-info">
              La Romana, República Dominicana<br>
              Tel: (809) 000-0000 | Email: info@romanaebanisteria.com<br>
              Web: www.romanaebanisteria.com
            </div>
          </div>

          <!-- Quote Info -->
          <div class="quote-info">
            <table>
              <tr>
                <td class="label">N° de Cotización:</td>
                <td>${quoteNumber}</td>
                <td class="label" style="text-align: right;">Fecha:</td>
                <td>${currentDate.toLocaleDateString("es-DO")}</td>
              </tr>
              <tr>
                <td class="label">Válida hasta:</td>
                <td>${validityDate.toLocaleDateString("es-DO")}</td>
                <td></td>
                <td></td>
              </tr>
            </table>
          </div>

          <!-- Client Information -->
          <div class="client-section">
            <h2>Información del Cliente</h2>
            <table class="client-table">
              <tr>
                <td class="label">Nombre:</td>
                <td>${customerData.nombre || ''}</td>
              </tr>
              <tr>
                <td class="label">Teléfono:</td>
                <td>${customerData.numero || ''}</td>
              </tr>
              <tr>
                <td class="label">Email:</td>
                <td>${customerData.email || ''}</td>
              </tr>
              ${customerData.tipo ? `<tr><td class="label">Tipo:</td><td>${customerData.tipo}</td></tr>` : ''}
              ${customerData.empresa ? `<tr><td class="label">Empresa:</td><td>${customerData.empresa}</td></tr>` : ''}
              ${customerData.website ? `<tr><td class="label">Sitio Web:</td><td>${customerData.website}</td></tr>` : ''}
              ${customerData.codia ? `<tr><td class="label">CODIA:</td><td>${customerData.codia}</td></tr>` : ''}
            </table>
          </div>

          <!-- Products Table -->
          <div class="products-section">
            <h2>Detalle de Productos</h2>
            <table class="products-table">
              <thead>
                <tr>
                  <th class="qty">Cant.</th>
                  <th class="description">Descripción</th>
                  <th class="price">Precio Unit.</th>
                  <th class="subtotal">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td class="qty">${item.qty}</td>
                    <td class="description">${item.name}</td>
                    <td class="price">${formatCurrency(item.price)}</td>
                    <td class="subtotal">${formatCurrency(item.price * item.qty)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td class="label">Subtotal:</td>
                <td class="amount">${formatCurrency(subtotal)}</td>
              </tr>
              <tr>
                <td class="label">Impuesto (18%):</td>
                <td class="amount">${formatCurrency(tax)}</td>
              </tr>
              <tr class="total-row">
                <td class="label">TOTAL:</td>
                <td class="amount">${formatCurrency(total)}</td>
              </tr>
            </table>
          </div>

          <!-- Terms and Conditions -->
          <div class="terms-section">
            <h3>Términos y Condiciones</h3>
            <ul class="terms-list">
              <li>Precios válidos por 30 días a partir de la fecha de emisión</li>
              <li>Los precios no incluyen transporte e instalación</li>
              <li>Tiempo de entrega: 15-30 días hábiles aproximadamente</li>
              <li>50% anticipo requerido para iniciar la producción</li>
              <li>Garantía de 1 año en defectos de fabricación</li>
              <li>Medidas sujetas a verificación in situ</li>
              <li>Colores pueden variar ligeramente según disponibilidad</li>
            </ul>
            <p style="margin-top: 20px; color: #666; font-style: italic;">
              Para más información o para confirmar tu pedido, contáctanos por teléfono o email.
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p><strong>La Fabbrica</strong></p>
            <p>Cotización ${quoteNumber} - Generada el ${currentDate.toLocaleString("es-DO")}</p>
            <p>La Romana, República Dominicana | www.romanaebanisteria.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email para el negocio
    const businessEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nueva Cotización - ${quoteNumber}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f6f6f6; }
          .container { max-width: 800px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #111111 0%, #d97706 100%); color: white; padding: 30px 40px; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .header .alert { background: #ff6b35; color: white; padding: 10px 20px; margin-top: 20px; border-radius: 5px; font-weight: bold; }
          .quote-info { background: #f8f9fa; padding: 20px 40px; border-bottom: 2px solid #111111; }
          .quote-info table { width: 100%; border-collapse: collapse; }
          .quote-info td { padding: 5px 0; }
          .quote-info .label { font-weight: bold; width: 150px; }
          .client-section { padding: 30px 40px; }
          .client-section h2 { color: #333; margin-top: 0; font-size: 20px; border-bottom: 2px solid #111111; padding-bottom: 10px; }
          .client-table { width: 100%; margin: 20px 0; }
          .client-table td { padding: 8px 0; border-bottom: 1px solid #eee; }
          .client-table .label { font-weight: bold; width: 120px; color: #555; }
          .products-section { padding: 0 40px 30px; }
          .products-section h2 { color: #333; margin-top: 0; font-size: 20px; border-bottom: 2px solid #111111; padding-bottom: 10px; }
          .products-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .products-table th { background: #111111; color: white; padding: 12px; text-align: left; font-weight: bold; }
          .products-table td { padding: 12px; border-bottom: 1px solid #eee; }
          .products-table .qty { text-align: center; width: 60px; }
          .products-table .description { width: 300px; }
          .products-table .price { text-align: right; width: 100px; }
          .products-table .subtotal { text-align: right; width: 100px; }
          .totals-section { background: #f8f9fa; padding: 20px 40px; }
          .totals-table { width: 100%; max-width: 300px; margin-left: auto; }
          .totals-table td { padding: 8px 0; }
          .totals-table .label { font-weight: bold; }
          .totals-table .amount { text-align: right; }
          .total-row { background: #111111; color: white; font-weight: bold; font-size: 16px; }
          .action-section { padding: 30px 40px; background: #e8f4f8; }
          .action-section h3 { color: #333; margin-top: 0; font-size: 18px; }
          .action-buttons { margin: 20px 0; }
          .action-button { display: inline-block; background: #111111; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px; }
          .footer { background: #333; color: white; padding: 20px 40px; text-align: center; }
          .footer p { margin: 5px 0; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>La Fabbrica</h1>
            <div class="alert">
              🚨 NUEVA COTIZACIÓN GENERADA - ${formatCurrency(total)}
            </div>
          </div>

          <!-- Quote Info -->
          <div class="quote-info">
            <table>
              <tr>
                <td class="label">N° de Cotización:</td>
                <td>${quoteNumber}</td>
                <td class="label" style="text-align: right;">Fecha:</td>
                <td>${currentDate.toLocaleDateString("es-DO")}</td>
              </tr>
              <tr>
                <td class="label">Válida hasta:</td>
                <td>${validityDate.toLocaleDateString("es-DO")}</td>
                <td></td>
                <td></td>
              </tr>
            </table>
          </div>

          <!-- Client Information -->
          <div class="client-section">
            <h2>Información del Cliente</h2>
            <table class="client-table">
              <tr>
                <td class="label">Nombre:</td>
                <td>${customerData.nombre || ''}</td>
              </tr>
              <tr>
                <td class="label">Teléfono:</td>
                <td>${customerData.numero || ''}</td>
              </tr>
              <tr>
                <td class="label">Email:</td>
                <td>${customerData.email || ''}</td>
              </tr>
              ${customerData.tipo ? `<tr><td class="label">Tipo:</td><td>${customerData.tipo}</td></tr>` : ''}
              ${customerData.empresa ? `<tr><td class="label">Empresa:</td><td>${customerData.empresa}</td></tr>` : ''}
              ${customerData.website ? `<tr><td class="label">Sitio Web:</td><td>${customerData.website}</td></tr>` : ''}
              ${customerData.codia ? `<tr><td class="label">CODIA:</td><td>${customerData.codia}</td></tr>` : ''}
            </table>
          </div>

          <!-- Products Table -->
          <div class="products-section">
            <h2>Detalle de Productos</h2>
            <table class="products-table">
              <thead>
                <tr>
                  <th class="qty">Cant.</th>
                  <th class="description">Descripción</th>
                  <th class="price">Precio Unit.</th>
                  <th class="subtotal">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td class="qty">${item.qty}</td>
                    <td class="description">${item.name}</td>
                    <td class="price">${formatCurrency(item.price)}</td>
                    <td class="subtotal">${formatCurrency(item.price * item.qty)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td class="label">Subtotal:</td>
                <td class="amount">${formatCurrency(subtotal)}</td>
              </tr>
              <tr>
                <td class="label">Impuesto (18%):</td>
                <td class="amount">${formatCurrency(tax)}</td>
              </tr>
              <tr class="total-row">
                <td class="label">TOTAL:</td>
                <td class="amount">${formatCurrency(total)}</td>
              </tr>
            </table>
          </div>

          <!-- Action Section -->
          <div class="action-section">
            <h3>Acciones Requeridas</h3>
            <p><strong>Cliente:</strong> ${customerData.nombre}</p>
            <p><strong>Contacto:</strong> ${customerData.numero} | ${customerData.email}</p>
            <div class="action-buttons">
              <a href="tel:${customerData.numero}" class="action-button">📞 Llamar al Cliente</a>
              <a href="mailto:${customerData.email}?subject=Re: Cotización ${quoteNumber}" class="action-button">✉️ Enviar Email</a>
            </div>
            <p style="margin-top: 20px; color: #666; font-style: italic;">
              El PDF completo está adjunto a este email para su referencia.
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p><strong>Sistema de Cotizaciones Web</strong></p>
            <p>Cotización ${quoteNumber} - Generada el ${currentDate.toLocaleString("es-DO")}</p>
            <p>La Fabbrica - La Romana, República Dominicana</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar email al cliente
    await transporter.sendMail({
      from: '"La Fabbrica" <info@grupochavon.com>',
      to: customerData.email,
      subject: `Cotización ${quoteNumber} - La Fabbrica - ${formatCurrency(total)}`,
      html: clientEmailHtml,
      attachments: [{
        filename: `cotizacion-${quoteNumber}-La Fabbrica-ebanisteria.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });

    // Enviar email al negocio
    await transporter.sendMail({
      from: '"Sistema de Cotizaciones" <info@grupochavon.com>',
      to: ["info@romanaebanisteria.com", "jheremy802@gmail.com"],
      subject: `Nueva Cotización ${quoteNumber} - ${customerData.nombre} - ${formatCurrency(total)}`,
      html: businessEmailHtml,
      attachments: [{
        filename: `cotizacion-${quoteNumber}-${customerData.nombre.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });

    return res.status(200).json({
      message: "Cotización enviada exitosamente por email",
      sentTo: customerData.email
    });

  } catch (error: any) {
    console.error('Error enviando cotización por email:', error);
    return res.status(500).json({
      message: "Error al enviar la cotización por email",
      error: error.message,
    });
  }
}
