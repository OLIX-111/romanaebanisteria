interface PriceBlockProps {
  price: number;
  comparePrice?: number;
  currency?: string;
}

export function PriceBlock({ price, comparePrice, currency = 'DOP' }: PriceBlockProps) {
  const fmt = (n: number) => new Intl.NumberFormat('es-DO', { style: 'currency', currency }).format(n);
  return (
    <div className="flex items-end gap-3">
      <p className="text-3xl font-semibold text-gray-900 tabular-nums">{fmt(price)}</p>
      {comparePrice && comparePrice > price && (
        <span className="text-sm text-gray-500 line-through">{fmt(comparePrice)}</span>
      )}
    </div>
  );
}
