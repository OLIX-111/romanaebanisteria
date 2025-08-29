/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "https://www.romanaebanisteria.com",
      },
      {
        protocol: "https",
        hostname: "https://storage.googleapis.com",
      },
      {
        protocol: 'https',
        hostname: 'fontanasrl.odoo.com',
      },
    ],
    domains: ['cdn.sanity.io', 'scontent-syd2-1.xx.fbcdn.net', 'chatbot.ewr1.vultrobjects.com', 'www.romanaebanisteria.com'],
  },
  i18n: {
      locales: ['en', 'es'],
      defaultLocale: 'es',
      // Añade más configuraciones según sea necesario
  },
  
}

module.exports = nextConfig
