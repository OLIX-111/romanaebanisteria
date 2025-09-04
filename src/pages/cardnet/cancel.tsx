export default function CardnetCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg w-full bg-white border border-gray-200 p-8 shadow-sm text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Pago cancelado o no aprobado</h1>
        <p className="text-gray-700 text-sm leading-relaxed">La transacción fue cancelada o rechazada. Si crees que es un error, intenta nuevamente o contáctanos.</p>
        <a href="/store/cart" className="inline-block px-6 py-3 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800">Volver al carrito</a>
      </div>
    </div>
  )
}
