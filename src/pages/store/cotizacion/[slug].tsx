import { useState } from "react"
import type { GetServerSideProps } from "next"
import { Open_Sans } from "next/font/google"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getServiceBySlug } from "../../../../sanity/sanityQueries"

const openSans = Open_Sans({ subsets: ["latin"] })

interface ServicePageProps {
  service: {
    name: string
    imageUrl: string
    slug: string
    gallery: string[]
    price: number
    categoryName: string
    description: string
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

  if (!service) {
    return <div>Servicio no encontrado</div>
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
    <main className={`${openSans.className} bg-white`}>
      <Header />
      <div className="px-4 py-12 sm:px-6 lg:px-8 mt-24">
        <div className="container mx-auto lg:px-4">
          <div className="lg:flex lg:space-x-8">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <h1 className="text-3xl font-semibold mb-4 text-gray-800">{service.name}</h1>
              <div className="mb-6 overflow-hidden">
                <img
                  src={service.imageUrl || "/placeholder.svg"}
                  alt={service.name}
                  className="w-full h-64 object-cover"
                />
              </div>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Categoría:</p>
                  <p className="text-gray-600">{service.categoryName}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Precio:</p>
                  <p className="text-gray-600">${service.price}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Disponibilidad:</p>
                  <p className="text-gray-600">{service.availability}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Duración:</p>
                  <p className="text-gray-600">{service.duration}</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-gray-50 p-6">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Solicitar Cotización</h2>
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
                    <Form className="space-y-4">
                      <div>
                        <Field
                          name="fullName"
                          type="text"
                          placeholder="Nombre completo"
                          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-primary"
                        />
                        {errors.fullName && touched.fullName && (
                          <div className="text-red-500 text-sm mt-1">{errors.fullName}</div>
                        )}
                      </div>
                      <div>
                        <Field
                          name="email"
                          type="email"
                          placeholder="Correo electrónico"
                          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-primary"
                        />
                        {errors.email && touched.email && (
                          <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                        )}
                      </div>
                      <div>
                        <Field
                          name="phone"
                          type="tel"
                          placeholder="Número de teléfono"
                          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-primary"
                        />
                        {errors.phone && touched.phone && (
                          <div className="text-red-500 text-sm mt-1">{errors.phone}</div>
                        )}
                      </div>
                      <div>
                        <Field
                          name="company"
                          type="text"
                          placeholder="Empresa / Proyecto (opcional)"
                          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <Field
                          name="projectDescription"
                          as="textarea"
                          placeholder="Descripción del proyecto"
                          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-primary h-32 resize-none"
                        />
                        {errors.projectDescription && touched.projectDescription && (
                          <div className="text-red-500 text-sm mt-1">{errors.projectDescription}</div>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting || submitStatus === "loading"}
                        className={`w-full bg-primary text-white font-semibold py-2 px-4 hover:bg-primary-dark transition duration-300 ${
                          (isSubmitting || submitStatus === "loading") && "opacity-50 cursor-not-allowed"
                        }`}
                      >
                        {isSubmitting || submitStatus === "loading" ? "Enviando..." : "Solicitar Cotización"}
                      </button>
                    </Form>
                  )}
                </Formik>
                {submitStatus === "success" && (
                  <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700">
                    Solicitud enviada exitosamente. Nos pondremos en contacto contigo pronto.
                  </div>
                )}
                {submitStatus === "error" && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700">
                    {errorMessage || "Ocurrió un error al enviar la solicitud. Por favor, intenta de nuevo más tarde."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string }
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

