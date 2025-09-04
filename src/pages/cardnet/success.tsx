import { useEffect, useRef, useState } from 'react'
import { useCart } from '@/hook/useCart'

interface OrderSnapshotItem {
  id: string
  productId?: string
  variantId?: string
  name: string
  quantity: number
  price: number
  image?: string | null
}
interface OrderSnapshot {
  orderId: string
  amount: number
  amountMinorUnits: string
  currency: string
  createdAt: number
  items: OrderSnapshotItem[]
  totals: { subtotal: number; tax: number; shipping: number; grandTotal: number }
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    province: string
    postalCode: string
    notes: string
  }
}

export default function CardnetSuccess() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [snapshot, setSnapshot] = useState<OrderSnapshot | null>(null)
  const { clear } = useCart()
  const clearedRef = useRef(false)

  useEffect(() => {
    // Load order snapshot (even if payment failed we still show resumen)
    try {
      const raw = localStorage.getItem('cardnet_order_snapshot')
      if (raw) {
        setSnapshot(JSON.parse(raw))
      }
    } catch {}

    const session = localStorage.getItem('cardnet_session')
    const sessionKey = localStorage.getItem('cardnet_sessionKey')
    if (session && sessionKey) {
      fetch(`/api/cardnet/result?session=${session}&sessionKey=${sessionKey}`)
        .then(r => r.json())
        .then(d => { setResult(d); setLoading(false) })
        .catch(() => { setError('No se pudo consultar el resultado del pago.'); setLoading(false) })
        .finally(() => {
          // Limpieza de llaves para evitar reutilización
          localStorage.removeItem('cardnet_session')
          localStorage.removeItem('cardnet_sessionKey')
        })
    } else {
      setLoading(false)
      setError(null) // no session info, maybe manual visit; still show snapshot if any
    }

    // Clear cart once when arriving
    if (!clearedRef.current) {
      try { clear(); } catch {}
      clearedRef.current = true
    }
  }, [])

  return (
  <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-white to-primary/40 p-6 overflow-hidden">
      {/* Confetti container */}
      <Confetti />
  <div className="relative max-w-3xl w-full bg-white/90 backdrop-blur-sm border border-primary p-10 shadow-xl rounded-xl">
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4 pt-2 pb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary shadow-lg flex items-center justify-center animate-pop">
                <svg className="w-12 h-12 text-white drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="absolute -bottom-1 -right-1 px-3 py-1 text-[10px] font-bold tracking-wide uppercase bg-primary text-white rounded-full shadow">OK</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-primary drop-shadow-sm animate-fade-in">
              ¡Pago exitoso!
            </h1>
            <p className="text-sm text-primary/80 font-medium tracking-wide uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Confirmación generada
            </p>
          </div>
          {loading && <p className="text-gray-700 text-center">Consultando resultado de pago...</p>}
          {error && <p className="text-amber-600 text-center text-sm">{error}</p>}

          {/* Resumen del pedido */}
          {snapshot && (
            <div className="mt-2 border border-primary/20 rounded-lg divide-y shadow-sm overflow-hidden animate-rise">
              <div className="p-5 bg-gradient-to-r from-primary/10 to-white flex items-center justify-between">
                <div className="text-sm text-gray-700 space-y-0.5">
                  <p><span className="font-medium">Pedido:</span> {snapshot.orderId}</p>
                  <p><span className="font-medium">Fecha:</span> {new Date(snapshot.createdAt).toLocaleString('es-DO')}</p>
                </div>
                <div className="text-right text-sm text-gray-700">
                  <p className="font-medium">Total</p>
                  <p className="text-lg font-bold text-gray-900">{snapshot.totals.grandTotal.toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}</p>
                </div>
              </div>
              <div className="p-5 space-y-3 bg-white">
                {snapshot.items.map(i => (
                  <div key={i.id} className="group flex items-center gap-4 text-sm px-3 py-2 rounded-md hover:bg-primary/10 transition-colors">
                    <div className="w-14 h-14 bg-white border border-primary/20 rounded-md flex items-center justify-center overflow-hidden ring-1 ring-white/50 shadow-sm group-hover:scale-105 transition-transform">
                      {i.image ? <img src={i.image} alt={i.name} className="w-full h-full object-cover" /> : (
                        <svg className="w-5 h-5 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2 1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 leading-tight group-hover:text-primary transition-colors">{i.name}</p>
                      <p className="text-xs text-gray-500">Cantidad: {i.quantity}</p>
                    </div>
                    <div className="font-semibold text-gray-900 tabular-nums">
                      {(i.price * i.quantity).toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 space-y-2 text-sm bg-white/70 backdrop-blur-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium tabular-nums">{snapshot.totals.subtotal.toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Envío</span><span className="font-medium text-primary">Gratis</span></div>
                <div className="flex justify-between pt-2 border-t border-gray-100"><span className="font-semibold text-gray-900">Total</span><span className="text-lg font-bold text-gray-900 tabular-nums">{snapshot.totals.grandTotal.toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}</span></div>
              </div>
              <div className="p-5 bg-gradient-to-r from-white to-primary/10 text-xs text-gray-600">
                <p className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  Datos del cliente
                </p>
                <p>{snapshot.customer.firstName} {snapshot.customer.lastName}</p>
                <p>{snapshot.customer.email} · {snapshot.customer.phone}</p>
                <p>{snapshot.customer.address}, {snapshot.customer.city}, {snapshot.customer.province}{snapshot.customer.postalCode ? ` (${snapshot.customer.postalCode})` : ''}</p>
                {snapshot.customer.notes && <p className="mt-1 italic text-gray-500">“{snapshot.customer.notes}”</p>}
              </div>
            </div>
          )}

          {/* Resultado del pago */}
          {result && !loading && (
            <div className="mt-10 border border-primary/20 rounded-lg p-6 bg-primary/10 backdrop-blur-sm shadow-inner animate-fade-in">
              <p className="text-sm font-semibold mb-4 text-primary tracking-wide flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" /></svg>
                Estado del pago confirmado
              </p>
              <div className="grid gap-4 sm:grid-cols-3 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Autorización</p>
                  <p className="font-medium text-gray-800 tabular-nums">{result.AuthorizationCode || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Tarjeta</p>
                  <p className="font-medium text-gray-800">{result.CreditCardNumber || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Referencia</p>
                  <p className="font-medium text-gray-800 tabular-nums">{result.RetrivalReferenceNumber || '-'}</p>
                </div>
              </div>
              {result.ResponseCode && result.ResponseCode !== '00' && (
                <p className="mt-4 text-[11px] text-primary/80">Código original: {result.ResponseCode}</p>
              )}
            </div>
          )}

          {!snapshot && !loading && (
            <p className="text-center text-sm text-gray-500">No se encontró el resumen del pedido.</p>
          )}

          <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/store" className="group relative inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold text-sm rounded-md shadow hover:brightness-110 transition-colors">
              <span>Volver a la tienda</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0-4 4m4-4H3" /></svg>
              <span className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-primary/0 group-hover:ring-primary/60 transition"></span>
            </a>
            <a href="/store/cart" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold text-sm rounded-md border border-primary/30 shadow-sm hover:border-primary/50 hover:bg-primary/10 transition-colors">
              Ver carrito vacío
            </a>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes pop { 0% { transform: scale(.5) rotate(-10deg); opacity:0 } 60% { transform: scale(1.05); opacity:1 } 100% { transform: scale(1) rotate(0); opacity:1 } }
        .animate-pop { animation: pop .7s cubic-bezier(.16,.8,.3,1); }
        @keyframes fade-in { from { opacity:0; transform: translateY(6px);} to { opacity:1; transform: translateY(0);} }
        .animate-fade-in { animation: fade-in .6s ease-out; }
        @keyframes rise { 0% { opacity:0; transform: translateY(14px); } 100% { opacity:1; transform: translateY(0);} }
        .animate-rise { animation: rise .55s .15s cubic-bezier(.16,.8,.3,1) both; }
        .confetti-piece { position:absolute; width:10px; height:10px; will-change: transform, opacity; }
        @keyframes confetti-fall { 0% { transform: translateY(-10vh) rotate(0deg); opacity:0; } 10% { opacity:1;} 100% { transform: translateY(110vh) rotate(720deg); opacity:0; } }
      `}</style>
    </div>
  )
}

// Lightweight confetti component without extra deps
function Confetti() {
  const [pieces, setPieces] = useState<Array<{ id: number; left: string; delay: string; duration: string; background: string; shape: string }>>([])
  useEffect(() => {
    const colors = ['#10b981','#059669','#34d399','#6ee7b7','#0d9488','#5eead4','#99f6e4']
    const shapes = ['square','circle','diamond']
    const arr = Array.from({ length: 55 }).map((_, i) => ({
      id: i,
      left: Math.random()*100 + 'vw',
      delay: (Math.random()*1.5) + 's',
      duration: (6 + Math.random()*4) + 's',
      background: colors[Math.floor(Math.random()*colors.length)],
      shape: shapes[Math.floor(Math.random()*shapes.length)]
    }))
    setPieces(arr)
  }, [])
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map(p => (
        <span key={p.id} className="confetti-piece" style={{
          left: p.left,
          top: '-10px',
          animation: `confetti-fall ${p.duration} linear ${p.delay} forwards`,
          background: p.background,
          borderRadius: p.shape === 'circle' ? '9999px' : p.shape === 'diamond' ? '2px' : '2px',
          transform: p.shape === 'diamond' ? 'rotate(45deg)' : undefined,
          opacity: 0.85
        }} />
      ))}
    </div>
  )
}
