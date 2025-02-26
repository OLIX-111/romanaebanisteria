import nodemailer from 'nodemailer';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function (req: NextApiRequest, res: NextApiResponse) {
  try {

    if (req.method !== 'POST') {
      return res.status(405).send({ message: 'Only POST requests allowed' });
    }

    const {
      fullName,
      company,
      contactEmail,
      websiteURL,
      projectDetails,
    } = req.body;


    // create a transporter using Mailgun
    const transporter = nodemailer.createTransport({
      host: 'smtp.dreamhost.com',
      port: 587,
      secure: false,
      auth: {
        user: 'info@romanaebanisteria.com',
        pass: "TJ4XBTyNx,*3kWQ"
      },
    });

    // Send a confirmation email to the sender
    await transporter.sendMail({
      from: '"Geek Guys Studio" <info@romanaebanisteria.com>',
      to: ["jheremy@geekguysstudio.com", "jheremy802@gmail.com"],
      subject: 'GG Studio - New Client Confirmation',
      html: `<!DOCTYPE html>
      <html>
      <head>
          <title>New Client Inquiry</title>
          <style type="text/css">
              body, html {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .wrapper {
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border: 1px solid #dddddd;
              }
              .header {
                  background-color: #8246BE;
                  color: #ffffff;
                  padding: 10px;
                  text-align: center;
                  font-size: 24px;
              }
              .content {
                  padding: 20px;
                  line-height: 1.5;
              }
              .footer {
                  padding: 10px;
                  font-size: 12px;
                  text-align: center;
                  color: #888888;
              }
              .label {
                  font-weight: bold;
              }
          </style>
      </head>
      <body>
          <div class="wrapper">
              <div class="header">
                  New Client Inquiry
              </div>
              <div class="content">
                  <p><span class="label">Full Name:</span> ${fullName}</p>
                  <p><span class="label">Company:</span> ${company}</p>
                  <p><span class="label">Contact Email:</span> ${contactEmail}</p>
                  <p><span class="label">Website URL:</span> ${websiteURL ? websiteURL : 'N/A'}</p>
                  <p><span class="label">Project Details:</span></p>
                  <p>${projectDetails}</p>
              </div>
              <div class="footer">
                  This is an automated message, please do not reply directly to this email.
              </div>
          </div>
      </body>
      </html>
      `
    })

    // Send a confirmation email to the sender
    await transporter.sendMail({
      from: '"Geek Guys Studio" <info@romanaebanisteria.com>',
      to: [contactEmail],
      subject: "Let's Get Started: Your Project Inquiry with Geek Guys Studio",
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
       <head>
        <meta content="width=device-width, initial-scale=1" name="viewport">
        <meta charset="UTF-8">
        <meta name="x-apple-disable-message-reformatting">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta content="telephone=no" name="format-detection">
        <title>Your Inquiry at Geek Guys Studio - Confirmation of Receipt</title><!--[if (mso 16)]>
          <style type="text/css">
          a {text-decoration: none;}
          </style>
          <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
      <xml>
          <o:OfficeDocumentSettings>
          <o:AllowPNG></o:AllowPNG>
          <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
      </xml>
      <![endif]--><!--[if mso]>
       <style type="text/css">
           ol {
        margin: 0 !important;
        }
       </style><![endif]
      --><!--[if !mso]><!-- -->
        <link href="https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk&display=swap" rel="stylesheet"><!--<![endif]-->
        <style type="text/css">
      .rollover:hover .rollover-first {
        max-height:0px!important;
        display:none!important;
      }
      .rollover:hover .rollover-second {
        max-height:none!important;
        display:inline-block!important;
      }
      .rollover span {
        font-size:0px;
      }
      u + .body img ~ div div {
        display:none;
      }
      #outlook a {
        padding:0;
      }
      span.MsoHyperlink,
      span.MsoHyperlinkFollowed {
        color:inherit;
        mso-style-priority:99;
      }
      a.es-button {
        mso-style-priority:100!important;
        text-decoration:none!important;
      }
      a[x-apple-data-detectors] {
        color:inherit!important;
        text-decoration:none!important;
        font-size:inherit!important;
        font-family:inherit!important;
        font-weight:inherit!important;
        line-height:inherit!important;
      }
      .es-desk-hidden {
        display:none;
        float:left;
        overflow:hidden;
        width:0;
        max-height:0;
        line-height:0;
        mso-hide:all;
      }
      .es-button-border:hover > a.es-button {
        color:#ffffff!important;
      }
      @media only screen and (max-width:600px) {h1 { font-size:40px!important; text-align:left } h2 { font-size:32px!important; text-align:left } h3 { font-size:24px!important; text-align:left } .es-m-p0b { padding-bottom:0!important } .es-m-p0r { padding-right:0!important } *[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:120%!important } h2, h2 a { line-height:120%!important } h3, h3 a { line-height:120%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important } h4 { font-size:24px!important; text-align:left } h5 { font-size:20px!important; text-align:left } h6 { font-size:16px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:40px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:32px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:24px!important } .es-header-body h4 a, .es-content-body h4 a, .es-footer-body h4 a { font-size:24px!important } .es-header-body h5 a, .es-content-body h5 a, .es-footer-body h5 a { font-size:20px!important } .es-header-body h6 a, .es-content-body h6 a, .es-footer-body h6 a { font-size:16px!important } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body a { font-size:12px!important } .es-infoblock p, .es-infoblock a { font-size:12px!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3, .es-m-txt-c h4, .es-m-txt-c h5, .es-m-txt-c h6 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3, .es-m-txt-r h4, .es-m-txt-r h5, .es-m-txt-r h6 { text-align:right!important } .es-m-txt-j, .es-m-txt-j h1, .es-m-txt-j h2, .es-m-txt-j h3, .es-m-txt-j h4, .es-m-txt-j h5, .es-m-txt-j h6 { text-align:justify!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3, .es-m-txt-l h4, .es-m-txt-l h5, .es-m-txt-l h6 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-m-txt-r .rollover:hover .rollover-second, .es-m-txt-c .rollover:hover .rollover-second, .es-m-txt-l .rollover:hover .rollover-second { display:inline!important } .es-m-txt-r .rollover div, .es-m-txt-c .rollover div, .es-m-txt-l .rollover div { line-height:0!important; font-size:0!important } .es-spacer { display:inline-table } a.es-button, button.es-button { font-size:16px!important; line-height:120%!important } a.es-button, button.es-button, .es-button-border { display:inline-block!important } .es-m-fw, .es-m-fw.es-fw, .es-m-fw .es-button { display:block!important } .es-m-il, .es-m-il .es-button, .es-social, .es-social td, .es-menu { display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important; display:table-row!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } .es-social td { padding-bottom:10px } .h-auto { height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0l { padding-left:0!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20b { padding-bottom:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } }
      @media screen and (max-width:384px) {.mail-message-content { width:414px!important } }
      </style>
       </head>
       <body class="body" style="width:100%;height:100%;padding:0;Margin:0">
        <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:transparent"><!--[if gte mso 9]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
              <v:fill type="tile" color="transparent"></v:fill>
            </v:background>
          <![endif]-->
         <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:transparent">
           <tr>
            <td valign="top" style="padding:0;Margin:0">
             <table cellpadding="0" cellspacing="0" class="es-header" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
               <tr>
                <td align="center" style="padding:0;Margin:0">
                 <table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                   <tr>
                    <td class="es-m-p0b" align="left" style="Margin:0;padding-top:15px;padding-right:20px;padding-bottom:15px;padding-left:20px">
                     <table cellpadding="0" cellspacing="0" class="es-right" align="right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                       <tr>
                        <td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:560px">
                         <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                           <tr>
                            <td align="center" class="es-m-txt-c" style="padding:0;Margin:0;padding-top:5px;padding-bottom:5px;font-size:0px"><a target="_blank" href="https://viewstripo.email" style="mso-line-height-rule:exactly;text-decoration:none;color:#1F1F1F;font-size:14px"><img src="https://ebhifkf.stripocdn.email/content/guids/CABINET_c00463b638c6350580f641bac6ffe65acb9b41aa7c0956b056b3a8bfcad81928/images/geekguysstudiofavicon_ybP.png" alt="Logo" style="display:block;font-size:16px;border:0;outline:none;text-decoration:none" title="Logo" width="105"></a></td>
                           </tr>
                         </table></td>
                       </tr>
                     </table></td>
                   </tr>
                   <tr>
                    <td align="left" style="Margin:0;padding-bottom:10px;padding-right:20px;padding-left:20px;padding-top:20px">
                     <table cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                       <tr>
                        <td align="left" style="padding:0;Margin:0;width:560px">
                         <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                           <tr>
                            <td align="left" style="padding:0;Margin:0"><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:36px;letter-spacing:0;color:#1F1F1F;font-size:24px"><strong>Welcome Aboard the Geek Guys Studio Odyssey!</strong></p><h2 style="Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:14px;font-style:normal;font-weight:normal;line-height:17px;color:#051923"><br>Thank you for reaching out to us at <strong>Geek Guys Studio</strong>! We're thrilled to have the opportunity to collaborate with you on your digital journey. Your form has been successfully received, and we're already charting a course to bring your project to new digital heights.</h2><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#1F1F1F;font-size:14px"><br></p><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;letter-spacing:0;color:#1F1F1F;font-size:14px">Our team is dedicated to crafting customized digital solutions that align with the specific needs and objectives of our clients. With your project details in hand, we will conduct an initial analysis to determine the most effective path forward.<br><br></p><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;letter-spacing:0;color:#1F1F1F;font-size:14px">A specialist from our studio will contact you within the next 24 hours to discuss your project in more detail and to schedule a comprehensive consultation.<br><br></p><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;letter-spacing:0;color:#1F1F1F;font-size:14px">In the meantime, should you have any additional information to share or require immediate assistance, please do not hesitate to reach out to us directly at<br><strong><a href="mailto:jheremy@geekguysstudio.com" target="_new" style="mso-line-height-rule:exactly;text-decoration:none;color:#1F1F1F;font-size:14px">jheremy@geekguysstudio.com</a></strong><br>or<br><strong>(829) 450-4140</strong>.</p>
                             <ul style="font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;padding:0px 0px 0px 40px;margin:15px 0px"></ul></td>
                           </tr>
                         </table></td>
                       </tr>
                     </table></td>
                   </tr>
                 </table></td>
               </tr>
             </table>
             <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
               <tr>
                <td align="center" style="padding:0;Margin:0">
                 <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                   <tr>
                    <td align="left" style="Margin:0;padding-bottom:25px;padding-right:20px;padding-left:20px;padding-top:20px">
                     <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                       <tr>
                        <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                         <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                           <tr>
                            <td align="left" style="padding:0;Margin:0"><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;letter-spacing:0;color:#1F1F1F;font-size:14px">We look forward to the possibility of working together to create a solution that not only meets but exceeds your digital objectives.<br><br></p><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;letter-spacing:0;color:#1F1F1F;font-size:14px">Kind regards,</p></td>
                           </tr>
                         </table></td>
                       </tr>
                     </table></td>
                   </tr>
                 </table></td>
               </tr>
             </table>
             <table cellpadding="0" cellspacing="0" class="es-footer" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:#FFFFFF;background-repeat:repeat;background-position:center top">
               <tr>
                <td align="center" bgcolor="#ffffff" style="padding:0;Margin:0;background-color:#ffffff">
                 <table bgcolor="#ffffff" class="es-footer-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#003554;width:600px">
                   <tr>
                    <td align="left" bgcolor="#efefef" style="Margin:0;padding-right:20px;padding-left:20px;padding-top:40px;padding-bottom:30px;background-color:#efefef"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:234px" valign="top"><![endif]-->
                     <table cellpadding="0" cellspacing="0" align="left" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                       <tr>
                        <td align="left" class="es-m-p20b" style="padding:0;Margin:0;width:234px">
                         <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                           <tr>
                            <td align="center" style="padding:15px;Margin:0;font-size:0px"><a target="_blank" href="https://viewstripo.email" style="mso-line-height-rule:exactly;text-decoration:none;color:#FFFFFF;font-size:12px"><img src="https://ebhifkf.stripocdn.email/content/guids/CABINET_c00463b638c6350580f641bac6ffe65acb9b41aa7c0956b056b3a8bfcad81928/images/androidchrome512x512.png" alt="Logo" style="display:block;font-size:16px;border:0;outline:none;text-decoration:none" title="Logo" width="99"></a></td>
                           </tr>
                         </table></td>
                       </tr>
                     </table><!--[if mso]></td><td style="width:20px"></td><td style="width:306px" valign="top"><![endif]-->
                     <table cellpadding="0" cellspacing="0" class="es-right" align="right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                       <tr>
                        <td align="left" style="padding:0;Margin:0;width:306px">
                         <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                           <tr>
                            <td align="left" style="padding:0;Margin:0"><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:18px;letter-spacing:0;color:#000000;font-size:12px">Jheremy Castro</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:18px;letter-spacing:0;color:#000000;font-size:12px">President | Geek Guys Studio</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:18px;letter-spacing:0;color:#000000;font-size:12px"><strong>Email:</strong> <a href="mailto:jheremy@geekguysstudio.com" target="_new" style="mso-line-height-rule:exactly;text-decoration:none;color:#000000;font-size:12px">jheremy@geekguysstudio.com</a></p><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:18px;letter-spacing:0;color:#000000;font-size:12px"><strong>Phone:</strong> (829) 450-4140</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:18px;letter-spacing:0;color:#000000;font-size:12px"><strong>Website:</strong> <a href="http://www.geekguysstudio.com/" target="_new" style="mso-line-height-rule:exactly;text-decoration:none;color:#000000;font-size:12px">www.geekguysstudio.com</a></p></td>
                           </tr>
                         </table></td>
                       </tr>
                     </table><!--[if mso]></td></tr></table><![endif]--></td>
                   </tr>
                 </table></td>
               </tr>
             </table></td>
           </tr>
         </table>
        </div>
       </body>
      </html>`,
    });

    return res.status(200).json({
      message: 'Email sent successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      message: 'Failed to send email',
      error: error.message,
    });
  }
}