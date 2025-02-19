"use client"

import React, { useState } from "react"
import dynamic from "next/dynamic"

// Import dinámico sin SSR
const GoogleMapReact = dynamic(() => import("google-map-react"), {
  ssr: false,
})

import { MapPin, Navigation, X } from "lucide-react"
import { motion } from "framer-motion"

interface MarkerProps {
  lat: number
  lng: number
  onClick: () => void
}

const LocationMarker = ({ onClick }: MarkerProps) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ scale: 1.1 }}
    onClick={onClick}
    className="relative -translate-x-1/2 -translate-y-1/2 cursor-pointer"
  >
    <div className="bg-primary rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow">
      <MapPin className="w-6 h-6 text-white" />
    </div>
  </motion.div>
)

interface InfoWindowProps {
  lat: number
  lng: number
  onClose: () => void
}

const InfoWindow = ({ onClose }: InfoWindowProps) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72"
  >
    <div className="bg-white rounded-lg shadow-xl p-4 relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
      <h4 className="font-semibold text-gray-900 mb-1">ROMAna Ebanistería</h4>
      <p className="text-sm text-gray-600 mb-2">Calle 4, No. 7, Sector Reparto Torres</p>
      <a
        href="https://maps.google.com/?q=Calle+4,+No.+7,+Sector+Reparto+Torres,+La+Romana,+República+Dominicana"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <Navigation className="w-3 h-3" />
        <span>Ver en Google Maps</span>
      </a>
    </div>
  </motion.div>
)

interface MarkerWrapperProps extends MarkerProps {
  showInfo: boolean
  onCloseInfo: () => void
}

const MarkerWrapper: React.FC<MarkerWrapperProps> = ({ lat, lng, onClick, showInfo, onCloseInfo }) => (
  <>
    <LocationMarker lat={lat} lng={lng} onClick={onClick} />
    {showInfo && <InfoWindow lat={lat} lng={lng} onClose={onCloseInfo} />}
  </>
)

export default function ElegantLocationSection() {
  const [showInfo, setShowInfo] = useState(false)

  const mapCenter = {
    lat: 18.4363419,
    lng: -68.9984306,
  }

  const mapOptions = {
    styles: [
      {
        featureType: "all",
        elementType: "geometry",
        stylers: [{ lightness: 50 }],
      },
      {
        featureType: "all",
        elementType: "labels",
        stylers: [{ lightness: 20 }],
      },
    ],
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: false,
    fullscreenControl: true,
    clickableIcons: false,
  }

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nuestra Ubicación</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre nuestro showroom y fábrica en el corazón de La Romana
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl overflow-hidden shadow-2xl relative"
            style={{ width: "100%", height: "500px" }}
          >
            {/* Aquí el componente de GoogleMapReact cargado dinámicamente */}
            <GoogleMapReact
              bootstrapURLKeys={{ key: "AIzaSyBzThRkDOyyClUmtYw8NNtOmWkUk4A8Kew" }}
              defaultCenter={mapCenter}
              defaultZoom={16}
              options={mapOptions}
              onClick={() => setShowInfo(false)}
            >
              <MarkerWrapper
                lat={mapCenter.lat}
                lng={mapCenter.lng}
                onClick={() => setShowInfo(true)}
                showInfo={showInfo}
                onCloseInfo={() => setShowInfo(false)}
              />
            </GoogleMapReact>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Showroom & Fábrica</h3>
              <div className="space-y-2 text-gray-600">
                <p className="font-medium text-lg">ROMAna Ebanistería</p>
                <p>Calle 4, No. 7, Sector Reparto Torres</p>
                <p>La Romana, República Dominicana</p>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-inner">
              <p className="text-gray-700 mb-4">
                Atendemos a clientes en toda la región este y a nivel nacional. Visítanos para conocer nuestras
                instalaciones y soluciones en ebanistería.
              </p>
              <a
                href="https://maps.google.com/?q=Calle+4,+No.+7,+Sector+Reparto+Torres,+La+Romana,+República+Dominicana"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-md"
              >
                <Navigation className="w-5 h-5" />
                <span>Cómo llegar</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
