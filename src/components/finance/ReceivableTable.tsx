import {
  CalendarDays,
  ChevronRight,
  CircleCheck,
  Clock3,
  AlertCircle,
} from "lucide-react";

import type {
  AccountReceivable,
} from "@/features/finance/finance.types";

interface ReceivableTableProps {
  receivables: AccountReceivable[];
  isLoading?: boolean;
  onSelect?: (receivable: AccountReceivable) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(`${value}T00:00:00`),
  );
}

function getStatusConfig(status: AccountReceivable["status"]) {
  switch (status) {
    case "paid":
      return {
        label: "Pago",
        className: "bg-emerald-50 text-emerald-700",
        icon: CircleCheck,
      };

    case "partially_paid":
      return {
        label: "Parcial",
        className: "bg-blue-50 text-blue-700",
        icon: Clock3,
      };

    case "overdue":
      return {
        label: "Vencido",
        className: "bg-red-50 text-red-700",
        icon: AlertCircle,
      };

    case "cancelled":
      return {
        label: "Cancelado",
        className: "bg-gray-100 text-gray-600",
        icon: AlertCircle,
      };

    case "refunded":
      return {
        label: "Estornado",
        className: "bg-purple-50 text-purple-700",
        icon: AlertCircle,
      };

    case "open":
    default:
      return {
        label: "Em aberto",
        className: "bg-amber-50 text-amber-700",
        icon: Clock3,
      };
  }
}

export function ReceivableTable({
  receivables,
  isLoading = false,
  onSelect,
}: ReceivableTableProps) {
  if (isLoading) {
    return (
      <>
        {/* Desktop */}
        <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
          <div className="animate-pulse">
            <div className="h-12 border-b border-gray-200 bg-gray-50" />

            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-5 gap-4 border-b border-gray-100 px-5 py-5 last:border-0"
              >
                <div className="h-4 rounded bg-gray-100" />
                <div className="h-4 rounded bg-gray-100" />
                <div className="h-4 rounded bg-gray-100" />
                <div className="h-4 rounded bg-gray-100" />
                <div className="ml-auto h-4 w-20 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div className="space-y-3 md:hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="h-4 w-40 rounded bg-gray-100" />
              <div className="mt-3 h-3 w-28 rounded bg-gray-100" />
              <div className="mt-5 h-6 w-24 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (receivables.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <CircleCheck className="mx-auto h-9 w-9 text-gray-300" />

        <h3 className="mt-3 text-sm font-semibold text-gray-900">
          Nenhuma conta a receber
        </h3>

        <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
          Não existem contas a receber para os filtros
          selecionados.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ================================================= */}
      {/* DESKTOP / TABLET */}
      {/* ================================================= */}

      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Descrição
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Vencimento
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Valor
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Ação
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {receivables.map((receivable) => {
                const status =
                  getStatusConfig(receivable.status);

                const StatusIcon = status.icon;

                return (
                  <tr
                    key={receivable.id}
                    className="cursor-pointer transition hover:bg-gray-50"
                    onClick={() =>
                      onSelect?.(receivable)
                    }
                  >
                    <td className="px-5 py-4">
                      <p className="max-w-[280px] truncate text-sm font-medium text-gray-900">
                        {receivable.description}
                      </p>

                      {receivable.orderId && (
                        <p className="mt-1 text-xs text-gray-500">
                          Pedido vinculado
                        </p>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDays className="h-4 w-4 text-gray-400" />

                        <span>
                          {receivable.nextDueDate
                            ? formatDate(receivable.nextDueDate)
                            : "—"}
                        </span>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(
                          receivable.totalAmount,
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />

                        {status.label}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onSelect?.(receivable);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                          Ver detalhes

                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      {/* ================================================= */}
      {/* MOBILE */}
      {/* ================================================= */}

      <div className="space-y-3 md:hidden">
        {receivables.map((receivable) => {
          const status =
            getStatusConfig(receivable.status);

          const StatusIcon = status.icon;

          return (
            <button
              key={receivable.id}
              type="button"
              onClick={() =>
                onSelect?.(receivable)
              }
              className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-gray-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {receivable.description}
                  </p>

                  {receivable.orderId && (
                    <p className="mt-1 text-xs text-gray-500">
                      Pedido vinculado
                    </p>
                  )}
                </div>

                <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
              </div>

              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500">
                    Valor
                  </p>

                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {formatCurrency(
                      receivable.totalAmount,
                    )}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />

                  {status.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}