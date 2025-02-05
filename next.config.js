/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.sanity.io'],
  },
  i18n: {
      locales: ['en', 'es'],
      defaultLocale: 'es',
      // Añade más configuraciones según sea necesario
  },
  
}

module.exports = nextConfig
