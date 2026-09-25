interface StockBadgeProps {
  stock: number;
  minStock: number;
}

export function StockBadge({
  stock,
  minStock,
}: StockBadgeProps) {
  if (stock === 0) {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
        Sem estoque
      </span>
    );
  }

  if (stock <= minStock) {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
        Estoque baixo
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
      Em estoque
    </span>
  );
}