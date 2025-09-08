"use client"

import Image from "next/image"
import { Download, Mail, Loader2 } from "lucide-react"
import { useState } from "react"
import { formatCurrency } from "./usePresupuesto"

interface Item {
  id: number
  name: string
  image: string
  price: number
  description: string
  type: string
  vendor: string
  qty: number
}

interface RightColumnProps {
  items: Item[]
  subtotal: number
  tax: number
  total: number
  onQtyChange: (id: number, qty: number) => void
  onRemove: (id: number) => void
  onClear: () => void
  onDownload: (options: { download: boolean; email: boolean }) => Promise<void>
}

export default function RightColumn({ items, subtotal, tax, total, onQtyChange, onRemove, onClear, onDownload }: RightColumnProps) {
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [downloadOptions, setDownloadOptions] = useState({ download: true, email: false })
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDownloadOptions = async () => {
    setIsProcessing(true)
    try {
      await onDownload(downloadOptions)
      setShowDownloadModal(false)
      setDownloadOptions({ download: true, email: false }) // Reset para próxima vez
    } catch (error) {
      console.error('Error al procesar la descarga:', error)
      alert('Hubo un error al procesar tu solicitud. Inténtalo de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <section className="lg:col-span-2 lg:sticky lg:top-24 self-start">
      <div className="border border-gray-200 bg-white">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Seleccionados</h2>
          {items.length > 0 && (
            <button onClick={onClear} className="text-xs text-gray-600 hover:text-gray-900">Vaciar</button>
          )}
        </div>
        {items.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">Aún no has seleccionado productos.</div>
        ) : (
          <ul className="divide-y divide-gray-200 bg-white">
            {items.map(it => (
              <li key={it.id} className="p-4 flex items-center gap-4">
                <div className="w-20 h-20 flex-shrink-0 border border-gray-200 bg-gray-50">
                  <Image src={it.image || "/placeholder.svg"} alt={it.name} width={80} height={80} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 line-clamp-1" title={it.name}>{it.name}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{it.type} • {it.vendor}</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(it.price * it.qty)}</div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-xs text-gray-600">Cant.</label>
                    <input
                      type="number"
                      min={1}
                      value={it.qty}
                      onChange={e => onQtyChange(it.id, parseInt(e.target.value || "1", 10))}
                      className="w-20 rounded border border-gray-300 py-1 px-2 text-sm"
                    />
                    <button onClick={() => onRemove(it.id)} className="ml-auto text-xs text-gray-600 hover:text-gray-900">Quitar</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

  <div className="mt-6 border border-gray-200 p-4 bg-white">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Impuesto (18%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-3 font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

  <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={() => setShowDownloadModal(true)}
          disabled={items.length === 0}
          className={`inline-flex items-center justify-center gap-2 border border-gray-200 px-5 py-3 text-sm bg-white text-gray-800 ${items.length ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"}`}
        >
          <Download size={16} /> Descargar cotización (PDF)
        </button>
      </div>

      {/* Modal de opciones de descarga */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowDownloadModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Cómo quieres obtener tu cotización?</h3>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={downloadOptions.download}
                  onChange={(e) => setDownloadOptions(prev => ({ ...prev, download: e.target.checked }))}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <div className="flex items-center gap-2">
                  <Download size={16} className="text-gray-600" />
                  <span className="text-sm font-medium">Descargar PDF directamente</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={downloadOptions.email}
                  onChange={(e) => setDownloadOptions(prev => ({ ...prev, email: e.target.checked }))}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-600" />
                  <span className="text-sm font-medium">Enviar por correo electrónico</span>
                </div>
              </label>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDownloadModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDownloadOptions}
                disabled={(!downloadOptions.download && !downloadOptions.email) || isProcessing}
                className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Continuar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
