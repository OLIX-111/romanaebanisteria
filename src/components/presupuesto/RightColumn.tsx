"use client"

import Image from "next/image"
import { Download } from "lucide-react"
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
  onDownload: () => void
}

export default function RightColumn({ items, subtotal, tax, total, onQtyChange, onRemove, onClear, onDownload }: RightColumnProps) {
  return (
  <section className="lg:col-span-2 lg:sticky lg:top-24 self-start">
      <div className="border border-gray-200">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Seleccionados</h2>
          {items.length > 0 && (
            <button onClick={onClear} className="text-xs text-gray-600 hover:text-gray-900">Vaciar</button>
          )}
        </div>
        {items.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">Aún no has seleccionado productos.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
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

      <div className="mt-6 border border-gray-200 p-4">
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
          onClick={onDownload}
          disabled={items.length === 0}
          className={`inline-flex items-center justify-center gap-2 border px-5 py-3 text-sm ${items.length ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"}`}
        >
          <Download size={16} /> Descargar presupuesto (PDF)
        </button>
      </div>
    </section>
  )
}
