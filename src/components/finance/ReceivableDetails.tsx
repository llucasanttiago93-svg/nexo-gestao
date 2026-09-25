import {
  ArrowDownToLine,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  Wallet,
  X,
} from "lucide-react";

import type {
  AccountReceivable,
  FinanceAccount,
  ReceivableInstallment,
} from "@/features/finance/finance.types";

interface ReceivableDetailsProps {
  receivable: AccountReceivable;
  installments: ReceivableInstallment[];
  accounts: FinanceAccount[];
  isLoading?: boolean;
  isPaying?: boolean;
  onPay: (
    installment: ReceivableInstallment,
    accountId: string,
  ) => void;
  onClose: () => void;
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

function getStatusLabel(status: string) {
  const statusMap: Record<string, string> = {
    open: "Em aberto",
    partially_paid: "Parcialmente pago",
    paid: "Pago",
    overdue: "Vencido",
    cancelled: "Cancelado",
    refunded: "Estornado",
  };

  return statusMap[status] ?? status;
}

function getStatusClass(status: string) {
  const statusMap: Record<string, string> = {
    open: "bg-amber-50 text-amber-700",
    partially_paid: "bg-blue-50 text-blue-700",
    paid: "bg-emerald-50 text-emerald-700",
    overdue: "bg-red-50 text-red-700",
    cancelled: "bg-gray-100 text-gray-600",
    refunded: "bg-purple-50 text-purple-700",
  };

  return (
    statusMap[status] ??
    "bg-gray-100 text-gray-600"
  );
}

export function ReceivableDetails({
  receivable,
  installments,
  accounts,
  isLoading = false,
  isPaying = false,
  onPay,
  onClose,
}: ReceivableDetailsProps) {
  const totalPaid = installments.reduce(
    (total, installment) =>
      total + installment.paidAmount,
    0,
  );

  const remainingAmount = Math.max(
    receivable.totalAmount - totalPaid,
    0,
  );

  const hasActiveInstallments =
    installments.some(
      (installment) =>
        installment.status === "open" ||
        installment.status === "partially_paid" ||
        installment.status === "overdue",
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">

        {/* HEADER */}

        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />

              <h2 className="truncate text-lg font-semibold text-gray-900">
                Detalhes da conta
              </h2>
            </div>

            <p className="mt-1 truncate text-sm text-gray-500">
              {receivable.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>


        {/* CONTENT */}

        <div className="overflow-y-auto p-5 sm:p-6">
          <div className="space-y-6">

            {/* RESUMO */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">
                  Valor total
                </p>

                <p className="mt-1 text-xl font-bold text-gray-900">
                  {formatCurrency(
                    receivable.totalAmount,
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">
                  Já recebido
                </p>

                <p className="mt-1 text-xl font-bold text-emerald-600">
                  {formatCurrency(totalPaid)}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">
                  Saldo restante
                </p>

                <p className="mt-1 text-xl font-bold text-gray-900">
                  {formatCurrency(
                    remainingAmount,
                  )}
                </p>
              </div>

            </div>


            {/* INFORMAÇÕES */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">
                    Status
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                      receivable.status,
                    )}`}
                  >
                    {getStatusLabel(
                      receivable.status,
                    )}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500">
                  Pedido
                </p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {receivable.orderId
                    ? "Pedido vinculado"
                    : "Sem pedido vinculado"}
                </p>
              </div>

            </div>


            {/* PARCELAS */}

            <section>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Parcelas
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Acompanhe vencimentos e recebimentos.
                  </p>
                </div>

                <span className="text-sm font-medium text-gray-500">
                  {installments.length}{" "}
                  {installments.length === 1
                    ? "parcela"
                    : "parcelas"}
                </span>
              </div>


              {isLoading ? (
                <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-8">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : installments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                  <CalendarDays className="mx-auto h-8 w-8 text-gray-300" />

                  <p className="mt-3 text-sm font-medium text-gray-900">
                    Nenhuma parcela encontrada
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {installments.map(
                    (installment) => {
                      const remaining = Math.max(
                        installment.amount -
                          installment.paidAmount,
                        0,
                      );

                      const canPay =
                        installment.status ===
                          "open" ||
                        installment.status ===
                          "partially_paid" ||
                        installment.status ===
                          "overdue";

                      return (
                        <div
                          key={installment.id}
                          className="rounded-xl border border-gray-200 p-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">
                                  Parcela{" "}
                                  {
                                    installment.installmentNumber
                                  }
                                </span>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                    installment.status,
                                  )}`}
                                >
                                  {getStatusLabel(
                                    installment.status,
                                  )}
                                </span>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                <span className="inline-flex items-center gap-1.5">
                                  <CalendarDays className="h-3.5 w-3.5" />

                                  Vencimento:{" "}
                                  {formatDate(
                                    installment.dueDate,
                                  )}
                                </span>

                                <span>
                                  Valor:{" "}
                                  {formatCurrency(
                                    installment.amount,
                                  )}
                                </span>

                                {installment.paidAmount >
                                  0 && (
                                  <span className="text-emerald-600">
                                    Pago:{" "}
                                    {formatCurrency(
                                      installment.paidAmount,
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>


                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                              <div className="text-left sm:text-right">
                                <p className="text-xs text-gray-500">
                                  Restante
                                </p>

                                <p className="text-base font-bold text-gray-900">
                                  {formatCurrency(
                                    remaining,
                                  )}
                                </p>
                              </div>

                              {canPay &&
                                remaining > 0 && (
                                  <button
                                    type="button"
                                    disabled={
                                      isPaying ||
                                      accounts.length ===
                                        0
                                    }
                                    onClick={() => {
                                      const account =
                                        accounts.find(
                                          (
                                            item,
                                          ) =>
                                            item.isActive,
                                        );

                                      if (
                                        account
                                      ) {
                                        onPay(
                                          installment,
                                          account.id,
                                        );
                                      }
                                    }}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {isPaying ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin" />

                                        Recebendo...
                                      </>
                                    ) : (
                                      <>
                                        <ArrowDownToLine className="h-4 w-4" />

                                        Receber
                                      </>
                                    )}
                                  </button>
                                )}

                              {installment.status ===
                                "paid" && (
                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                                  <CheckCircle2 className="h-4 w-4" />

                                  Recebido
                                </span>
                              )}
                            </div>

                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </section>


            {/* CONTA FINANCEIRA */}

            {hasActiveInstallments && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Conta financeira
                    </p>

                    <p className="mt-1 text-sm leading-5 text-blue-700">
                      O recebimento será lançado na
                      primeira conta financeira ativa.
                    </p>

                    {accounts.length === 0 && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        Cadastre uma conta financeira
                        antes de registrar um recebimento.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>


        {/* FOOTER */}

        <div className="flex justify-end border-t border-gray-200 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}