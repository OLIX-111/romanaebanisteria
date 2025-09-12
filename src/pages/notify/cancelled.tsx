"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { XCircle, ArrowLeft, CreditCard } from "lucide-react"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function PaymentCancelledPage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string>("")

  useEffect(() => {
    // Extract SESSION from URL params
    const session = router.query.SESSION as string || router.query.session as string
    setSessionId(session || "")
    
    console.log("[Payment Cancelled] Router query:", router.query)
    console.log("[Payment Cancelled] SESSION ID found:", session)
  }, [router.query])

  return (
    <main className={openSans.className}>
      <Head>
        <title>Pago cancelado | Romana Ebanistería</title>
      </Head>
      <Header />
      
      <div className="min-h-screen bg-slate-50/30">
        <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
          <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-8 py-8 bg-orange-50 border-b border-orange-200">
              <div className="flex items-center gap-4">
                <XCircle className="w-12 h-12 text-orange-600" />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-orange-900">
                    Pago cancelado
                  </h1>
                  <p className="text-lg text-orange-700">
                    Has cancelado el proceso de pago
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              <div className="text-center space-y-6">
                <div className="max-w-md mx-auto">
                  <h2 className="text-xl font-semibold text-slate-900 mb-3">
                    ¿Qué pasó?
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    El proceso de pago fue cancelado antes de completarse. Tu tarjeta no fue cargada 
                    y los productos permanecen en tu carrito.
                  </p>
                </div>

                {sessionId && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-md mx-auto">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CreditCard className="w-4 h-4" />
                      <span>Sesión: {sessionId}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4 max-w-sm mx-auto">
                  <h3 className="text-lg font-semibold text-slate-900">
                    ¿Qué puedes hacer ahora?
                  </h3>
                  <ul className="text-left space-y-2 text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Regresar al carrito y intentar el pago nuevamente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Usar una tarjeta diferente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Contactar con nuestro equipo de soporte</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/store/checkout"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold tracking-tight hover:bg-accent transition-colors rounded-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al checkout
                </Link>
                <Link
                  href="/store/cart"
                  className="inline-flex items-center justify-center px-8 py-4 border border-slate-300 text-slate-700 font-semibold tracking-tight hover:bg-slate-50 transition-colors rounded-sm"
                >
                  Ver carrito
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 border border-slate-300 text-slate-700 font-semibold tracking-tight hover:bg-slate-50 transition-colors rounded-sm"
                >
                  Contactar soporte
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-white rounded-lg border border-slate-200/60 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Información importante</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>• Tu carrito se mantiene guardado y puedes completar la compra cuando desees</p>
              <p>• No se realizó ningún cargo a tu tarjeta</p>
              <p>• Si experimentas problemas técnicos, nuestro equipo puede ayudarte</p>
            </div>
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">
                Si necesitas ayuda, contáctanos por WhatsApp al +1 (829) 222-2483 o 
                envíanos un correo a info@grupochavon.com
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
