import { ArrowRight, CalendarDays } from "lucide-react";

import { useSettings } from "@/features/settings/SettingsContext";
import type { AccountPayable } from "@/features/finance/finance.types";

interface PayableTableProps {
  payables: AccountPayable[];
  isLoading?: boolean;
  onSelect: (payable: AccountPayable) => void;
}

function getStatusLabel(status: AccountPayable["status"]) {
  switch (status) {
    case "open":
      return "Em aberto";
    case "partially_paid":
      return "Parcialmente pago";
    case "paid":
      return "Pago";
    case "overdue":
      return "Vencido";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
}

function getStatusClass(status: AccountPayable["status"]) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700";
    case "partially_paid":
      return "bg-amber-50 text-amber-700";
    case "overdue":
      return "bg-red-50 text-red-700";
    case "cancelled":
      return "bg-slate-100 text-slate-500";
    case "open":
    default:
      return "bg-blue-50 text-blue-700";
  }
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index}>
          <td colSpan={5} className="px-6 py-4">
            <div className="h-5 animate-pulse rounded bg-slate-100" />
          </td>
        </tr>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <CalendarDays size={22} className="text-slate-400" />
      </div>

      <h3 className="text-sm font-semibold text-slate-900">
        Nenhuma conta a pagar encontrada
      </h3>

      <p className="mt-1 max-w-sm text-sm text-slate-500">
        As contas a pagar cadastradas aparecerão aqui.
      </p>
    </div>
  );
}

export function PayableTable({
  payables,
  isLoading = false,
  onSelect,
}: PayableTableProps) {
  const { formatCurrency, formatDate } = useSettings();

  if (!isLoading && payables.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Vencimento
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Valor
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <LoadingRows />
            ) : (
              payables.map((payable) => (
                <tr
                  key={payable.id}
                  onClick={() => onSelect(payable)}
                  className="cursor-pointer transition hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {payable.description}
                    </div>

                    {payable.notes && (
                      <div className="mt-0.5 max-w-md truncate text-xs text-slate-500">
                        {payable.notes}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {payable.nextDueDate
                      ? formatDate(payable.nextDueDate)
                      : "—"}
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    {formatCurrency(payable.totalAmount)}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                        payable.status,
                      )}`}
                    >
                      {getStatusLabel(payable.status)}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <ArrowRight size={17} className="text-slate-400" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-slate-100 md:hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="p-4">
              <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
            </div>
          ))
        ) : (
          payables.map((payable) => (
            <button
              key={payable.id}
              type="button"
              onClick={() => onSelect(payable)}
              className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-slate-50"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-slate-900">
                  {payable.description}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  {formatCurrency(payable.totalAmount)}
                </div>

                {payable.nextDueDate && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays size={13} />
                    <span>
                      Vencimento: {formatDate(payable.nextDueDate)}
                    </span>
                  </div>
                )}

                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                    payable.status,
                  )}`}
                >
                  {getStatusLabel(payable.status)}
                </span>
              </div>

              <ArrowRight
                size={18}
                className="shrink-0 text-slate-400"
              />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
