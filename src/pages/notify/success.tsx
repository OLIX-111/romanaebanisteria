"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { CheckCircle, AlertTriangle, Loader2, CreditCard, Receipt } from "lucide-react"

const openSans = Open_Sans({ subsets: ["latin"] })

interface PaymentResult {
  loading: boolean
  data?: {
    normalized: {
      orderId: string
      transactionId: string
      responseCode: string
      approved: boolean
      authCode?: string
      rrn?: string
      maskedPan?: string
      message?: string
    }
    intent: {
      orderId: string
      amountMinor: number
      taxMinor: number
      currency: string
    }
  }
  error?: string
}

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [result, setResult] = useState<PaymentResult>({ loading: true })

  useEffect(() => {
    // Extract SESSION from URL params (GET) or from POST data
    const sessionId = router.query.SESSION as string || router.query.session as string

    console.log("[Payment Success] Router query:", router.query)
    console.log("[Payment Success] SESSION ID found:", sessionId)

    if (!sessionId) {
      // Check if there's an error parameter
      const errorParam = router.query.error as string
      const errorMessage = errorParam === "session_missing" 
        ? "No se recibió el parámetro SESSION de CardNet. Esto puede indicar un problema con la configuración de las URLs de retorno."
        : errorParam === "processing_error"
        ? "Error procesando el retorno de CardNet."
        : "SESSION parameter missing. Revisa la configuración de ReturnUrl en CardNet."
      
      setResult({ loading: false, error: errorMessage })
      return
    }

    // Verify payment status
    fetch(`/api/payments/cardnet/status?session=${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`)
        }

        // If payment is approved, process the order
        if (data.normalized?.approved) {
          try {
            // Get pending order data from sessionStorage
            const pendingOrderData = sessionStorage.getItem("pending_order")
            if (pendingOrderData) {
              const orderData = JSON.parse(pendingOrderData)
              
              // Process the order
              const processResponse = await fetch("/api/payments/process-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: orderData.orderId,
                  sessionId: sessionId,
                  transactionId: orderData.transactionId,
                  items: orderData.items,
                  customer: {
                    firstName: orderData.form.firstName,
                    lastName: orderData.form.lastName,
                    email: orderData.form.email,
                    phone: orderData.form.phone,
                    address: orderData.form.address,
                    city: orderData.form.city,
                    province: orderData.form.province,
                    postalCode: orderData.form.postalCode,
                    notes: orderData.form.notes,
                  },
                  totals: {
                    subtotal: orderData.subtotal,
                    tax: 0,
                    total: orderData.subtotal,
                  },
                  payment: {
                    responseCode: data.normalized.responseCode,
                    authCode: data.normalized.authCode,
                    rrn: data.normalized.rrn,
                    maskedPan: data.normalized.maskedPan,
                  }
                })
              })

              if (processResponse.ok) {
                const processResult = await processResponse.json()
                console.log("Order processed successfully:", processResult)
                
                // Store order snapshot for confirmation page
                try {
                  sessionStorage.setItem("last_order", JSON.stringify(processResult.orderSnapshot))
                  sessionStorage.removeItem("pending_order")
                } catch (e) {
                  console.warn("Could not store order snapshot:", e)
                }
              } else {
                console.error("Error processing order:", await processResponse.text())
              }
            }
          } catch (error) {
            console.error("Error processing order:", error)
            // Don't fail the success page if order processing fails
          }
        }

        setResult({ loading: false, data })
      })
      .catch((error) => {
        console.error("Error verifying payment:", error)
        setResult({ 
          loading: false, 
          error: error.message || "Error verificando el pago" 
        })
      })
  }, [router.query])

  const formatCurrency = (amountMinor: number, currency: string) => {
    const amount = amountMinor / 100
    return new Intl.NumberFormat("es-DO", { 
      style: "currency", 
      currency: currency === "214" ? "DOP" : "USD" 
    }).format(amount)
  }

  if (result.loading) {
    return (
      <main className={openSans.className}>
        <Head>
          <title>Verificando pago | Romana Ebanistería</title>
        </Head>
        <Header />
        <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
          <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm p-12 text-center max-w-md">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Verificando pago</h1>
            <p className="text-slate-600">
              Estamos confirmando tu transacción con el banco. Por favor espera...
            </p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (result.error) {
    return (
      <main className={openSans.className}>
        <Head>
          <title>Error en el pago | Romana Ebanistería</title>
        </Head>
        <Header />
        <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
          <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm p-12 text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Error en la verificación</h1>
            <p className="text-slate-600 mb-6">{result.error}</p>
            <div className="space-y-3">
              <Link 
                href="/store/checkout"
                className="inline-block w-full px-6 py-3 bg-primary text-white font-semibold tracking-tight hover:bg-accent transition-colors rounded-sm"
              >
                Intentar nuevamente
              </Link>
              <Link 
                href="/store/cart"
                className="inline-block w-full px-6 py-3 border border-slate-300 text-slate-700 font-semibold tracking-tight hover:bg-slate-50 transition-colors rounded-sm"
              >
                Volver al carrito
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const { normalized, intent } = result.data!
  const isApproved = normalized.approved

  return (
    <main className={openSans.className}>
      <Head>
        <title>{isApproved ? "Pago exitoso" : "Pago rechazado"} | Romana Ebanistería</title>
      </Head>
      <Header />
      
      <div className="min-h-screen bg-slate-50/30">
        <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
          <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
            {/* Header */}
            <div className={`px-8 py-8 ${isApproved ? "bg-emerald-50 border-b border-emerald-200" : "bg-red-50 border-b border-red-200"}`}>
              <div className="flex items-center gap-4">
                {isApproved ? (
                  <CheckCircle className="w-12 h-12 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-12 h-12 text-red-600" />
                )}
                <div>
                  <h1 className={`text-3xl font-bold tracking-tight ${isApproved ? "text-emerald-900" : "text-red-900"}`}>
                    {isApproved ? "¡Pago exitoso!" : "Pago no procesado"}
                  </h1>
                  <p className={`text-lg ${isApproved ? "text-emerald-700" : "text-red-700"}`}>
                    {isApproved 
                      ? "Tu transacción ha sido aprobada correctamente"
                      : normalized.message || "La transacción no pudo ser procesada"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="px-8 py-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Detalles de la transacción</h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-600">Orden:</span>
                    <span className="font-semibold text-slate-900">{normalized.orderId}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-600">ID Transacción:</span>
                    <span className="font-semibold text-slate-900">{normalized.transactionId}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-600">Código de respuesta:</span>
                    <span className={`font-semibold ${isApproved ? "text-emerald-600" : "text-red-600"}`}>
                      {normalized.responseCode}
                    </span>
                  </div>
                  {normalized.authCode && (
                    <div className="flex justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Código de autorización:</span>
                      <span className="font-semibold text-slate-900">{normalized.authCode}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-600">Monto:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(intent.amountMinor, intent.currency)}
                    </span>
                  </div>
                  {intent.taxMinor > 0 && (
                    <div className="flex justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Impuesto:</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(intent.taxMinor, intent.currency)}
                      </span>
                    </div>
                  )}
                  {normalized.rrn && (
                    <div className="flex justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Referencia:</span>
                      <span className="font-semibold text-slate-900">{normalized.rrn}</span>
                    </div>
                  )}
                  {normalized.maskedPan && (
                    <div className="flex justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Tarjeta:</span>
                      <span className="font-semibold text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        {normalized.maskedPan}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-200">
              {isApproved ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-700 mb-4">
                    <Receipt className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Recibirás un correo de confirmación con los detalles de tu pedido
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/order-confirmation"
                      className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white font-semibold tracking-tight hover:bg-slate-800 transition-colors rounded-sm"
                    >
                      Ver detalles del pedido
                    </Link>
                    <Link
                      href="/store"
                      className="inline-flex items-center justify-center px-8 py-4 border border-slate-300 text-slate-700 font-semibold tracking-tight hover:bg-slate-50 transition-colors rounded-sm"
                    >
                      Seguir comprando
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 mb-4">
                    Tu pago no pudo ser procesado. Puedes intentar nuevamente o contactar con nosotros.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/store/checkout"
                      className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold tracking-tight hover:bg-accent transition-colors rounded-sm"
                    >
                      Intentar nuevamente
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center px-8 py-4 border border-slate-300 text-slate-700 font-semibold tracking-tight hover:bg-slate-50 transition-colors rounded-sm"
                    >
                      Contactar soporte
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
