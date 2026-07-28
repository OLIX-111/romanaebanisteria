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

  const parseName = (name: string) => {
    const parts = (name || '').split(' - ')
    const base = (parts[0] || '').replace(/\s*['\"].*?['\"]/g, '').trim()
    const cfg = parts.length > 1 ? parts.slice(1).join(' - ').trim() : ''
    return { base, cfg: cfg ? `- ${cfg}` : 'Configuración: (según selección)' }
  }

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
        {/* Encabezado estilo PDF con logo (debajo del título) */}
        <div className="bg-[#434343] px-4 py-3">
          <Image
            src="/romanaEbanistería_alt.png"
            alt="La Fabbrica"
            width={140}
            height={40}
            className="h-8 w-auto"
          />
        </div>
        <div className="h-[3px] bg-[#9d5421]" />
        {items.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">Aún no has seleccionado productos.</div>
        ) : (
          <div className="p-4 space-y-3">
            {items.map(it => {
              const { base, cfg } = parseName(it.name)
              const total = it.price * it.qty
              return (
                <div key={it.id} className="border border-black">
                  {/* Controles rápidos */}
                  <div className="flex items-center gap-2 justify-end px-2 py-1 border-b border-black bg-white">
                    <label className="text-[11px] text-gray-700">Cant.</label>
                    <input
                      type="number"
                      min={1}
                      value={it.qty}
                      onChange={e => onQtyChange(it.id, parseInt(e.target.value || '1', 10))}
                      className="w-16 rounded border border-gray-300 py-0.5 px-2 text-xs"
                    />
                    <button onClick={() => onRemove(it.id)} className="text+[11px] text-gray-700 hover:text-gray-900">Quitar</button>
                  </div>
                  {/* Fila 1: título */}
                  <div className="bg-[#a5a5a5] text-black font-bold text-xs px-2 py-1 border-b border-black">{base}</div>
                  {/* Fila 2: configuración */}
                  <div className="text-xs text-black px-2 py-2 border-b border-black whitespace-pre-wrap">{cfg}</div>
                  {/* Fila 3: encabezados */}
                  <div className="grid border-b border-black" style={{ gridTemplateColumns: '8% 12% 12% 40% 14% 14%' }}>
                    {['CANT', 'ANCH', 'ALTO', 'DESCRIPCION', 'PRECIO UND', 'TOTAL'].map((h, i) => (
                      <div key={i} className="bg-[#a5a5a5] text-black font-bold text-[11px] px-2 py-1 border-r last:border-r-0 border-black">{h}</div>
                    ))}
                  </div>
                  {/* Fila 4: valores */}
                  <div className="grid" style={{ gridTemplateColumns: '8% 12% 12% 40% 14% 14%' }}>
                    <div className="bg-[#efefef] text-[11px] px-2 py-2 border-r border-black">{it.qty}</div>
                    <div className="bg-[#efefef] text-[11px] px-2 py-2 border-r border-black">—</div>
                    <div className="bg-[#efefef] text-[11px] px-2 py-2 border-r border-black">—</div>
                    <div className="bg-[#efefef] text-[11px] px-2 py-2 border-r border-black">Fabricación de &quot;{it.name}&quot;</div>
                    <div className="bg-[#efefef] text-[11px] px-2 py-2 border-r border-black">{formatCurrency(it.price)}</div>
                    <div className="bg-[#efefef] text-[11px] px-2 py-2">{formatCurrency(total)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Totales estilo PDF */}
      <div className="mt-6 bg-white px-4">
        <div className="ml-auto w-full sm:max-w-[340px]">
          <div className="flex justify-between text-sm bg-[#f7f7f7] px-3 py-2 border border-gray-200 border-b-0">
            <span className="text-gray-800">Subtotal</span>
            <span className="text-gray-900">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm bg-[#f7f7f7] px-3 py-2 border border-gray-200">
            <span className="text-gray-800">ITBIS (18%)</span>
            <span className="text-gray-900">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-white bg-[#9d5421] px-3 py-2">
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
          <Download size={16} /> Descargar presupuesto (PDF)
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
