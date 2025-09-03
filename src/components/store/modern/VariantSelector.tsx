"use client"

interface VariantSelectorProps {
  variants: { id: string; name: string; price: number; comparePrice?: number }[]
  activeId: string
  onSelect: (id: string) => void
}

export function VariantSelector({ variants, activeId, onSelect }: VariantSelectorProps) {
  if (variants.length <= 1) return null
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold tracking-wide text-slate-600 uppercase">Variantes disponibles</h3>
      <ul className="space-y-3">
        {variants.map((v) => {
          const isActive = v.id === activeId
          return (
            <li
              key={v.id}
              className={`flex items-center justify-between rounded-lg border-2 px-4 py-3 text-base transition-all duration-200 ${isActive ? "border-slate-900 bg-slate-50/80 shadow-sm" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/40"}`}
            >
              <span className="truncate pr-6 font-medium text-slate-800">{v.name}</span>
              <button
                onClick={() => onSelect(v.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-md border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isActive ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus:ring-slate-900/20"}`}
                aria-pressed={isActive}
              >
                {isActive ? "Seleccionada" : "Seleccionar"}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
