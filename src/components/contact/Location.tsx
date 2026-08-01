"use client"

import { useTranslation } from "@/hook/UseTranslation"
import { Navigation } from "lucide-react"
import { motion } from "framer-motion"

export default function ElegantLocationSection() {
  const dict = useTranslation()
  const { locationSection } = dict

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{locationSection.heading}</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {locationSection.subheading}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Mapa embed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="overflow-hidden rounded-xl"
            style={{ height: "500px" }}
          >
            <iframe
              src="https://maps.google.com/maps?q=18.4363419,-68.9984306&z=17&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">{locationSection.showroomHeading}</h3>
              <div className="space-y-2 text-gray-400">
                <p className="font-medium text-lg text-gray-200">{locationSection.companyTitle}</p>
                <p>{locationSection.addressLine1}</p>
                <p>{locationSection.addressLine2}</p>
              </div>
            </div>

            <div className="rounded-lg p-6">
              <p className="text-gray-400 mb-4">
                {locationSection.visitMessage}
              </p>
              <a
                href="https://maps.app.goo.gl/ipy5cBnW42YvVVRh7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-md"
              >
                <Navigation className="w-5 h-5" />
                <span>{locationSection.howToGetThere}</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
