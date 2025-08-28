"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useEffect, useState } from "react"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("last_order")
      if (raw) setOrder(JSON.parse(raw))
    } catch {}
  }, [])

  if (!order) return <div className="mt-24 text-center">No se encontró información de la orden.</div>

  const data = order?.data || {}
  return (
    <main className={openSans.className}>
      <Header />
      <div className="container mx-auto mt-24 px-4 py-12 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Gracias por tu compra</h1>
        <p className="mt-2 text-sm text-gray-600">Orden #{data.order_no}</p>
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h2 className="text-sm font-semibold tracking-wide text-gray-800">Artículos</h2>
            <div className="mt-4 divide-y divide-gray-200 border border-gray-200">
              {(data.items || []).map((it: any) => (
                <div key={it.id} className="grid grid-cols-12 items-center gap-4 p-4">
                  <div className="col-span-7">
                    <p className="text-sm text-gray-900">{it.name}</p>
                    <p className="text-xs text-gray-600">Cantidad: {it.num}</p>
                  </div>
                  <div className="col-span-5 text-right text-sm text-gray-900">{new Intl.NumberFormat("es-DO", { style: "currency", currency: data.currency || "DOP" }).format(it.subtotal)}</div>
                </div>
              ))}
            </div>
          </section>
          <aside>
            <div className="border border-gray-200 p-6">
              <h3 className="text-sm font-semibold tracking-wide text-gray-800">Resumen</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-700"><span>Subtotal</span><span>{new Intl.NumberFormat("es-DO", { style: "currency", currency: data.currency || "DOP" }).format(data.subtotal || 0)}</span></div>
                <div className="flex justify-between text-gray-700"><span>Descuentos</span><span>{new Intl.NumberFormat("es-DO", { style: "currency", currency: data.currency || "DOP" }).format(data.discount_total || 0)}</span></div>
                <div className="flex justify-between border-t border-gray-200 pt-3 font-semibold text-gray-900"><span>Total</span><span>{new Intl.NumberFormat("es-DO", { style: "currency", currency: data.currency || "DOP" }).format(data.total || data.total_price || 0)}</span></div>
              </div>
              <div className="mt-6 text-xs text-gray-600">Te enviaremos la confirmación al correo {data.contact_email}.</div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </main>
  )
}


