"use client"
import Head from "next/head"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { useCart } from "@/hook/useCart"
import { Open_Sans } from "next/font/google"
import { X, Plus, Minus } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from '@/context/AuthContext'

const openSans = Open_Sans({ subsets: ["latin"] })

export default function CartPage() {
  const { items, subtotal, compareTotal, savings, updateQty, removeItem, clear, count } = useCart()
  const { user } = useAuth()
  const isLoggedIn = !!user

  return (
    <main className={openSans.className}>
      <Head>
        <title>Carrito | Romana Ebanistería</title>
      </Head>
      <Header />
      <div className="container mx-auto mt-24 px-6 pb-32 pt-10">
        <nav className="mb-10 text-sm text-slate-500 flex items-center gap-2">
          <Link href="/store" className="hover:text-slate-700 transition-colors">
            Tienda
          </Link>
          <span className="text-slate-400">•</span>
          <span className="text-slate-700 font-medium">Carrito</span>
        </nav>

        {count === 0 && (
          <div className="text-center py-24">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Tu carrito está vacío</h1>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Explora nuestros productos y agrega tus piezas favoritas para continuar.
            </p>

            {!isLoggedIn && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 max-w-lg mx-auto mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">¿Ya tienes cuenta?</h2>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  Inicia sesión para dar seguimiento a tus pedidos, acceder a descuentos exclusivos, guardar tus productos
                  favoritos y disfrutar de una experiencia personalizada.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/login"
                    className="inline-block px-6 py-3 bg-primary text-white font-semibold tracking-tight hover:bg-accent transition-colors text-sm"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    className="inline-block px-6 py-3 border border-slate-300 text-slate-700 font-semibold tracking-tight hover:bg-slate-50 transition-colors text-sm"
                  >
                    Crear cuenta
                  </Link>
                </div>
              </div>
            )}

            <Link
              href="/store"
              className="inline-block px-8 py-4 bg-slate-100 text-slate-700 font-semibold tracking-tight hover:bg-slate-200 transition-colors"
            >
              Ver productos
            </Link>
          </div>
        )}

        {count > 0 && (
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-6">
              <header className="flex items-end justify-between pb-2 border-b border-slate-200">
                <h1 className="text-3xl font-bold tracking-tight">Carrito</h1>
                <button
                  onClick={clear}
                  className="text-sm text-slate-500 hover:text-slate-800 underline underline-offset-4"
                >
                  Vaciar
                </button>
              </header>

              {!isLoggedIn && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">¿Ya tienes cuenta?</h2>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Inicia sesión para dar seguimiento a tus pedidos, acceder a descuentos exclusivos y disfrutar de una
                    experiencia personalizada.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/login"
                      className="inline-block px-6 py-3 bg-primary text-white font-semibold tracking-tight hover:bg-accent transition-colors text-sm"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/register"
                      className="inline-block px-6 py-3 border border-slate-300 text-slate-700 font-semibold tracking-tight hover:bg-slate-50 transition-colors text-sm"
                    >
                      Crear cuenta
                    </Link>
                  </div>
                </div>
              )}

              <ul className="divide-y divide-slate-200 border-y border-slate-200">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-5 py-6">
                    <div className="w-24 h-24 bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">Sin imagen</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 leading-tight line-clamp-2 mb-1">{item.name}</p>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                        <span className="font-semibold text-slate-900">
                          {item.price.toLocaleString("es-DO", { style: "currency", currency: "DOP" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-slate-300 divide-x divide-slate-300">
                          <button
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                            disabled={item.quantity <= 1}
                            aria-label="Disminuir"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-medium select-none">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                            aria-label="Incrementar"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-slate-500 hover:text-red-600 font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-red-600 self-start"
                      aria-label="Eliminar línea"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <aside className="lg:col-span-5 lg:sticky lg:top-10 h-fit space-y-6">
              <div className="border border-slate-300 p-6 space-y-5">
                <h2 className="text-lg font-semibold tracking-tight">Resumen</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">
                      {subtotal.toLocaleString("es-DO", { style: "currency", currency: "DOP" })}
                    </span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-emerald-600 text-xs">
                      <span>Ahorro</span>
                      <span>-{savings.toLocaleString("es-DO", { style: "currency", currency: "DOP" })}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Envío</span>
                    <span className="font-medium">Gratis</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{subtotal.toLocaleString("es-DO", { style: "currency", currency: "DOP" })}</span>
                  </div>
                </div>
                <Link
                  href="/store/checkout"
                  className="block w-full mt-4 px-6 py-4 text-center bg-primary text-white font-semibold tracking-tight hover:bg-accent transition-colors"
                >
                  Proceder a checkout
                </Link>
                <Link
                  href="/financing/cart"
                  className="block w-full mt-3 px-6 py-4 text-center border border-slate-300 text-slate-800 font-semibold tracking-tight hover:bg-slate-50 transition-colors"
                >
                  Financiar carrito
                </Link>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Al continuar aceptas nuestros términos y políticas. El cálculo de impuestos o financiamiento se
                  definirá en el checkout.
                </p>
              </div>
              <div className="text-xs text-slate-500 leading-relaxed">
                <p>
                  <strong className="font-semibold text-slate-700">Financiamiento:</strong> Si un producto es
                  financiable podrás simular cuotas en su página de detalle antes de llegar aquí.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
