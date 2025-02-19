"use client"

import { motion } from "framer-motion"
import { Mail, Phone, Clock } from "lucide-react"

export function ContactInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contáctanos</h1>
        <p className="text-gray-600 text-lg">
          Si necesitas asesoría, cotizaciones o más información sobre nuestros servicios, estamos listos para ayudarte.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Mail className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Correo Electrónico</p>
            <a href="mailto:romanaebanisteriar@hotmail.com" className="text-lg hover:text-primary">
              romanaebanisteriar@hotmail.com
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Phone className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Teléfono | WhatsApp</p>
            <a href="tel:+18292222483" className="text-lg hover:text-primary">
              +1 (829) 222-2483
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Horario de Atención</p>
            <div className="space-y-1">
              <p className="text-gray-900">Lunes - Viernes: 8:00 AM - 6:00 PM</p>
              <p className="text-gray-900">Sábados: 8:00 AM - 1:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

