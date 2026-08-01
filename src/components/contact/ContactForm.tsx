"use client"

import { useFormik } from "formik"
import * as Yup from "yup"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, CheckCircle, AlertCircle, X } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "@/hook/UseTranslation"

// Definición del tipo de notificación
type NotificationType = {
  type: "success" | "error"
  message: string
}

// Componente Toast para mostrar notificaciones
const Toast = ({ notification, onClose }: { notification: NotificationType; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg ${
        notification.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
      }`}
    >
      <div className="flex items-center">
        {notification.type === "success" ? (
          <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
        ) : (
          <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
        )}
        <p>{notification.message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-4 p-1 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export function ContactForm() {
  const dict = useTranslation()
  const { contactForm } = dict

  // Estado para manejar las notificaciones
  const [notification, setNotification] = useState<NotificationType | null>(null)

  const validationSchema = Yup.object({
    firstName: Yup.string().required(contactForm.validationErrors.nameRequired),
    lastName: Yup.string().required(contactForm.validationErrors.lastNameRequired),
    email: Yup.string()
      .email(contactForm.validationErrors.emailInvalid)
      .required(contactForm.validationErrors.emailRequired),
    phone: Yup.string()
      .matches(/^\+?[0-9]{10,}$/, contactForm.validationErrors.phoneInvalid)
      .required(contactForm.validationErrors.phoneRequired),
    message: Yup.string()
      .min(10, contactForm.validationErrors.messageMinLength)
      .required(contactForm.validationErrors.messageRequired),
  })

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        })

        const data = await response.json()

        if (response.ok) {
          setNotification({
            type: "success",
            message: contactForm.notifications.success,
          })
          resetForm()
        } else {
          setNotification({
            type: "error",
            message: `Error: ${data.message || contactForm.notifications.processErrorDefault}`,
          })
        }
      } catch (error) {
        console.error("Error submitting form:", error)
        setNotification({
          type: "error",
          message: contactForm.notifications.generalError,
        })
      } finally {
        setSubmitting(false)
      }
    },
  })

  // Función para cerrar la notificación
  const closeNotification = () => {
    setNotification(null)
  }

  // Configurar un temporizador para cerrar automáticamente la notificación después de 5 segundos
  if (notification) {
    setTimeout(() => {
      closeNotification()
    }, 5000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-zinc-900 border border-white/10 p-8"
    >
      {/* Sistema de notificaciones */}
      <AnimatePresence>
        {notification && <Toast notification={notification} onClose={closeNotification} />}
      </AnimatePresence>

      <h2 className="text-2xl font-bold text-white mb-2">{contactForm.heading}</h2>
      <p className="text-gray-400 mb-6">{contactForm.subheading}</p>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder={contactForm.placeholders.firstName}
              {...formik.getFieldProps("firstName")}
              className={`w-full px-4 py-3 border ${
                formik.touched.firstName && formik.errors.firstName
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-white/15 bg-black/30 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500"
              } focus:ring-2 focus:ring-opacity-20 outline-none transition-colors`}
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.firstName}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder={contactForm.placeholders.lastName}
              {...formik.getFieldProps("lastName")}
              className={`w-full px-4 py-3 border ${
                formik.touched.lastName && formik.errors.lastName
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-white/15 bg-black/30 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500"
              } focus:ring-2 focus:ring-opacity-20 outline-none transition-colors`}
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <input
            type="email"
            placeholder={contactForm.placeholders.email}
            {...formik.getFieldProps("email")}
            className={`w-full px-4 py-3 border ${
              formik.touched.email && formik.errors.email
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-white/15 bg-black/30 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500"
            } focus:ring-2 focus:ring-opacity-20 outline-none transition-colors`}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-sm text-red-500">{formik.errors.email}</p>
          )}
        </div>

        <div>
          <input
            type="tel"
            placeholder={contactForm.placeholders.phone}
            {...formik.getFieldProps("phone")}
            className={`w-full px-4 py-3 border ${
              formik.touched.phone && formik.errors.phone
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-white/15 bg-black/30 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500"
            } focus:ring-2 focus:ring-opacity-20 outline-none transition-colors`}
          />
          {formik.touched.phone && formik.errors.phone && (
            <p className="mt-1 text-sm text-red-500">{formik.errors.phone}</p>
          )}
        </div>

        <div>
          <textarea
            placeholder={contactForm.placeholders.message}
            rows={4}
            {...formik.getFieldProps("message")}
            className={`w-full px-4 py-3 border ${
              formik.touched.message && formik.errors.message
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-white/15 bg-black/30 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500"
            } focus:ring-2 focus:ring-opacity-20 outline-none transition-colors resize-none`}
          />
          {formik.touched.message && formik.errors.message && (
            <p className="mt-1 text-sm text-red-500">{formik.errors.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 transition-colors flex items-center justify-center space-x-2"
        >
          {formik.isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{contactForm.sendingText}</span>
            </>
          ) : (
            <span>{contactForm.buttonText}</span>
          )}
        </button>

        <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mt-6">
          <p className="flex items-center">{contactForm.disclaimers.location}</p>|
          <p className="flex items-center">{contactForm.disclaimers.responseTime}</p>
        </div>
      </form>
    </motion.div>
  )
}

