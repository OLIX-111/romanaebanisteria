"use client"
import Head from "next/head"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { useCart } from "@/hook/useCart"
import { Open_Sans } from "next/font/google"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from '@/context/AuthContext'

const openSans = Open_Sans({ subsets: ["latin"] })

export default function CartPage() {
  const { items, subtotal, compareTotal, savings, updateQty, removeItem, clear, count, loading, clearing } = useCart()
  const { user } = useAuth()
  const isLoggedIn = !!user
  const [showConfirm, setShowConfirm] = useState(false)
  const [clearError, setClearError] = useState<string | null>(null)

  async function handleConfirmClear() {
    setClearError(null)
    try {
      await clear()
      setShowConfirm(false)
    } catch (e:any) {
      setClearError(e?.message || 'Error al vaciar el carrito')
    }
  }

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

        {loading && (
          <div className="py-24">
            <div className="max-w-3xl mx-auto">
              <div className="animate-pulse space-y-8">
                <div className="h-8 w-40 bg-slate-200 rounded" />
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex gap-5 p-4 border border-slate-200 rounded">
                        <div className="w-24 h-24 bg-slate-200" />
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-slate-200 rounded w-3/4" />
                          <div className="h-4 bg-slate-200 rounded w-1/3" />
                          <div className="h-6 bg-slate-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="h-6 bg-slate-200 w-32 rounded" />
                    <div className="h-40 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && count === 0 && (
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

  {!loading && count > 0 && (
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-6">
              <header className="flex items-end justify-between pb-2 border-b border-slate-200">
                <h1 className="text-3xl font-bold tracking-tight">Carrito</h1>
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={clearing || count === 0}
                  className="text-sm flex items-center gap-2 text-slate-500 hover:text-slate-800 disabled:opacity-40 underline underline-offset-4"
                >
                  {clearing && (
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
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
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="inline-flex items-center px-3 py-1 border border-slate-300 text-xs font-medium tracking-wide">Cantidad: {item.quantity}</span>
                      </div>
                    </div>
                    {/* Eliminación individual deshabilitada */}
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
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !clearing && setShowConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm bg-white border border-slate-200 rounded-md shadow-lg p-6 space-y-5">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Vaciar carrito</h2>
              <p className="text-sm text-slate-600 leading-relaxed">¿Seguro que deseas eliminar todos los artículos del carrito? Esta acción no se puede deshacer.</p>
            </div>
            {clearError && <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded">{clearError}</div>}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={clearing}
                onClick={() => setShowConfirm(false)}
                className="text-sm px-4 py-2 border border-slate-300 hover:bg-slate-50 disabled:opacity-40"
              >Cancelar</button>
              <button
                onClick={handleConfirmClear}
                disabled={clearing}
                className="text-sm px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-500 disabled:opacity-50 flex items-center gap-2"
              >
                {clearing && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Vaciar ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
