import {
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  CalendarDays,
} from "lucide-react";

import type { CashMovement } from "@/features/finance/finance.types";

interface CashMovementTableProps {
  movements: CashMovement[];
  accounts: {
    id: string;
    name: string;
  }[];
  isLoading?: boolean;
  onSelect?: (movement: CashMovement) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(`${date}T00:00:00`),
  );
}

function getAccountName(
  accountId: string,
  accounts: CashMovementTableProps["accounts"],
) {
  return (
    accounts.find((account) => account.id === accountId)
      ?.name ?? "Conta financeira"
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
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
        <CalendarDays
          size={22}
          className="text-slate-400"
        />
      </div>

      <h3 className="text-sm font-semibold text-slate-900">
        Nenhuma movimentação encontrada
      </h3>

      <p className="mt-1 max-w-sm text-sm text-slate-500">
        As entradas e saídas do caixa aparecerão aqui.
      </p>
    </div>
  );
}

export function CashMovementTable({
  movements,
  accounts,
  isLoading = false,
  onSelect,
}: CashMovementTableProps) {
  if (!isLoading && movements.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[780px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Data
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Descrição
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Conta
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Valor
              </th>

              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <LoadingRows />
            ) : (
              movements.map((movement) => {
                const isIncome =
                  movement.type === "income";

                return (
                  <tr
                    key={movement.id}
                    onClick={() =>
                      onSelect?.(movement)
                    }
                    className={`transition ${
                      onSelect
                        ? "cursor-pointer hover:bg-slate-50"
                        : ""
                    }`}
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {formatDate(
                        movement.movementDate,
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isIncome
                              ? "bg-emerald-50"
                              : "bg-red-50"
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpCircle
                              size={18}
                              className="text-emerald-600"
                            />
                          ) : (
                            <ArrowDownCircle
                              size={18}
                              className="text-red-600"
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {movement.description}
                          </p>

                          {movement.notes && (
                            <p className="mt-0.5 max-w-md truncate text-xs text-slate-500">
                              {movement.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {getAccountName(
                        movement.financialAccountId,
                        accounts,
                      )}
                    </td>

                    <td
                      className={`px-6 py-4 text-right text-sm font-semibold ${
                        isIncome
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(
                        movement.amount,
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      {onSelect && (
                        <ArrowRight
                          size={17}
                          className="text-slate-400"
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-slate-100 md:hidden">
        {isLoading ? (
          Array.from({ length: 5 }).map(
            (_, index) => (
              <div
                key={index}
                className="p-4"
              >
                <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
              </div>
            ),
          )
        ) : (
          movements.map((movement) => {
            const isIncome =
              movement.type === "income";

            return (
              <button
                key={movement.id}
                type="button"
                onClick={() =>
                  onSelect?.(movement)
                }
                disabled={!onSelect}
                className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-slate-50 disabled:cursor-default"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    isIncome
                      ? "bg-emerald-50"
                      : "bg-red-50"
                  }`}
                >
                  {isIncome ? (
                    <ArrowUpCircle
                      size={19}
                      className="text-emerald-600"
                    />
                  ) : (
                    <ArrowDownCircle
                      size={19}
                      className="text-red-600"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">
                    {movement.description}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(
                      movement.movementDate,
                    )}{" "}
                    •{" "}
                    {getAccountName(
                      movement.financialAccountId,
                      accounts,
                    )}
                  </p>

                  <p
                    className={`mt-1 text-sm font-semibold ${
                      isIncome
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(
                      movement.amount,
                    )}
                  </p>
                </div>

                {onSelect && (
                  <ArrowRight
                    size={18}
                    className="shrink-0 text-slate-400"
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}