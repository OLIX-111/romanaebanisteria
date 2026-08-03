"use client"

import { useRouter } from "next/router"

export default function ServiceHero() {
  const { locale } = useRouter() as { locale: 'en' | 'es' }

  return (
    <div className="relative isolate overflow-hidden flex items-center justify-center py-32 md:py-48 lg:py-64">
      {/* Video de YouTube de fondo */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-black">
        <iframe
          src="https://www.youtube.com/embed/TxmBzBeRa3M?autoplay=1&mute=1&loop=1&playlist=TxmBzBeRa3M&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1"
          title="La Fabbrica background video"
          allow="autoplay; encrypted-media"
          className="absolute border-0 pointer-events-none"
          style={{
            width: '100vw',
            height: '56.25vw',
            minHeight: '100vh',
            minWidth: '177.78vh',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-medium text-white mb-6">
          {locale === "es"
            ? "Servicios de Ebanistería"
            : "Services of Carpentry"}
        </h2>
      </div>
    </div>
  )
}
