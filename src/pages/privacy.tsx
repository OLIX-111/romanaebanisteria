import Image from 'next/image'
import { Inter, Open_Sans } from 'next/font/google'
const openSans = Open_Sans({ subsets: ['latin'] })
import { useTranslation } from '@/hook/UseTranslation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Head from 'next/head';

export default function Privacy() {
  const dict = useTranslation();

  return (
    <>
      <Head>
        <title>
          Política de Privacidad | ROMAna Ebanistería
        </title>
        <meta name="description" content="Política de privacidad de ROMAna Ebanistería. Conoce cómo protegemos y utilizamos tu información personal cuando navegas en nuestra web y solicitas nuestros servicios." />
        <link rel="icon" href="/home/ebanisteria.png" />
      </Head>
      <main className={`${openSans.className}`}>
        <Header />
        <section className="container mx-auto px-6 py-16 mt-20">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Privacidad</h1>

          <p className="text-gray-700 mb-4">Última actualización: 28/02/2025</p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Introducción</h2>
          <p className="text-gray-700">
            En <strong>ROMAna Ebanistería</strong>, nos comprometemos a proteger tu privacidad y garantizar la seguridad de tu información personal. 
            Esta política de privacidad explica cómo recopilamos, utilizamos y protegemos tus datos cuando visitas nuestro sitio web 
            (<a href="www.romanaebanisteria.com" className="text-blue-600 underline">www.romanaebanisteria.com</a>).
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Información que Recopilamos</h2>
          <p className="text-gray-700">Podemos recopilar los siguientes tipos de información cuando interactúas con nuestro sitio:</p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Información personal: Nombre, correo electrónico, número de teléfono y detalles de la empresa (si aplica) cuando completas formularios de contacto o solicitud de cotización.</li>
            <li>Datos de navegación: Dirección IP, tipo de navegador, páginas visitadas y tiempo en el sitio mediante herramientas como <strong>Google Analytics</strong>.</li>
            <li>Información sobre ubicaciones a través de <strong>Google Maps</strong> cuando buscas nuestra dirección.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Uso de la Información</h2>
          <p className="text-gray-700">La información recopilada se utiliza para:</p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Procesar solicitudes de cotización y consultas de clientes.</li>
            <li>Mejorar la experiencia de usuario en nuestra página web.</li>
            <li>Analizar el tráfico web con <strong>Google Analytics</strong>.</li>
            <li>Brindar atención personalizada mediante WhatsApp o correo electrónico.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Protección de Datos</h2>
          <p className="text-gray-700">
            Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal. Sin embargo, debes tener en cuenta que 
            ninguna transmisión de datos por Internet es completamente segura.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Cookies y Herramientas de Análisis</h2>
          <p className="text-gray-700">
            Utilizamos cookies y herramientas de análisis para mejorar la experiencia del usuario. Puedes configurar tu navegador para rechazar o eliminar 
            cookies si prefieres limitar su uso.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Compartición de Datos</h2>
          <p className="text-gray-700">
            No vendemos ni compartimos tu información personal con terceros, excepto cuando sea necesario para cumplir con obligaciones legales o mejorar 
            nuestros servicios (ej. análisis con <strong>Google Analytics</strong>).
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Derechos del Usuario</h2>
          <p className="text-gray-700">Tienes derecho a:</p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Solicitar acceso a los datos personales que hemos recopilado.</li>
            <li>Solicitar la corrección o eliminación de tus datos.</li>
            <li>Oponerte al uso de tus datos para ciertos fines.</li>
          </ul>
          <p className="text-gray-700">
            Para ejercer estos derechos, contáctanos a través del correo <a href="mailto:info@grupochavon.com" className="text-blue-600 underline">info@grupochavon.com</a>.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Cambios en la Política</h2>
          <p className="text-gray-700">
            Nos reservamos el derecho de modificar esta política de privacidad en cualquier momento. Cualquier cambio será notificado en esta página con 
            la fecha de actualización correspondiente.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Contacto</h2>
          <p className="text-gray-700">Si tienes dudas sobre esta política de privacidad, puedes contactarnos a:</p>
          <ul className="list-disc pl-6 text-gray-700">
            <li><strong>Correo Electrónico:</strong> <a href="mailto:info@grupochavon.com" className="text-blue-600 underline">info@grupochavon.com</a></li>
            <li><strong>Teléfono | WhatsApp:</strong> <a href="https://wa.me/18292222483" className="text-blue-600 underline">+1 (829) 222-2483</a></li>
            <li><strong>Horario de Atención:</strong></li>
            <ul className="list-disc pl-6">
              <li>Lunes - Viernes: 8:00 AM - 6:00 PM</li>
              <li>Sábados: 8:00 AM - 1:00 PM</li>
            </ul>
          </ul>
        </section>
        <Footer />
      </main>
    </>
  )
}
