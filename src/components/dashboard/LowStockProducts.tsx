import {
  AlertTriangle,
  Package,
} from "lucide-react";

import type { DashboardProduct } from "@/features/dashboard/dashboard.types";

interface LowStockProductsProps {
  products: DashboardProduct[];
}

export function LowStockProducts({
  products,
}: LowStockProductsProps) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Estoque baixo
          </h2>

          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Produtos que precisam de atenção.
          </p>
        </div>

        <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
          <AlertTriangle size={18} />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center text-center">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Estoque em dia
            </p>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Nenhum produto atingiu o estoque mínimo.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-lg border border-[var(--color-border-light)] p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Package size={17} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                    {product.name}
                  </p>

                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                    Mínimo: {product.minStock} un.
                  </p>
                </div>
              </div>

              <span className="ml-3 shrink-0 text-sm font-semibold text-amber-600">
                {product.stock} un.
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}