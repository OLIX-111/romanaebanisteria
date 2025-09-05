import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Open_Sans } from "next/font/google"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"

const openSans = Open_Sans({ subsets: ["latin"] })

const banks = [
  "Banco Popular Dominicano",
  "Banco BHD",
  "Banreservas",
  "Scotiabank",
  "Banco Santa Cruz",
  "Banco Caribe",
]

const currencies = ["DOP", "USD", "EUR"]
const idTypes = ["Cédula", "Pasaporte"]
const countries = ["República Dominicana", "Estados Unidos"]

export default function FinancingApplyPage() {
  const router = useRouter()
  const { productId, variantId, productName, price, currency, productImage } = router.query as Record<string, string>

  const initialSaleAmount = useMemo(() => Number(price || 0) || 0, [price])
  const initialCurrency = useMemo(() => (currency && currencies.includes(currency) ? currency : "DOP"), [currency])

  const [saleAmount, setSaleAmount] = useState<number>(initialSaleAmount)
  const [saleCurrency, setSaleCurrency] = useState<string>(initialCurrency)
  const [downPayment, setDownPayment] = useState<number>(Math.round(initialSaleAmount * 0.2))

  const [idType, setIdType] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [fullName, setFullName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0)
  const [incomeCurrency, setIncomeCurrency] = useState<string>(initialCurrency)
  const [country, setCountry] = useState("")
  const [bank1, setBank1] = useState("")
  const [bank2, setBank2] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [certifyInfo, setCertifyInfo] = useState(false)

  const financedAmount = Math.max((saleAmount || 0) - (downPayment || 0), 0)

  useEffect(() => {
    setSaleAmount(initialSaleAmount)
    setDownPayment(Math.round(initialSaleAmount * 0.2))
    setSaleCurrency(initialCurrency)
    setIncomeCurrency(initialCurrency)
  }, [initialSaleAmount, initialCurrency])

  const formatCurrency = (n: number) => new Intl.NumberFormat("es-DO", { style: "currency", currency: saleCurrency || "DOP" }).format(n || 0)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  function formatDateInput(d: Date): string {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }
  const maxBirthDate = useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 18)
    return formatDateInput(d)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      // Age validation 18+
      const b = birthDate ? new Date(birthDate) : null
      const now = new Date()
      const minBirth = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate())
      if (!b || isNaN(b.getTime()) || b > minBirth) {
        throw new Error("Debes ser mayor de 18 años.")
      }
      if (bank1 && bank2 && bank1 === bank2) {
        throw new Error("Las dos opciones de banco deben ser distintas.")
      }
      const payload = {
        saleAmount,
        downPayment,
        financedAmount,
        saleCurrency,
        idType,
        idNumber,
        fullName,
        birthDate,
        email,
        phone,
        monthlyIncome,
        incomeCurrency,
        country,
        bankOption1: bank1,
        bankOption2: bank2,
        acceptTerms,
        certifyInfo,
        cartItems: [
          {
            name: productName || `Producto ${productId}`,
            qty: 1,
            price: Number(price || saleAmount || 0),
            subtotal: Number(price || saleAmount || 0),
            currency: saleCurrency,
            productId: Number(productId) || undefined,
          },
        ],
      }
      const res = await fetch("/api/financing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.message || "Error al enviar la solicitud")
      }
      setSuccess(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      setError(err.message || "Error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={openSans.className}>
      <Header />
      <div className="container mx-auto mt-24 px-4 py-12 max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Solicitud de financiamiento</h1>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 bg-white p-6">
          <div className="md:col-span-1">
            <div className="relative w-full aspect-square border border-gray-200 bg-gray-50">
              <Image src={(productImage as string) || "/placeholder.svg"} alt={productName || `Producto ${productId}`} fill className="object-cover" />
            </div>
          </div>
          <div className="md:col-span-2 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-wide text-gray-500">Financiar producto</p>
            <h2 className="text-xl font-semibold text-gray-900 mt-1">{productName || `#${productId}`}</h2>
            <p className="text-sm text-gray-600 mt-1">Precio base: <span className="font-medium">{new Intl.NumberFormat("es-DO", { style: "currency", currency: initialCurrency }).format(initialSaleAmount)}</span></p>
          </div>
        </div>

        {success ? (
          <div className="mt-6 p-4 border border-green-300 bg-green-50 text-sm text-green-800">
            Hemos recibido tu solicitud. Te contactaremos en las próximas 72 horas.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            {error && <div className="p-3 border border-amber-300 bg-amber-50 text-sm text-amber-800">{error}</div>}

            <section className="border border-gray-200 p-6 bg-white">
              <h2 className="text-base font-semibold text-gray-800">Datos del producto</h2>
              <div className="mt-5 grid sm:grid-cols-2 gap-5 text-sm">
                <div>
                  <label className="block text-gray-700 mb-1">Monto solicitado o Precio de venta *</label>
                  <input type="number" min={0} value={saleAmount} readOnly className="w-full border border-gray-300 px-3 py-2 bg-gray-50" />
                  <p className="text-[11px] text-gray-500 mt-1">Ej: 250,000</p>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Pago inicial (recomendado: 20%) *</label>
                  <input type="number" min={0} value={downPayment} readOnly className="w-full border border-gray-300 px-3 py-2 bg-gray-50" />
                  <p className="text-[11px] text-gray-500 mt-1">Ej: 50,000</p>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Monto a financiar</label>
                  <input type="text" value={formatCurrency(financedAmount)} readOnly className="w-full border border-gray-300 px-3 py-2 bg-gray-50" />
                </div>
              </div>
            </section>

            <section className="border border-gray-200 p-6 bg-white">
              <h2 className="text-base font-semibold text-gray-800">Datos personales</h2>
              <div className="mt-5 grid sm:grid-cols-2 gap-5 text-sm">
                <div>
                  <label className="block text-gray-700 mb-1">Tipo de identificación *</label>
                  <select value={idType} onChange={(e)=>setIdType(e.target.value)} className="w-full border border-gray-300 px-3 py-2 bg-white">
                    <option value="" disabled>Seleccionar tipo</option>
                    {idTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Número de identificación *</label>
                  <input type="text" value={idNumber} onChange={(e)=>setIdNumber(e.target.value)} className="w-full border border-gray-300 px-3 py-2" placeholder="Número de identificación" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 mb-1">Nombre completo *</label>
                  <input type="text" value={fullName} onChange={(e)=>setFullName(e.target.value)} className="w-full border border-gray-300 px-3 py-2" placeholder="Ej: Juan Pérez" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Fecha de nacimiento *</label>
                  <input type="date" value={birthDate} max={maxBirthDate} onChange={(e)=>setBirthDate(e.target.value)} className="w-full border border-gray-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Correo electrónico *</label>
                  <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border border-gray-300 px-3 py-2" placeholder="nombre@correo.com" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Número de contacto *</label>
                  <input type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full border border-gray-300 px-3 py-2" placeholder="+1 809-555-5555" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Ingreso mensual *</label>
                  <input type="number" min={0} value={monthlyIncome} onChange={(e)=>setMonthlyIncome(+e.target.value||0)} className="w-full border border-gray-300 px-3 py-2" placeholder="50,000" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Moneda de ingreso *</label>
                  <select value={incomeCurrency} onChange={(e)=>setIncomeCurrency(e.target.value)} className="w-full border border-gray-300 px-3 py-2 bg-white">
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 mb-1">País de residencia *</label>
                  <select value={country} onChange={(e)=>setCountry(e.target.value)} className="w-full border border-gray-300 px-3 py-2 bg-white">
                    <option value="" disabled>Seleccionar país</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </section>

            <section className="border border-gray-200 p-6 bg-white">
              <h2 className="text-base font-semibold text-gray-800">Opciones de banco</h2>
              <div className="mt-5 grid sm:grid-cols-2 gap-5 text-sm">
                <div>
                  <label className="block text-gray-700 mb-1">Opción de banco 1 *</label>
                  <select
                    value={bank1}
                    onChange={(e)=>{
                      const v = e.target.value
                      setBank1(v)
                      if (v && v === bank2) setBank2("")
                    }}
                    className="w-full border border-gray-300 px-3 py-2 bg-white"
                  >
                    <option value="" disabled>Seleccionar banco</option>
                    {banks.map(b => (
                      <option key={b} value={b} disabled={bank2 === b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Opción de banco 2 *</label>
                  <select
                    value={bank2}
                    onChange={(e)=>{
                      const v = e.target.value
                      setBank2(v)
                      if (v && v === bank1) setBank1("")
                    }}
                    className="w-full border border-gray-300 px-3 py-2 bg-white"
                  >
                    <option value="" disabled>Seleccionar banco</option>
                    {banks.map(b => (
                      <option key={b} value={b} disabled={bank1 === b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 space-y-4 text-xs text-gray-600">
                <label className="flex items-start gap-2"><input type="checkbox" checked={certifyInfo} onChange={(e)=>setCertifyInfo(e.target.checked)} /> <span>Certifico que la información proporcionada anteriormente es correcta, autorizo a Mobiliapp y a las entidades de intermediación financiera a validarla y consultar mi historial crediticio en las bases de datos de los burós de información nacionales o internacionales que considere.</span></label>
                <label className="flex items-start gap-2"><input type="checkbox" checked={acceptTerms} onChange={(e)=>setAcceptTerms(e.target.checked)} /> <span>Acepto los Términos de uso y la Política de privacidad.</span></label>
              </div>
            </section>

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 text-sm">Atrás</button>
              <button type="submit" disabled={submitting} className="px-6 py-3 bg-primary text-white text-sm font-semibold hover:brightness-110 disabled:opacity-60">{submitting ? 'Enviando…' : 'Enviar solicitud'}</button>
            </div>
          </form>
        )}
      </div>
      <Footer />
    </main>
  )
}
