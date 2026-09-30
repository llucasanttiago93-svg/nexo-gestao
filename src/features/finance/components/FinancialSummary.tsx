import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Clock3,
} from "lucide-react";

import type {
  FinanceSummary as FinanceSummaryData,
} from "@/features/finance/finance.types";

interface FinancialSummaryProps {
  summary: FinanceSummaryData | undefined;
  isLoading?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function FinancialSummary({
  summary,
  isLoading = false,
}: FinancialSummaryProps) {
  const cards = [
    {
      label: "Entradas realizadas",
      value: summary?.totalIncome ?? 0,
      icon: ArrowUpRight,
      iconWrapper: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Saídas realizadas",
      value: summary?.totalExpense ?? 0,
      icon: ArrowDownRight,
      iconWrapper: "bg-red-50 text-red-600",
    },
    {
      label: "Saldo realizado",
      value: summary?.balance ?? 0,
      icon: CircleDollarSign,
      iconWrapper: "bg-blue-50 text-blue-600",
    },
    {
      label: "A receber",
      value: summary?.totalReceivable ?? 0,
      icon: Clock3,
      iconWrapper: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">
                  {card.label}
                </p>

                {isLoading ? (
                  <div className="mt-2 h-8 w-32 animate-pulse rounded-md bg-gray-100" />
                ) : (
                  <p
                    className={`mt-2 truncate text-2xl font-semibold tracking-tight ${
                      card.value < 0
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {formatCurrency(card.value)}
                  </p>
                )}
              </div>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconWrapper}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}