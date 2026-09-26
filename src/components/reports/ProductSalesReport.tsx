import { Package } from "lucide-react";

import type { ProductSalesReport as ProductSalesReportType } from "@/features/reports/reports.types";

interface ProductSalesReportProps {
  data: ProductSalesReportType[];
  isLoading?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

export function ProductSalesReport({
  data,
  isLoading = false,
}: ProductSalesReportProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-900">
          Desempenho por produto
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Faturamento, custo e margem dos produtos vendidos.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center px-5 text-center">
          <Package
            size={24}
            className="text-slate-400"
          />

          <p className="mt-3 text-sm text-slate-500">
            Nenhuma venda encontrada.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {data.slice(0, 10).map((product, index) => (
            <div
              key={`${product.productId}-${product.productName}`}
              className="px-5 py-4"
            >
              {/* Produto */}
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {product.productName}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {product.quantity} unidade
                    {product.quantity !== 1 ? "s" : ""}
                    {product.sku
                      ? ` • SKU ${product.sku}`
                      : ""}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(product.revenue)}
                  </p>

                  <p className="text-xs text-slate-500">
                    faturamento
                  </p>
                </div>
              </div>

              {/* Indicadores */}
              <div className="mt-4 grid grid-cols-3 gap-3 pl-12">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Custo
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {formatCurrency(product.cost)}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Lucro bruto
                  </p>

                  <p
                    className={`mt-1 text-sm font-semibold ${
                      product.grossProfit >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(product.grossProfit)}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Margem
                  </p>

                  <p
                    className={`mt-1 text-sm font-semibold ${
                      product.margin >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatPercent(product.margin)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}