import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content={"La Fabbrica, la fábrica más grande de ebanistería y carpintería en aluminio en La Romana. Más de 48 años ofreciendo soluciones personalizadas para proyectos residenciales, hoteleros e inmobiliarios en la República Dominicana."} />
        <link rel="icon" type="image/png" href="/isotipo.png" />
        <link rel="shortcut icon" href="/isotipo.png" />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-29CPPQWCXJ" strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-29CPPQWCXJ');
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
