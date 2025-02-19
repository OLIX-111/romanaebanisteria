"use client"

import { useFormik } from "formik"
import * as Yup from "yup"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

const validationSchema = Yup.object({
  firstName: Yup.string().required("El nombre es requerido"),
  lastName: Yup.string().required("El apellido es requerido"),
  email: Yup.string().email("Correo electrónico inválido").required("El correo electrónico es requerido"),
  phone: Yup.string()
    .matches(/^\+?[0-9]{10,}$/, "Número de teléfono inválido")
    .required("El teléfono es requerido"),
  message: Yup.string().min(10, "El mensaje debe tener al menos 10 caracteres").required("El mensaje es requerido"),
})

export function ContactForm() {
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Handle form submission here
        console.log("Form values:", values)
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulated API call
      } catch (error) {
        console.error("Error submitting form:", error)
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white  shadow-lg p-8"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Solicita tu Cotización</h2>
      <p className="text-gray-600 mb-6">
        Déjanos tus datos y uno de nuestros asesores se pondrá en contacto contigo lo antes posible.
      </p>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Nombre"
              {...formik.getFieldProps("firstName")}
              className={`w-full px-4 py-3  border ${
                formik.touched.firstName && formik.errors.firstName
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:border-primary focus:ring-primary"
              } focus:ring-2 focus:ring-opacity-20 outline-none transition-colors`}
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.firstName}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Apellido"
              {...formik.getFieldProps("lastName")}
              className={`w-full px-4 py-3  border ${
                formik.touched.lastName && formik.errors.lastName
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:border-primary focus:ring-primary"
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
            placeholder="Correo Electrónico"
            {...formik.getFieldProps("email")}
            className={`w-full px-4 py-3 border ${
              formik.touched.email && formik.errors.email
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:border-primary focus:ring-primary"
            } focus:ring-2 focus:ring-opacity-20 outline-none transition-colors`}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-sm text-red-500">{formik.errors.email}</p>
          )}
        </div>

        <div>
          <input
            type="tel"
            placeholder="Teléfono de Contacto"
            {...formik.getFieldProps("phone")}
            className={`w-full px-4 py-3 border ${
              formik.touched.phone && formik.errors.phone
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:border-primary focus:ring-primary"
            } focus:ring-2 focus:ring-opacity-20 outline-none transition-colors`}
          />
          {formik.touched.phone && formik.errors.phone && (
            <p className="mt-1 text-sm text-red-500">{formik.errors.phone}</p>
          )}
        </div>

        <div>
          <textarea
            placeholder="Mensaje"
            rows={4}
            {...formik.getFieldProps("message")}
            className={`w-full px-4 py-3 border ${
              formik.touched.message && formik.errors.message
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:border-primary focus:ring-primary"
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
              <span>Enviando...</span>
            </>
          ) : (
            <span>Enviar Consulta</span>
          )}
        </button>

        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mt-6">
          <p className="flex items-center">
            Atendemos proyectos a nivel nacional
          </p>
          |
          <p className="flex items-center">
            Resolvemos solicitudes en 24-48 horas
          </p>
        </div>
      </form>
    </motion.div>
  )
}

