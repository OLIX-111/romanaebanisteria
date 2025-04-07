"use client"

import { useState } from "react"

export function SuspendedBanner() {
  const [dismissed, setDismissed] = useState(false)

  // Allow temporary dismissal for user convenience
  const handleDismiss = () => {
    setDismissed(true)
    // Optional: Set a timeout to show the banner again after some time
    setTimeout(() => setDismissed(false), 1000 * 60 * 30) // 30 minutes
  }

  if (dismissed) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-lg overflow-hidden border border-yellow-200 shadow-2xl">
          {/* Header */}
          <div className="bg-amber-50 border-b border-yellow-100 px-6 py-4">
            <div className="flex items-center gap-2 text-amber-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
              </svg>
              <h2 className="text-xl md:text-2xl font-bold">Cuenta Suspendida Temporalmente</h2>
            </div>
            <p className="text-amber-700 text-base mt-1">Se requiere actualizar información de pago</p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="mb-6 text-amber-800 bg-amber-50 p-4 rounded-lg border border-amber-100">
              <p className="text-sm md:text-base">
                Hemos detectado un pago pendiente en tu cuenta. Entendemos que pueden surgir imprevistos, y queremos
                ayudarte a solucionarlo. Por favor, regulariza tu situación y tu servicio se reactivará de inmediato,
                permitiéndote seguir disfrutando de todos los beneficios.
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 text-amber-600 flex-shrink-0"
              >
                <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                <line x1="2" x2="22" y1="10" y2="10"></line>
              </svg>
              <div className="text-amber-800">
                <h3 className="font-medium">Actualiza tu información de pago</h3>
                <p className="text-sm mt-1">
                  Haz clic en el botón de abajo para ir a nuestro portal de pagos seguro y actualizar tu información.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2 flex flex-col sm:flex-row sm:justify-between gap-3">
            

            <button
              onClick={() => window.open("https://app.lemonsqueezy.com/my-orders", "_blank")}
              className="px-4 py-2 bg-gray-600 hover:bg-amber-700 text-white rounded-md transition-colors w-full sm:w-auto order-1 sm:order-2 font-medium flex items-center justify-center gap-2"
            >
              Actualizar información de pago
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" x2="21" y1="14" y2="3"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

