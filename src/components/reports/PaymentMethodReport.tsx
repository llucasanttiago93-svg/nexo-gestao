import {
  CreditCard,
  DollarSign,
  Landmark,
  Smartphone,
} from "lucide-react";

import type { PaymentMethodReport as PaymentMethodReportType } from "@/features/reports/reports.types";

interface PaymentMethodReportProps {
  data: PaymentMethodReportType[];
  isLoading?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getPaymentIcon(method: string) {
  const value = method.toLowerCase();

  if (value.includes("pix")) {
    return Smartphone;
  }

  if (
    value.includes("credit") ||
    value.includes("debit") ||
    value.includes("card")
  ) {
    return CreditCard;
  }

  if (
    value.includes("transfer") ||
    value.includes("bank")
  ) {
    return Landmark;
  }

  return DollarSign;
}

function formatPaymentMethod(method: string) {
  const labels: Record<string, string> = {
    pix: "Pix",
    credit_card: "Cartão de crédito",
    debit_card: "Cartão de débito",
    cash: "Dinheiro",
    bank_transfer: "Transferência",
    boleto: "Boleto",
  };

  return labels[method] ?? method;
}

export function PaymentMethodReport({
  data,
  isLoading = false,
}: PaymentMethodReportProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-900">
          Formas de pagamento
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Vendas distribuídas por forma de pagamento.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center px-5 text-sm text-slate-500">
          Nenhuma venda encontrada.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {data.map((payment) => {
            const Icon = getPaymentIcon(
              payment.paymentMethod,
            );

            return (
              <div
                key={payment.paymentMethod}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Icon
                    size={18}
                    className="text-slate-600"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {formatPaymentMethod(
                      payment.paymentMethod,
                    )}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {payment.orders} pedido
                    {payment.orders !== 1 ? "s" : ""}
                  </p>
                </div>

                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(payment.revenue)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}