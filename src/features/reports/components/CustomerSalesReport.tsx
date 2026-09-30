import { Users } from "lucide-react";

import type { CustomerSalesReport as CustomerSalesReportType } from "@/features/reports/reports.types";
import { useSettings } from "@/features/settings/SettingsContext";

interface CustomerSalesReportProps {
  data: CustomerSalesReportType[];
  isLoading?: boolean;
}

export function CustomerSalesReport({
  data,
  isLoading = false,
}: CustomerSalesReportProps) {
  const { formatCurrency } = useSettings();

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-900">
          Clientes com maior faturamento
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Clientes que mais compraram no período.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center px-5 text-center">
          <Users
            size={24}
            className="text-slate-400"
          />

          <p className="mt-3 text-sm text-slate-500">
            Nenhuma venda encontrada.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {data.slice(0, 10).map((customer, index) => (
            <div
              key={customer.customerId}
              className="flex items-center gap-4 px-5 py-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                {index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {customer.customerName}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {customer.orders} pedido
                  {customer.orders !== 1 ? "s" : ""}
                </p>
              </div>

              <p className="shrink-0 text-sm font-semibold text-slate-900">
                {formatCurrency(customer.revenue)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}