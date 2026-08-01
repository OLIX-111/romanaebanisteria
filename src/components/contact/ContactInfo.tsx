"use client"

import { motion } from "framer-motion"
import { Mail, Phone, Clock, Instagram, Facebook } from "lucide-react"
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
        <h1 className="text-4xl font-bold text-white mb-4">{contactInfo.heading}</h1>
        <p className="text-gray-400 text-lg">
          {contactInfo.subheading}
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/5 p-3 rounded-lg">
            <Mail className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{contactInfo.emailLabel}</p>
            <a href="mailto:info@lafabbrica.do" className="text-lg text-white hover:text-orange-500 transition-colors">
              info@lafabbrica.do
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/5 p-3 rounded-lg">
            <Phone className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{contactInfo.phoneLabel}</p>
            <a href="tel:+14842025040" className="text-lg text-white hover:text-orange-500 transition-colors">
              +1 (484) 202-5040
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/5 p-3 rounded-lg">
            <Clock className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{contactInfo.scheduleLabel}</p>
            <div className="space-y-1">
              <p className="text-gray-300">{contactInfo.schedule1}</p>
              <p className="text-gray-300">{contactInfo.schedule2}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Redes sociales */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-3">Síguenos</p>
        <div className="flex gap-3">
          <a
            href="https://www.instagram.com/lafabbrica.rd/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/40 px-4 py-2.5 rounded-lg text-white hover:text-orange-400 transition-all duration-200"
          >
            <Instagram className="w-5 h-5" />
            <span className="text-sm">Instagram</span>
          </a>
          <a
            href="https://web.facebook.com/profile.php?id=61592563232977"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/40 px-4 py-2.5 rounded-lg text-white hover:text-orange-400 transition-all duration-200"
          >
            <Facebook className="w-5 h-5" />
            <span className="text-sm">Facebook</span>
          </a>
        </div>
      </div>
    </motion.div>
  )
}

