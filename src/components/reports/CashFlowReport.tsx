import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CashFlowReportPoint } from "@/features/reports/reports.types";

interface CashFlowReportProps {
  data: CashFlowReportPoint[];
  isLoading?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${value}T00:00:00`));
}

export function CashFlowReport({
  data,
  isLoading = false,
}: CashFlowReportProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">
          Fluxo de caixa
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Entradas e saídas efetivamente movimentadas.
        </p>
      </div>

      {isLoading ? (
        <div className="h-72 animate-pulse rounded-lg bg-slate-100" />
      ) : data.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-slate-500">
          Nenhuma movimentação encontrada no período.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 8,
                right: 8,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />

              <YAxis
                tickFormatter={(value) =>
                  formatCurrency(value)
                }
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={80}
              />

              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value)),
                  name === "income"
                    ? "Entradas"
                    : "Saídas",
                ]}
                labelFormatter={(label) =>
                  formatDate(String(label))
                }
              />

              <Bar
                dataKey="income"
                fill="currentColor"
                className="text-emerald-500"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="expense"
                fill="currentColor"
                className="text-red-500"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}