"use client"

import { useState } from "react"
import { Open_Sans } from "next/font/google"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { PortableText } from "@portabletext/react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getServiceBySlug } from "../../../../sanity/sanityQueries"
import { CheckCircle, AlertTriangle, Clock, Calendar, DollarSign, Tag } from "lucide-react"

const openSans = Open_Sans({ subsets: ["latin"] })

interface ServicePageProps {
  service: {
    name: string
    imageUrl: string
    slug: string
    gallery: string[]
    price: number
    categoryName: string
    description: any // This is a Portable Text block from Sanity
    availability: string
    duration: string
  }
}

const QuoteSchema = Yup.object().shape({
  fullName: Yup.string().required("Nombre completo es requerido"),
  email: Yup.string().email("Correo electrónico inválido").required("Correo electrónico es requerido"),
  phone: Yup.string().required("Número de teléfono es requerido"),
  company: Yup.string(),
  projectDescription: Yup.string().required("Descripción del proyecto es requerida"),
})

export default function ServicePage({ service }: ServicePageProps) {
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState<string>(service?.imageUrl || "")

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Servicio no encontrado</h2>
          <p className="text-gray-600 mb-4">Lo sentimos, no pudimos encontrar el servicio solicitado.</p>
          <a href="/" className="inline-block bg-primary text-white px-4 py-2">
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    setSubmitStatus("loading")
    setErrorMessage(null)

    try {
      const response = await fetch("/api/cotiza", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          serviceName: service.name,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Ocurrió un error al enviar la solicitud")
      }

      setSubmitStatus("success")
      resetForm()
    } catch (error: any) {
      setSubmitStatus("error")
      setErrorMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={`${openSans.className} bg-white min-h-screen`}>
      <Header />
      <div className="mt-24 bg-white py-8">
        <div className="container mx-auto px-4">
          <div className=" mx-auto">
            {/* Service Header - Simplified */}
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{service.name}</h1>
              <p className="text-lg text-gray-600 mt-2">
                Complete el formulario para recibir una cotización personalizada
              </p>
            </div>

            {/* Main Content - Form First on Mobile */}
            <div className="flex flex-col-reverse lg:flex-row lg:gap-12">
              {/* Left Column - Service Details */}
              <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
                {/* Main Image */}
                <div className="mb-6">
                  <img
                    src={activeImage || service.imageUrl || "/placeholder.svg"}
                    alt={service.name}
                    className="w-full h-auto object-cover border border-gray-200"
                  />

                  {/* Gallery */}
                  {service.gallery && service.gallery.length > 0 && (
                    <div className="mt-3 flex space-x-2 overflow-x-auto pb-2">
                      <div
                        onClick={() => setActiveImage(service.imageUrl)}
                        className={`cursor-pointer border ${activeImage === service.imageUrl ? "border-primary" : "border-gray-200"}`}
                      >
                        <img
                          src={service.imageUrl || "/placeholder.svg"}
                          alt={service.name}
                          className="h-16 w-16 object-cover"
                        />
                      </div>
                      {service.gallery.map((img, index) => (
                        <div
                          key={index}
                          onClick={() => setActiveImage(img)}
                          className={`cursor-pointer border ${activeImage === img ? "border-primary" : "border-gray-200"}`}
                        >
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`${service.name} ${index + 1}`}
                            className="h-16 w-16 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Service Info */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Información del Servicio</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                   {/*  {service.categoryName && (
                      <div className="flex items-center text-gray-700 border-b border-gray-100 pb-2">
                        <Tag className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <span className="text-sm text-gray-500">Categoría</span>
                          <p>{service.categoryName}</p>
                        </div>
                      </div>
                    )} */}
                    {service.duration && (
                      <div className="flex items-center text-gray-700 border-b border-gray-100 pb-2">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <span className="text-sm text-gray-500">Duración</span>
                          <p>{service.duration}</p>
                        </div>
                      </div>
                    )}
                    {service.availability && (
                      <div className="flex items-center text-gray-700 border-b border-gray-100 pb-2">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <span className="text-sm text-gray-500">Disponibilidad</span>
                          <p>{service.availability}</p>
                        </div>
                      </div>
                    )}
                    {/* {service.price > 0 && (
                      <div className="flex items-center text-gray-700 border-b border-gray-100 pb-2">
                        <DollarSign className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <span className="text-sm text-gray-500">Precio desde</span>
                          <p>${service.price.toLocaleString()}</p>
                        </div>
                      </div>
                    )} */}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Descripción del Servicio</h2>
                  <div className="prose max-w-none text-gray-700">
                    {typeof service.description === "string" ? (
                      <p>{service.description}</p>
                    ) : (
                      <PortableText value={service.description} />
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Quote Form */}
              <div className="w-full lg:w-1/2" id="cotizacion-form">
                <div className="bg-gray-50 border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200 bg-primary text-white">
                    <h2 className="text-2xl font-semibold">Solicitar Cotización</h2>
                    <p className="mt-2 text-white/90">
                      Complete el formulario y recibirá una cotización personalizada para {service.name}
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6 text-gray-700 bg-blue-50 p-3 border-l-4 border-blue-500">
                      <AlertTriangle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <p className="text-sm">
                        Los campos marcados son obligatorios para poder procesar su solicitud correctamente.
                      </p>
                    </div>

                    <Formik
                      initialValues={{
                        fullName: "",
                        email: "",
                        phone: "",
                        company: "",
                        projectDescription: "",
                      }}
                      validationSchema={QuoteSchema}
                      onSubmit={handleSubmit}
                    >
                      {({ errors, touched, isSubmitting }) => (
                        <Form className="space-y-5">
                          <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre completo <span className="text-red-500">*</span>
                            </label>
                            <Field
                              id="fullName"
                              name="fullName"
                              type="text"
                              className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:border-primary bg-white text-gray-900"
                            />
                            {errors.fullName && touched.fullName && (
                              <div className="text-red-500 text-sm mt-1">{errors.fullName}</div>
                            )}
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                              Correo electrónico <span className="text-red-500">*</span>
                            </label>
                            <Field
                              id="email"
                              name="email"
                              type="email"
                              className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:border-primary bg-white text-gray-900"
                            />
                            {errors.email && touched.email && (
                              <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                            )}
                          </div>

                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                              Número de teléfono <span className="text-red-500">*</span>
                            </label>
                            <Field
                              id="phone"
                              name="phone"
                              type="tel"
                              className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:border-primary bg-white text-gray-900"
                            />
                            {errors.phone && touched.phone && (
                              <div className="text-red-500 text-sm mt-1">{errors.phone}</div>
                            )}
                          </div>

                          <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                              Empresa / Proyecto (opcional)
                            </label>
                            <Field
                              id="company"
                              name="company"
                              type="text"
                              className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:border-primary bg-white text-gray-900"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="projectDescription"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Descripción del proyecto <span className="text-red-500">*</span>
                            </label>
                            <Field
                              id="projectDescription"
                              name="projectDescription"
                              as="textarea"
                              rows={4}
                              className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:border-primary bg-white text-gray-900 resize-none"
                              placeholder="Describa brevemente su proyecto y necesidades específicas..."
                            />
                            {errors.projectDescription && touched.projectDescription && (
                              <div className="text-red-500 text-sm mt-1">{errors.projectDescription}</div>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmitting || submitStatus === "loading"}
                            className={`w-full bg-primary text-white font-medium py-4 px-4 hover:bg-primary/90 transition duration-200 text-lg ${
                              (isSubmitting || submitStatus === "loading") && "opacity-70 cursor-not-allowed"
                            }`}
                          >
                            {isSubmitting || submitStatus === "loading" ? "Enviando..." : "Solicitar Cotización Ahora"}
                          </button>

                          <p className="text-xs text-center text-gray-500 mt-2">
                            Al enviar este formulario, acepta nuestra política de privacidad y términos de servicio.
                          </p>
                        </Form>
                      )}
                    </Formik>

                    {submitStatus === "success" && (
                      <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-green-800 font-medium">Solicitud enviada exitosamente</h3>
                          <p className="text-green-700 text-sm mt-1">
                            Gracias por su interés. Nos pondremos en contacto con usted a la brevedad para discutir los
                            detalles de su proyecto.
                          </p>
                        </div>
                      </div>
                    )}

                    {submitStatus === "error" && (
                      <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-red-800 font-medium">Error al enviar la solicitud</h3>
                          <p className="text-red-700 text-sm mt-1">
                            {errorMessage ||
                              "Ocurrió un error al enviar la solicitud. Por favor, intenta de nuevo más tarde."}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Trust Indicators */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        ¿Por qué solicitar una cotización con nosotros?
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Respuesta rápida garantizada</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Presupuestos personalizados a su medida</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Profesionales con amplia experiencia</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

export async function getServerSideProps(context: any) {
  const { slug } = context.params
  const service = await getServiceBySlug(slug)

  if (!service) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      service,
    },
  }
}

