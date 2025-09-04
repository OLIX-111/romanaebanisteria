import { useEffect, useMemo, useState } from 'react';

interface FinanceCalculatorProps {
  basePrice: number; // precio del producto (variant price)
  variantId: string; // para detectar cambio de variante
  currency?: string;
  onApply?: (data: {
    price: number;
    downPayment: number;
    loanAmount: number;
    term: number;
    annualRate: number;
    monthlyRate: number;
    monthlyPayment: number;
    totalPaid: number;
    variantId: string;
  }) => void;
}

// Fórmula de cuota mensual (amortización estándar):
// M = P * r / (1 - (1 + r)^-n)
// r = tasa de interés mensual decimal, n = meses

export function ProductFinanceCalculator({ basePrice, variantId, currency = 'DOP', onApply }: FinanceCalculatorProps) {
  const fmt = (n: number) => new Intl.NumberFormat('es-DO', { style: 'currency', currency }).format(n);

  const [price, setPrice] = useState(basePrice); // usuario puede editar
  const [downPayment, setDownPayment] = useState(() => +(basePrice * 0.20).toFixed(2));
  const [term, setTerm] = useState(12); // meses
  const [annualRate, setAnnualRate] = useState(24); // % anual
  const [touched, setTouched] = useState(false); // para no pisar edición manual de precio cuando cambia variant

  // Sincronizar cuando cambia basePrice (mismo variant) solo si usuario no tocó manualmente.
  useEffect(() => {
    if (!touched) {
      setPrice(basePrice);
      setDownPayment(+(basePrice * 0.20).toFixed(2));
    }
  }, [basePrice, touched]);

  // Reset completo cuando cambia variantId (nuevo variant siempre reinicia)
  useEffect(() => {
    setPrice(basePrice);
    setDownPayment(+(basePrice * 0.20).toFixed(2));
    setTouched(false);
  }, [variantId]);

  // Normalizar pago inicial para que nunca sea < 20%
  useEffect(() => {
    const min = +(price * 0.20).toFixed(2);
    if (downPayment < min) setDownPayment(min);
  }, [price, downPayment]);

  const loanAmount = useMemo(() => Math.max(price - downPayment, 0), [price, downPayment]);
  const monthlyRate = useMemo(() => (annualRate / 100) / 12, [annualRate]);

  const monthlyPayment = useMemo(() => {
    if (loanAmount <= 0) return 0;
    if (monthlyRate === 0) return loanAmount / term;
    const r = monthlyRate;
    const n = term;
    const m = loanAmount * (r / (1 - Math.pow(1 + r, -n)));
    return m;
  }, [loanAmount, monthlyRate, term]);

  const downPct = useMemo(() => (price > 0 ? (downPayment / price) * 100 : 0), [price, downPayment]);

  const handleApply = () => {
    if (!onApply) return;
    onApply({
      price,
      downPayment,
      loanAmount,
      term,
      annualRate,
      monthlyRate,
      monthlyPayment,
      totalPaid: monthlyPayment * term,
      variantId
    });
  };

  const [open, setOpen] = useState(false);
  return (
    <div className="mt-8 border border-slate-300 p-0 bg-white">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left group select-none"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold tracking-wide text-slate-700">Financiamiento estimado</span>
        <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">{open ? 'Ocultar' : 'Mostrar'}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-5">
          <p className="text-[11px] text-slate-500 leading-relaxed">Simula tu cuota mensual. Valores aproximados.</p>

          <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Precio del mueble *</label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => { setPrice(+e.target.value || 0); setTouched(true); }}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600 flex items-center justify-between">
            <span>Pago inicial (&gt;=20%) *</span>
            <span className="text-[10px] text-gray-400">{downPct.toFixed(1)}%</span>
          </label>
          <input
            type="number"
            min={Math.round(price * 0.20)}
            value={downPayment}
            onChange={(e) => setDownPayment(+e.target.value || 0)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-[11px] text-gray-400">Mínimo requerido: {fmt(price * 0.20)}</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Plazo (meses) *</label>
          <select
            value={term}
            onChange={(e) => setTerm(+e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {[6,12,18,24].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Tasa de interés anual (%) *</label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={annualRate}
            onChange={(e) => setAnnualRate(+e.target.value || 0)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-[11px] text-gray-400">Equivale a {(monthlyRate*100).toFixed(2)}% mensual aprox.</p>
        </div>
      </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-2">
        <div className=" bg-gray-50 p-3">
          <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">Valor del préstamo</p>
          <p className="mt-1 text-sm font-semibold text-gray-900 tabular-nums">{fmt(loanAmount)}</p>
        </div>
        <div className=" bg-gray-50 p-3">
          <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">Cuota mensual</p>
          <p className="mt-1 text-sm font-semibold text-gray-900 tabular-nums">{loanAmount>0?fmt(monthlyPayment):fmt(0)}</p>
        </div>
        <div className=" bg-gray-50 p-3">
          <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">Total en plazo</p>
          <p className="mt-1 text-sm font-semibold text-gray-900 tabular-nums">{fmt(monthlyPayment*term)}</p>
        </div>
      </div>

          <div className="flex flex-col sm:items-center gap-4 pt-1">
        <button
          type="button"
          disabled={loanAmount <= 0}
          onClick={handleApply}
          className={`w-full px-5 py-3 text-sm font-semibold  transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${loanAmount <= 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900/30'}`}
        >
          Aplicar a financiamiento
        </button>
        <span className="text-[11px] text-gray-400 leading-snug">Al aplicar aceptas revisión crediticia y contacto por parte de nuestro equipo.</span>
      </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">Cálculo estimado utilizando fórmula de amortización estándar. Los valores reales pueden variar según evaluación crediticia y condiciones finales.</p>
        </div>
      )}
    </div>
  );
}
