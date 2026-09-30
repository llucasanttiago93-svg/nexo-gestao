import {
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  CalendarDays,
  ArrowLeftRight,
} from "lucide-react";

import type { CashMovement } from "@/features/finance/finance.types";

import { useSettings } from "@/features/settings/SettingsContext";

interface CashMovementTableProps {
  movements: CashMovement[];
  accounts: {
    id: string;
    name: string;
  }[];
  isLoading?: boolean;
  onSelect?: (movement: CashMovement) => void;
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

function getTransferDestination(
  movement: CashMovement,
  movements: CashMovement[],
  accounts: CashMovementTableProps["accounts"],
) {
  if (!movement.transferId) {
    return null;
  }

  const relatedMovement = movements.find(
    (item) =>
      item.transferId === movement.transferId &&
      item.id !== movement.id,
  );

  if (!relatedMovement) {
    return null;
  }

  return getAccountName(
    relatedMovement.financialAccountId,
    accounts,
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
  const { formatCurrency, formatDate } = useSettings();
  if (!isLoading && movements.length === 0) {
    return <EmptyState />;
  }

  /**
   * Uma transferência gera dois registros no banco:
   * - saída na conta de origem
   * - entrada na conta de destino
   *
   * Na interface, porém, mostramos apenas uma linha para representar
   * a transferência completa.
   */
  const displayMovements = (() => {
    const result: CashMovement[] = [];
    const processedTransfers = new Set<string>();

    for (const movement of movements) {
      if (!movement.transferId) {
        result.push(movement);
        continue;
      }

      if (processedTransfers.has(movement.transferId)) {
        continue;
      }

      processedTransfers.add(movement.transferId);

      const relatedMovements = movements.filter(
        (item) => item.transferId === movement.transferId,
      );

      // Preferimos o movimento de saída como representante da transferência.
      // Se ele não estiver disponível na página atual, usamos o primeiro registro.
      const sourceMovement =
        relatedMovements.find((item) => item.type === "expense") ??
        relatedMovements[0];

      result.push(sourceMovement);
    }

    return result;
  })();

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
              displayMovements.map((movement) => {
                const isTransfer = Boolean(movement.transferId);
                const isIncome = movement.type === "income";

                const transferMovements = movement.transferId
                  ? movements.filter(
                      (item) => item.transferId === movement.transferId,
                    )
                  : [];

                const sourceMovement =
                  transferMovements.find(
                    (item) => item.type === "expense",
                  ) ?? movement;

                const destinationMovement =
                  transferMovements.find(
                    (item) => item.type === "income",
                  ) ?? movement;

                const sourceAccountName = getAccountName(
                  sourceMovement.financialAccountId,
                  accounts,
                );

                const destinationAccountName = getAccountName(
                  destinationMovement.financialAccountId,
                  accounts,
                );

                return (
                  <tr
                    key={movement.id}
                    onClick={() => onSelect?.(movement)}
                    className={`transition ${
                      onSelect
                        ? "cursor-pointer hover:bg-slate-50"
                        : ""
                    }`}
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {formatDate(movement.movementDate)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isTransfer
                              ? "bg-blue-50"
                              : isIncome
                                ? "bg-emerald-50"
                                : "bg-red-50"
                          }`}
                        >
                          {isTransfer ? (
                            <ArrowLeftRight
                              size={18}
                              className="text-blue-600"
                            />
                          ) : isIncome ? (
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
                            {isTransfer
                              ? "Transferência entre contas"
                              : movement.description}
                          </p>

                          {isTransfer ? (
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {sourceAccountName} →{" "}
                              {destinationAccountName}
                            </p>
                          ) : movement.notes ? (
                            <p className="mt-0.5 max-w-md truncate text-xs text-slate-500">
                              {movement.notes}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {isTransfer
                        ? sourceAccountName
                        : getAccountName(
                            movement.financialAccountId,
                            accounts,
                          )}
                    </td>

                    <td
                      className={`px-6 py-4 text-right text-sm font-semibold ${
                        isTransfer
                          ? "text-blue-600"
                          : isIncome
                            ? "text-emerald-600"
                            : "text-red-600"
                      }`}
                    >
                      {isTransfer
                        ? ""
                        : isIncome
                          ? "+"
                          : "-"}
                      {formatCurrency(movement.amount)}
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
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4">
              <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
            </div>
          ))
        ) : (
          displayMovements.map((movement) => {
            const isTransfer = Boolean(movement.transferId);
            const isIncome = movement.type === "income";

            const transferMovements = movement.transferId
              ? movements.filter(
                  (item) => item.transferId === movement.transferId,
                )
              : [];

            const sourceMovement =
              transferMovements.find(
                (item) => item.type === "expense",
              ) ?? movement;

            const destinationMovement =
              transferMovements.find(
                (item) => item.type === "income",
              ) ?? movement;

            const sourceAccountName = getAccountName(
              sourceMovement.financialAccountId,
              accounts,
            );

            const destinationAccountName = getAccountName(
              destinationMovement.financialAccountId,
              accounts,
            );

            return (
              <button
                key={movement.id}
                type="button"
                onClick={() => onSelect?.(movement)}
                disabled={!onSelect}
                className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-slate-50 disabled:cursor-default"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    isTransfer
                      ? "bg-blue-50"
                      : isIncome
                        ? "bg-emerald-50"
                        : "bg-red-50"
                  }`}
                >
                  {isTransfer ? (
                    <ArrowLeftRight
                      size={19}
                      className="text-blue-600"
                    />
                  ) : isIncome ? (
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
                    {isTransfer
                      ? "Transferência entre contas"
                      : movement.description}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(movement.movementDate)} •{" "}
                    {isTransfer
                      ? `${sourceAccountName} → ${destinationAccountName}`
                      : getAccountName(
                          movement.financialAccountId,
                          accounts,
                        )}
                  </p>

                  {isTransfer ? (
                    <p className="mt-1 truncate text-xs text-slate-500">
                      Transferência interna
                    </p>
                  ) : movement.notes ? (
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {movement.notes}
                    </p>
                  ) : null}

                  <p
                    className={`mt-1 text-sm font-semibold ${
                      isTransfer
                        ? "text-blue-600"
                        : isIncome
                          ? "text-emerald-600"
                          : "text-red-600"
                    }`}
                  >
                    {isTransfer
                      ? ""
                      : isIncome
                        ? "+"
                        : "-"}
                    {formatCurrency(movement.amount)}
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