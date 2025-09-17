"use client"

import { useMemo, useState } from "react"
import { Open_Sans } from "next/font/google"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { PortableText } from "@portabletext/react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getServiceBySlug } from "../../../../sanity/sanityQueries"
import { CheckCircle, AlertTriangle, Clock, Calendar, DollarSign, Tag } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/hook/UseTranslation"
import { createServiceRequest } from '@/lib/serviceRequests'
import { useAuth } from '@/context/AuthContext'

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

const QuoteSchema = (dict: any) => Yup.object().shape({
  fullName: Yup.string().required(dict.quoteRequest.form.validation.fullName),
  email: Yup.string()
    .email(dict.quoteRequest.form.validation.email)
    .required(dict.quoteRequest.form.validation.emailRequired),
  phone: Yup.string().required(dict.quoteRequest.form.validation.phone),
  company: Yup.string(),
  projectDescription: Yup.string().required(dict.quoteRequest.form.validation.projectDescription),
})

export default function ServicePage({ service }: ServicePageProps) {
  const dict = useTranslation()
  const { quoteRequest } = dict
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState<string>(service?.imageUrl || "")
  const [currentStep, setCurrentStep] = useState<number>(1)
  const { token: authToken } = useAuth()
  const [serviceRequestResult, setServiceRequestResult] = useState<any>(null)

  const todayStr = useMemo(() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }, [])

  const minServiceDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1) // no mismo día
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }, [])

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">{quoteRequest.notFound.title}</h2>
          <p className="text-gray-600 mb-4">{quoteRequest.notFound.message}</p>
          <Link href="/" className="inline-block bg-primary text-white px-4 py-2">
            {quoteRequest.notFound.backHome}
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    setSubmitStatus("loading")
    setErrorMessage(null)

    try {
      const payload = {
        desiredDate: values.desiredDate,
        address: values.address,
        suburb: values.suburb,
        state: values.state,
        postcode: values.postcode,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        company: values.company,
        projectDescription: values.projectDescription,
        serviceName: service.name
      }
      const resp = await createServiceRequest(payload, authToken)
      setServiceRequestResult(resp.data)
      setSubmitStatus("success")
      resetForm()
      setCurrentStep(4)
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
                {quoteRequest.form.subtitle}
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
                    <h2 className="text-2xl font-semibold">{quoteRequest.form.title}</h2>
                    <p className="mt-2 text-white/90">
                      {quoteRequest.form.formIntro} {service.name}
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6 text-gray-700 bg-blue-50 p-3 border-l-4 border-blue-500">
                      <AlertTriangle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <p className="text-sm">
                        {quoteRequest.form.requiredFields}
                      </p>
                    </div>

                    <Formik
                      initialValues={{
                        desiredDate: "",
                        address: "",
                        suburb: "",
                        state: "",
                        postcode: "",
                        fullName: "",
                        email: "",
                        phone: "",
                        company: "",
                        projectDescription: "",
                      }}
                      validationSchema={QuoteSchema(dict)}
                      onSubmit={handleSubmit}
                    >
                      {({ errors, touched, isSubmitting, values, setFieldTouched, validateForm, submitForm }) => {
                        const goNext = async () => {
                          // step-specific validation
                          if (currentStep === 1) {
                            const vErrors: any = {}
                            if (!values.desiredDate) vErrors.desiredDate = "Selecciona una fecha"
                            if (values.desiredDate && values.desiredDate <= todayStr) vErrors.desiredDate = "No puedes elegir el mismo día"
                            Object.keys(vErrors).forEach((k) => setFieldTouched(k as any, true, false))
                            if (Object.keys(vErrors).length) return
                          }
                          if (currentStep === 2) {
                            const req: Array<keyof typeof values> = ["address", "suburb", "state", "postcode"]
                            const vErrors: any = {}
                            req.forEach((k) => { if (!String(values[k] || "").trim()) vErrors[k] = "Requerido" })
                            Object.keys(vErrors).forEach((k) => setFieldTouched(k as any, true, false))
                            if (Object.keys(vErrors).length) return
                          }
                          if (currentStep === 3) {
                            const yErrors = await validateForm()
                            if (yErrors && Object.keys(yErrors).length) return
                          }
                          setCurrentStep((s) => Math.min(4, s + 1))
                        }

                        const goBack = () => setCurrentStep((s) => Math.max(1, s - 1))

                        return (
                          <Form className="space-y-6">
                            {/* Stepper */}
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              {[1,2,3,4].map((s) => (
                                <div key={s} className={`flex-1 flex items-center gap-2 ${s !== 1 ? 'pl-2' : ''}`}>
                                  {s !== 1 && <span className={`h-px flex-1 ${currentStep >= s ? 'bg-gray-900' : 'bg-gray-200'}`}></span>}
                                  <span className={`h-6 w-6 flex items-center justify-center rounded-full ${currentStep >= s ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}`}>{s}</span>
                                </div>
                              ))}
                            </div>

                            {currentStep === 1 && (
                              <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-800">Fecha deseada para el servicio</h3>
                                <div>
                                  <label htmlFor="desiredDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                                  <Field id="desiredDate" name="desiredDate" type="date" min={minServiceDate} className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:border-primary bg-white text-gray-900" />
                                  {touched.desiredDate && (!values.desiredDate || (values.desiredDate && values.desiredDate <= todayStr)) && (
                                    <div className="text-red-500 text-sm mt-1">No puedes elegir el mismo día</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {currentStep === 2 && (
                              <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-800">Ubicación del servicio / envío</h3>
                                <div>
                                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                                  <Field id="address" name="address" type="text" className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:border-primary bg-white text-gray-900" />
                                  {touched.address && !values.address && <div className="text-red-500 text-sm mt-1">Requerido</div>}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 mb-1">Sector / Ciudad *</label>
                                    <Field id="suburb" name="suburb" type="text" className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:border-primary bg-white text-gray-900" />
                                    {touched.suburb && !values.suburb && <div className="text-red-500 text-sm mt-1">Requerido</div>}
                                  </div>
                                  <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">Provincia/Estado *</label>
                                    <Field id="state" name="state" type="text" className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:border-primary bg-white text-gray-900" />
                                    {touched.state && !values.state && <div className="text-red-500 text-sm mt-1">Requerido</div>}
                                  </div>
                                </div>
                                <div>
                                  <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">Código Postal *</label>
                                  <Field id="postcode" name="postcode" type="text" className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:border-primary bg-white text-gray-900" />
                                  {touched.postcode && !values.postcode && <div className="text-red-500 text-sm mt-1">Requerido</div>}
                                </div>
                              </div>
                            )}

                            {currentStep === 3 && (
                              <div className="space-y-5">
                                <h3 className="text-sm font-semibold text-gray-800">Tus datos</h3>
                                <div>
                                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                    {quoteRequest.form.fields.fullName} <span className="text-red-500">*</span>
                                  </label>
                                  <Field id="fullName" name="fullName" type="text" className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:border-primary bg-white text-gray-900" />
                                  {errors.fullName && touched.fullName && (<div className="text-red-500 text-sm mt-1">{errors.fullName}</div>)}
                                </div>
                                <div>
                                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    {quoteRequest.form.fields.email} <span className="text-red-500">*</span>
                                  </label>
                                  <Field id="email" name="email" type="email" className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:border-primary bg-white text-gray-900" />
                                  {errors.email && touched.email && (<div className="text-red-500 text-sm mt-1">{errors.email}</div>)}
                                </div>
                                <div>
                                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    {quoteRequest.form.fields.phone} <span className="text-red-500">*</span>
                                  </label>
                                  <Field id="phone" name="phone" type="tel" className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:border-primary bg-white text-gray-900" />
                                  {errors.phone && touched.phone && (<div className="text-red-500 text-sm mt-1">{errors.phone}</div>)}
                                </div>
                                <div>
                                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                                    {quoteRequest.form.fields.company}
                                  </label>
                                  <Field id="company" name="company" type="text" className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:border-primary bg-white text-gray-900" />
                                </div>
                                <div>
                                  <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                    {quoteRequest.form.fields.projectDescription} <span className="text-red-500">*</span>
                                  </label>
                                  <Field id="projectDescription" name="projectDescription" as="textarea" rows={4} className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:border-primary bg-white text-gray-900 resize-none" placeholder={quoteRequest.form.fields.projectDescriptionPlaceholder} />
                                  {errors.projectDescription && touched.projectDescription && (<div className="text-red-500 text-sm mt-1">{errors.projectDescription}</div>)}
                                </div>
                              </div>
                            )}

                            {currentStep === 4 && (
                              <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-800">Resumen</h3>
                                <div className="border border-gray-200 p-4 text-sm text-gray-700 space-y-2">
                                  <div className="flex justify-between"><span>Servicio</span><span className="font-medium">{service.name}</span></div>
                                  <div className="flex justify-between"><span>Fecha</span><span className="font-medium">{values.desiredDate || '-'}</span></div>
                                  <div className="flex justify-between"><span>Dirección</span><span className="font-medium">{values.address}, {values.suburb}, {values.state}, {values.postcode}</span></div>
                                  <div className="flex justify-between"><span>Nombre</span><span className="font-medium">{values.fullName}</span></div>
                                  <div className="flex justify-between"><span>Correo</span><span className="font-medium">{values.email}</span></div>
                                  <div className="flex justify-between"><span>Teléfono</span><span className="font-medium">{values.phone}</span></div>
                                  {values.company && <div className="flex justify-between"><span>Empresa/Proyecto</span><span className="font-medium">{values.company}</span></div>}
                                  <div>
                                    <span className="block text-gray-600 mb-1">Descripción</span>
                                    <p className="font-medium whitespace-pre-wrap">{values.projectDescription}</p>
                                  </div>
                                </div>
                                {submitStatus === "success" && (
                                  <div className="p-4 bg-green-50 border-l-4 border-green-500 flex flex-col gap-3">
                                    <div className="flex items-start">
                                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <h3 className="text-green-800 font-medium">{quoteRequest.form.success.title}</h3>
                                        <p className="text-green-700 text-sm mt-1">{quoteRequest.form.success.message}</p>
                                      </div>
                                    </div>
                                    {serviceRequestResult && (
                                      <div className="text-xs text-green-800 bg-green-100/60 border border-green-200 rounded p-3 space-y-1">
                                        <p><span className="font-semibold">ID:</span> {serviceRequestResult.id}</p>
                                        <p><span className="font-semibold">Estado:</span> {serviceRequestResult.estado}</p>
                                        <p><span className="font-semibold">Servicio:</span> {serviceRequestResult.nombre_servicio}</p>
                                        <p><span className="font-semibold">Fecha deseada:</span> {serviceRequestResult.fecha_deseada}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {submitStatus === "error" && (
                                  <div className="p-4 bg-red-50 border-l-4 border-red-500 flex items-start">
                                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <h3 className="text-red-800 font-medium">{quoteRequest.form.error.title}</h3>
                                      <p className="text-red-700 text-sm mt-1">{errorMessage || quoteRequest.form.error.message}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Footer buttons */}
                            <div className="flex items-center justify-between pt-2">
                              <button type="button" onClick={goBack} disabled={currentStep === 1} className={`px-4 py-2 border text-sm ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} border-gray-300 text-gray-700`}>
                                Atrás
                              </button>
                              {currentStep < 4 ? (
                                <button type="button" onClick={goNext} className="px-5 py-2 bg-gray-900 text-white text-sm hover:bg-black">
                                  Siguiente
                                </button>
                              ) : (
                                <button type="button" onClick={() => submitForm()} disabled={isSubmitting || submitStatus === 'loading'} className={`px-5 py-2 bg-primary text-white text-sm ${ (isSubmitting || submitStatus === 'loading') ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90' }`}>
                                  {isSubmitting || submitStatus === 'loading' ? quoteRequest.form.sending : quoteRequest.form.submit}
                                </button>
                              )}
                            </div>

                            <p className="text-xs text-center text-gray-500">{quoteRequest.form.privacyPolicy}</p>
                          </Form>
                        )
                      }}
                    </Formik>

                    {/* Trust Indicators */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        {quoteRequest.form.trust.title}
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>{quoteRequest.form.trust.fastResponse}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>{quoteRequest.form.trust.customQuotes}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>{quoteRequest.form.trust.experiencedProfessionals}</span>
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

