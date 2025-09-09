"use client"

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    PWCheckout: any
  }
}

interface CardnetPaymentFormProps {
  amount: number
  currency: string
  invoice: string
  onTokenCreated: (token: string) => void
  onError: (error: string) => void
  isProcessing: boolean
}

export default function CardnetPaymentForm({
  amount,
  currency,
  invoice,
  onTokenCreated,
  onError,
  isProcessing
}: CardnetPaymentFormProps) {
  const formRef = useRef<HTMLDivElement>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isFormReady, setIsFormReady] = useState(false)

  // CardNET configuration
  const publicKey = process.env.NEXT_PUBLIC_CARDNET_PUBLIC_KEY
  const isLabMode = process.env.NODE_ENV !== 'production'

  useEffect(() => {
    if (isScriptLoaded && window.PWCheckout && !isFormReady) {
      initializeCardnetForm()
    }
  }, [isScriptLoaded, isFormReady])

  const initializeCardnetForm = () => {
    try {
      // Configure CardNET checkout
      window.PWCheckout.SetProperties({
        form_id: 'cardnet-payment-form',
        autoSubmit: false,
        showAmount: true,
        amount: amount.toString(),
        currency: currency,
        language: 'ESP',
        environment: isLabMode ? 'lab' : 'production'
      })

      // Bind token creation event
      window.PWCheckout.Bind('tokenCreated', (data: any) => {
        if (data.token) {
          onTokenCreated(data.token)
        } else if (data.error) {
          onError(data.error.message || 'Error al procesar la tarjeta')
        }
      })

      // Bind form ready event
      window.PWCheckout.Bind('formReady', () => {
        setIsFormReady(true)
      })

      // Bind form error event
      window.PWCheckout.Bind('formError', (error: any) => {
        onError(error.message || 'Error en el formulario de pago')
      })

      setIsFormReady(true)
    } catch (error: any) {
      console.error('Error initializing CardNET form:', error)
      onError('Error al inicializar el formulario de pago')
    }
  }

  const handleScriptLoad = () => {
    setIsScriptLoaded(true)
  }

  const handleScriptError = () => {
    onError('Error al cargar el formulario de pago')
  }

  return (
    <>
      {/* Load CardNET script */}
      <Script
        src={`https://lab.cardnet.com.do/v1/Scripts/PWCheckout.js?key=${publicKey}`}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="afterInteractive"
      />

      {/* Payment form container */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-slate-200/60 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Información de pago
          </h3>

          {/* CardNET form will be injected here */}
          <div
            id="cardnet-payment-form"
            ref={formRef}
            className="min-h-[400px] bg-slate-50 rounded-md border-2 border-dashed border-slate-200 flex items-center justify-center"
          >
            {!isFormReady && !isProcessing && (
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-slate-600">Cargando formulario de pago seguro...</p>
              </div>
            )}

            {isProcessing && (
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-slate-600">Procesando pago...</p>
              </div>
            )}
          </div>

          {/* Security notice */}
          <div className="mt-4 p-4 bg-slate-50 rounded-md">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <div className="text-xs text-slate-600 leading-relaxed">
                <p className="font-medium text-slate-700 mb-1">Pago seguro con CardNET</p>
                <p>Tus datos de tarjeta están protegidos con encriptación SSL de 256 bits. No almacenamos información sensible de tu tarjeta.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Amount summary */}
        <div className="bg-slate-900 text-white rounded-lg p-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total a pagar:</span>
            <span className="text-2xl font-bold">
              {amount.toLocaleString('es-DO', { style: 'currency', currency: currency })}
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-2">
            Factura: {invoice}
          </p>
        </div>
      </div>
    </>
  )
}
