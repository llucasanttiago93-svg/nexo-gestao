import { useMemo, useState } from "react";

import { useSettings } from "@/features/settings/SettingsContext";
import {
    CheckCircle2,
    CreditCard,
    Wallet,
    X,
} from "lucide-react";

import type {
    AccountPayable,
    FinanceAccount,
    PayableInstallment,
} from "@/features/finance/finance.types";

interface PayableDetailsProps {
    payable: AccountPayable;
    installments: PayableInstallment[];
    accounts: FinanceAccount[];
    isLoading?: boolean;
    isPaying?: boolean;

    onClose: () => void;

    onPay: (
        installment: PayableInstallment,
        accountId: string,
        amount: number,
    ) => void;
}


function getStatusLabel(
    status: PayableInstallment["status"],
) {
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

function getStatusClass(
    status: PayableInstallment["status"],
) {
    switch (status) {
        case "paid":
            return "bg-emerald-50 text-emerald-700";

        case "partially_paid":
            return "bg-amber-50 text-amber-700";

        case "overdue":
            return "bg-red-50 text-red-700";

        case "cancelled":
            return "bg-slate-100 text-slate-500";

        default:
            return "bg-blue-50 text-blue-700";
    }
}

export function PayableDetails({
    payable,
    installments,
    accounts,
    isLoading = false,
    isPaying = false,
    onClose,
    onPay,
}: PayableDetailsProps) {
  const { formatCurrency, formatDate } = useSettings();
    const [paymentInstallment, setPaymentInstallment] =
        useState<PayableInstallment | null>(null);

    const [selectedAccountId, setSelectedAccountId] =
        useState("");

    const [paymentAmount, setPaymentAmount] =
        useState("");

    const totalPaid = useMemo(
        () =>
            installments.reduce(
                (total, installment) =>
                    total + Number(installment.paidAmount),
                0,
            ),
        [installments],
    );

    const remaining = Math.max(
        Number(payable.totalAmount) - totalPaid,
        0,
    );

    function openPayment(
        installment: PayableInstallment,
    ) {
        const defaultAccount = accounts.find(
            (account) => account.isActive,
        );

        setPaymentInstallment(installment);

        setSelectedAccountId(
            installment.financialAccountId ??
            defaultAccount?.id ??
            "",
        );

        const installmentRemaining = Math.max(
            Number(installment.amount) -
            Number(installment.paidAmount),
            0,
        );

        setPaymentAmount(
            installmentRemaining.toFixed(2),
        );
    }

    function closePayment() {
        setPaymentInstallment(null);
        setSelectedAccountId("");
        setPaymentAmount("");
    }

    function handlePayment() {
        if (
            !paymentInstallment ||
            !selectedAccountId
        ) {
            return;
        }

        const amount = Number(paymentAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return;
        }

        const installmentRemaining = Math.max(
            Number(paymentInstallment.amount) -
            Number(paymentInstallment.paidAmount),
            0,
        );

        if (amount > installmentRemaining) {
            return;
        }

        onPay(
            paymentInstallment,
            selectedAccountId,
            amount,
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Conta a pagar
                        </p>

                        <h2 className="mt-1 text-xl font-semibold text-slate-900">
                            {payable.description}
                        </h2>

                        {payable.notes && (
                            <p className="mt-1 text-sm text-slate-500">
                                {payable.notes}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 gap-3 border-b border-slate-200 bg-slate-50 px-6 py-5 sm:grid-cols-3">
                    <div>
                        <p className="text-xs text-slate-500">
                            Total
                        </p>

                        <p className="mt-1 text-lg font-semibold text-slate-900">
                            {formatCurrency(
                                Number(payable.totalAmount),
                            )}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">
                            Pago
                        </p>

                        <p className="mt-1 text-lg font-semibold text-emerald-600">
                            {formatCurrency(totalPaid)}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">
                            Restante
                        </p>

                        <p className="mt-1 text-lg font-semibold text-slate-900">
                            {formatCurrency(remaining)}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto px-6 py-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-slate-900">
                                Parcelas
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Acompanhe vencimentos e pagamentos.
                            </p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 2 }).map(
                                (_, index) => (
                                    <div
                                        key={index}
                                        className="h-24 animate-pulse rounded-xl bg-slate-100"
                                    />
                                ),
                            )}
                        </div>
                    ) : installments.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                            <p className="text-sm text-slate-500">
                                Nenhuma parcela encontrada.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {installments.map(
                                (installment) => {
                                    const installmentRemaining =
                                        Math.max(
                                            Number(installment.amount) -
                                            Number(
                                                installment.paidAmount,
                                            ),
                                            0,
                                        );

                                    const canPay =
                                        installmentRemaining > 0 &&
                                        installment.status !==
                                        "cancelled";

                                    return (
                                        <div
                                            key={installment.id}
                                            className="rounded-xl border border-slate-200 p-4"
                                        >
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-medium text-slate-900">
                                                            {installment.installmentNumber}ª parcela
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

                                                    <div className="mt-2 grid gap-1 text-sm text-slate-500 sm:grid-cols-3 sm:gap-4">
                                                        <span>
                                                            Vencimento:{" "}
                                                            <strong className="font-medium text-slate-700">
                                                                {formatDate(
                                                                    installment.dueDate,
                                                                )}
                                                            </strong>
                                                        </span>

                                                        <span>
                                                            Valor:{" "}
                                                            <strong className="font-medium text-slate-700">
                                                                {formatCurrency(
                                                                    Number(
                                                                        installment.amount,
                                                                    ),
                                                                )}
                                                            </strong>
                                                        </span>

                                                        <span>
                                                            Pago:{" "}
                                                            <strong className="font-medium text-slate-700">
                                                                {formatCurrency(
                                                                    Number(
                                                                        installment.paidAmount,
                                                                    ),
                                                                )}
                                                            </strong>
                                                        </span>
                                                    </div>
                                                </div>

                                                {canPay && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openPayment(
                                                                installment,
                                                            )
                                                        }
                                                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                                                    >
                                                        <Wallet size={16} />
                                                        Pagar
                                                    </button>
                                                )}

                                                {installment.status ===
                                                    "paid" && (
                                                        <div className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-emerald-600">
                                                            <CheckCircle2
                                                                size={18}
                                                            />
                                                            Quitado
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    )}
                </div>

                {/* Payment form */}
                {paymentInstallment &&
                    installments.some(
                        (installment) =>
                            installment.id === paymentInstallment.id &&
                            Number(installment.amount) -
                            Number(installment.paidAmount) >
                            0 &&
                            installment.status !== "cancelled",
                    ) && (
                        <div className="border-t border-slate-200 bg-slate-50 px-6 py-5">
                            <div className="mb-4">
                                <h3 className="font-semibold text-slate-900">
                                    Registrar pagamento
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Informe a conta financeira e o valor
                                    pago.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Conta financeira
                                    </label>

                                    <div className="relative">
                                        <CreditCard
                                            size={17}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <select
                                            value={selectedAccountId}
                                            onChange={(event) =>
                                                setSelectedAccountId(
                                                    event.target.value,
                                                )
                                            }
                                            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="">
                                                Selecione uma conta
                                            </option>

                                            {accounts
                                                .filter(
                                                    (account) =>
                                                        account.isActive,
                                                )
                                                .map((account) => (
                                                    <option
                                                        key={account.id}
                                                        value={account.id}
                                                    >
                                                        {account.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Valor do pagamento
                                    </label>

                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={paymentAmount}
                                        onChange={(event) =>
                                            setPaymentAmount(
                                                event.target.value,
                                            )
                                        }
                                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closePayment}
                                    disabled={isPaying}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    onClick={handlePayment}
                                    disabled={
                                        isPaying ||
                                        !selectedAccountId ||
                                        !paymentAmount
                                    }
                                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isPaying
                                        ? "Processando..."
                                        : "Confirmar pagamento"}
                                </button>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}