"use client";
import Head from "next/head";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Open_Sans } from "next/font/google";
import { useCart } from "@/hook/useCart";
import { useState } from "react";

const openSans = Open_Sans({ subsets: ["latin"] });

export default function CheckoutPage() {
  const { items, subtotal, count } = useCart();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const isValid =
    form.firstName && form.lastName && form.email && form.phone && form.address && form.city && form.province;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || count === 0) return;
    setSubmitting(true);
    try {
      // For now, just simulate step completion; payment step will follow later
      // This is where we'd POST order draft to API
      alert("Datos guardados. El paso de pago vendrá a continuación.");
    } catch (e) {
      console.error(e);
      alert("No se pudo procesar el checkout. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={openSans.className}>
      <Head>
        <title>Checkout | Romana Ebanistería</title>
      </Head>
      <Header />
      <div className="container mx-auto mt-24 px-6 pb-32 pt-10">
        <nav className="mb-10 text-sm text-slate-500 flex items-center gap-2">
          <Link href="/store" className="hover:text-slate-700 transition-colors">
            Tienda
          </Link>
          <span className="text-slate-400">•</span>
          <Link href="/store/cart" className="hover:text-slate-700 transition-colors">
            Carrito
          </Link>
          <span className="text-slate-400">•</span>
          <span className="text-slate-700 font-medium">Checkout</span>
        </nav>

        {count === 0 ? (
          <div className="text-center py-24">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Tu carrito está vacío</h1>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Agrega productos para continuar con tu compra.
            </p>
            <Link
              href="/store"
              className="inline-block px-8 py-4 bg-primary text-white font-semibold tracking-tight hover:bg-accent transition-colors"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">
              <header className="pb-2 border-b border-slate-200">
                <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
                <p className="text-slate-600 text-sm mt-1">
                  Completa tus datos para coordinar envío y pago. No te cobraremos todavía.
                </p>
              </header>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight">Datos personales</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="text-slate-700">Nombre</span>
                    <input
                      className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                    />
                  </label>
                  <label className="text-sm">
                    <span className="text-slate-700">Apellido</span>
                    <input
                      className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                    />
                  </label>
                  <label className="text-sm">
                    <span className="text-slate-700">Correo</span>
                    <input
                      type="email"
                      className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </label>
                  <label className="text-sm">
                    <span className="text-slate-700">Teléfono</span>
                    <input
                      className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </label>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight">Dirección de envío</h2>
                <div className="grid gap-4">
                  <label className="text-sm">
                    <span className="text-slate-700">Dirección</span>
                    <input
                      className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      required
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="text-sm">
                      <span className="text-slate-700">Ciudad</span>
                      <input
                        className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        required
                      />
                    </label>
                    <label className="text-sm">
                      <span className="text-slate-700">Provincia</span>
                      <input
                        className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        value={form.province}
                        onChange={(e) => setForm({ ...form, province: e.target.value })}
                        required
                      />
                    </label>
                    <label className="text-sm">
                      <span className="text-slate-700">Código postal (opcional)</span>
                      <input
                        className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        value={form.postalCode}
                        onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      />
                    </label>
                  </div>
                  <label className="text-sm">
                    <span className="text-slate-700">Notas (opcional)</span>
                    <textarea
                      className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      rows={4}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </label>
                </div>
              </section>

              <div className="pt-2 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className="px-8 py-3 bg-primary text-white font-semibold tracking-tight disabled:opacity-50 hover:bg-accent transition-colors"
                >
                  {submitting ? "Guardando..." : "Continuar al pago"}
                </button>
              </div>
            </form>

            {/* Summary */}
            <aside className="lg:col-span-5 lg:sticky lg:top-10 h-fit space-y-6">
              <div className="border border-slate-300 p-6 space-y-5">
                <h2 className="text-lg font-semibold tracking-tight">Resumen</h2>
                <ul className="divide-y divide-slate-200 border-y border-slate-200 text-sm">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3 py-3">
                      <div className="w-14 h-14 bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                        {it.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.image} alt={it.name} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-[10px] text-slate-400">Sin imagen</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-2 font-medium text-slate-900">{it.name}</p>
                        <p className="text-xs text-slate-500">x{it.quantity}</p>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {(it.price * it.quantity).toLocaleString("es-DO", { style: "currency", currency: "DOP" })}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium">{subtotal.toLocaleString('es-DO',{style:'currency',currency:'DOP'})}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Envío</span><span className="font-medium">Gratis</span></div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{subtotal.toLocaleString('es-DO',{style:'currency',currency:'DOP'})}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500 leading-relaxed">
                <p>
                  <strong className="font-semibold text-slate-700">Seguridad:</strong> En el siguiente paso podrás elegir el método de pago. Aún no realizamos ningún cargo.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}


