"use client"

import { motion } from "framer-motion"
import { Mail, Phone, Clock } from "lucide-react"
import { useTranslation } from "@/hook/UseTranslation"

export function ContactInfo() {
  const dict = useTranslation()
  const { contactInfo } = dict
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{contactInfo.heading}</h1>
        <p className="text-gray-600 text-lg">
          {contactInfo.subheading}
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Mail className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{contactInfo.emailLabel}</p>
            <a href="mailto:info@grupochavon.com" className="text-lg hover:text-primary">
              info@grupochavon.com
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Phone className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{contactInfo.phoneLabel}</p>
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
            <p className="text-sm font-medium text-gray-600">{contactInfo.scheduleLabel}</p>
            <div className="space-y-1">
              <p className="text-gray-900">{contactInfo.schedule1}</p>
              <p className="text-gray-900">{contactInfo.schedule2}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

