import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RevenueReportPoint } from "@/features/reports/reports.types";

import { useSettings } from "@/features/settings/SettingsContext";

interface RevenueReportProps {
  data: RevenueReportPoint[];
  isLoading?: boolean;
}

export function RevenueReport({
  data,
  isLoading = false,
}: RevenueReportProps) {
  const { formatCurrency, formatDate } = useSettings();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">
          Faturamento
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Evolução das vendas no período selecionado.
        </p>
      </div>

      {isLoading ? (
        <div className="h-72 animate-pulse rounded-lg bg-slate-100" />
      ) : data.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-slate-500">
          Nenhuma venda encontrada no período.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
                tickFormatter={(value) =>
                  formatDate(String(value))
                }
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />

              <YAxis
                tickFormatter={(value) =>
                  formatCurrency(Number(value))
                }
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={80}
              />

              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value)),
                  name === "revenue"
                    ? "Faturamento"
                    : "Recebido",
                ]}
                labelFormatter={(label) =>
                  formatDate(String(label))
                }
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="currentColor"
                className="text-blue-600"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="received"
                stroke="currentColor"
                className="text-emerald-500"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}