import Image from 'next/image'
import { Inter, Open_Sans } from 'next/font/google'
const openSans = Open_Sans({ subsets: ['latin'] })
import { useTranslation } from '@/hook/UseTranslation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Head from 'next/head';

export default function Terms() {
  const dict = useTranslation();

  return (
    <>
      <Head>
        <title>
          Ebanistería y Carpintería en Aluminio de Alta Calidad | La Fabbrica
        </title>
        <meta name="description" content="La Fabbrica, la fábrica más grande de ebanistería y carpintería en aluminio en La Romana. Más de 48 años ofreciendo soluciones personalizadas para proyectos residenciales, hoteleros e inmobiliarios en la República Dominicana." />
        <link rel="icon" type="image/png" href="/isotipo.png" />
      </Head>
      <main className={`${openSans.className} pt-28`}>
        <Header />
        <section className="container mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Términos y Condiciones</h1>

          <p className="text-gray-700 mb-4">Última actualización: 28/02/2025</p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Introducción</h2>
          <p className="text-gray-700">
            Bienvenido a <strong>La Fabbrica</strong>. Al acceder y utilizar nuestro sitio web 
            (<a href="www.romanaebanisteria.com" className="text-blue-600 underline">www.romanaebanisteria.com</a>), 
            aceptas cumplir con los siguientes términos y condiciones de uso. Si no estás de acuerdo con alguno de estos términos, 
            por favor, no utilices nuestro sitio.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Información de Contacto</h2>
          <p className="text-gray-700">
            Para cualquier consulta, puedes comunicarte con nosotros a través de los siguientes medios:
          </p>
          <ul className="list-disc pl-6 text-gray-700">
            <li><strong>Correo Electrónico:</strong> <a href="mailto:info@grupochavon.com" className="text-blue-600 underline">info@grupochavon.com</a></li>
            <li><strong>Teléfono | WhatsApp:</strong> <a href="https://wa.me/18292222483" className="text-blue-600 underline">+1 (829) 222-2483</a></li>
            <li><strong>Horario de Atención:</strong></li>
            <ul className="list-disc pl-6">
              <li>Lunes - Viernes: 8:00 AM - 6:00 PM</li>
              <li>Sábados: 8:00 AM - 1:00 PM</li>
            </ul>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Uso del Sitio Web</h2>
          <p className="text-gray-700">
            Este sitio web está destinado a proporcionar información sobre nuestros productos y servicios de ebanistería y carpintería en aluminio, 
            así como permitir la solicitud de cotizaciones y contacto con nuestros asesores.
          </p>
          <p className="text-gray-700">Al utilizar nuestro sitio, aceptas:</p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>No utilizarlo con fines ilícitos.</li>
            <li>No intentar vulnerar la seguridad del sitio ni interferir con su funcionamiento.</li>
            <li>No copiar, distribuir o modificar el contenido sin autorización.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Propiedad Intelectual</h2>
          <p className="text-gray-700">
            Todos los contenidos de este sitio web, incluidos textos, imágenes, logotipos y diseños, son propiedad de 
            <strong> La Fabbrica</strong> o de terceros con licencia. No está permitido el uso de estos materiales sin el 
            consentimiento previo por escrito.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Recopilación y Uso de Datos</h2>
          <p className="text-gray-700">
            Utilizamos <strong>Google Analytics</strong> para analizar el tráfico del sitio web y mejorar la experiencia del usuario. 
            También utilizamos <strong>Google Maps</strong> para mostrar la ubicación de nuestra empresa. Al usar nuestro sitio, 
            aceptas el uso de estas herramientas y la recopilación de datos conforme a nuestra <a href="/privacy-policy" className="text-blue-600 underline">Política de Privacidad</a>.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Políticas de Cotización y Servicios</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Las cotizaciones solicitadas a través del sitio web son informativas y no constituyen un compromiso de compra.</li>
            <li>Nos reservamos el derecho de modificar precios y condiciones sin previo aviso.</li>
            <li>La ejecución de cualquier servicio está sujeta a disponibilidad y confirmación de nuestro equipo.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Limitación de Responsabilidad</h2>
          <p className="text-gray-700">
            No garantizamos que el sitio web esté disponible de forma ininterrumpida o libre de errores. **La Fabbrica** no se hace responsable 
            por daños o pérdidas derivadas del uso del sitio web o de la información contenida en él.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Enlaces a Terceros</h2>
          <p className="text-gray-700">
            Nuestro sitio puede contener enlaces a sitios de terceros, como Google Maps o redes sociales. No tenemos control sobre el contenido de estos 
            sitios y no nos hacemos responsables de sus políticas o prácticas.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Modificaciones a los Términos</h2>
          <p className="text-gray-700">
            Podemos actualizar estos términos en cualquier momento. Cualquier cambio será publicado en esta página con la fecha de actualización. 
            Se recomienda revisar periódicamente estos términos para estar informado sobre posibles modificaciones.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Legislación Aplicable</h2>
          <p className="text-gray-700">
            Estos términos y condiciones se rigen por las leyes de la República Dominicana. Cualquier disputa será resuelta ante los tribunales 
            competentes de La Romana, República Dominicana.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Contacto</h2>
          <p className="text-gray-700">
            Si tienes preguntas sobre estos términos, puedes escribirnos a:
          </p>
          <ul className="list-disc pl-6 text-gray-700">
            <li><strong>Correo Electrónico:</strong> <a href="mailto:info@grupochavon.com" className="text-blue-600 underline">info@grupochavon.com</a></li>
            <li><strong>Teléfono | WhatsApp:</strong> <a href="https://wa.me/18292222483" className="text-blue-600 underline">+1 (829) 222-2483</a></li>
          </ul>
        </section>
        <Footer />
      </main>
    </>
  )
}
