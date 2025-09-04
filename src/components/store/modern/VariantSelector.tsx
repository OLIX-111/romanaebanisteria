"use client"

interface VariantSelectorProps {
  variants: { id: string; name: string; price: number; comparePrice?: number }[]
  activeId: string
  onSelect: (id: string) => void
}

export function VariantSelector({ variants, activeId, onSelect }: VariantSelectorProps) {
  if (variants.length <= 1) return null
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Variantes</h3>
        <span className="text-[11px] text-slate-400 font-medium">{variants.length}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {variants.map((v) => {
          const isActive = v.id === activeId
          return (
            <button
              key={v.id}
              onClick={() => onSelect(v.id)}
              aria-pressed={isActive}
              className={`group relative border px-4 py-3 text-left text-sm font-medium tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 transition-colors ${isActive ? 'border-primary/50 bg-primary/10 text-gray-900' : 'border-slate-300 hover:border-slate-500 bg-white text-slate-800'}`}
            >
              <span className="block leading-snug pr-6">{v.name}</span>
              {isActive && <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-primary "></span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
