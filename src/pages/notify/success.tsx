"use client"
import Head from 'next/head'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Open_Sans } from 'next/font/google'
import Link from 'next/link'

const openSans = Open_Sans({ subsets: ['latin'] })

// Página legacy de notificación de éxito del gateway CardNet eliminada.
// Ahora el flujo de éxito se maneja únicamente vía /store/checkout/success/[tracking].
export default function PaymentSuccessPage(){
  return (
    <main className={openSans.className}>
      <Head><title>Confirmación de orden | La Fabbrica</title></Head>
      <Header />
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center px-6 py-40">
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-lg shadow-sm p-8 text-center space-y-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Página de retorno removida</h1>
          <p className="text-slate-600 text-sm leading-relaxed">La integración de pagos fue eliminada. Si acabas de crear una orden deberías haber sido redirigido automáticamente a la página de confirmación con tu número de tracking.</p>
          <div className="flex flex-col gap-3">
            <Link href="/store" className="inline-flex justify-center px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-sm hover:bg-slate-800">Ir a la tienda</Link>
            <Link href="/store/checkout" className="inline-flex justify-center px-6 py-3 border border-slate-300 text-slate-700 text-sm font-medium rounded-sm hover:bg-slate-50">Crear nueva orden</Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
