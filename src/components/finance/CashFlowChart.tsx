import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useSettings } from "@/features/settings/SettingsContext";

interface CashFlowData {
  date: string;
  income: number;
  expense: number;
}

interface CashFlowChartProps {
  data: CashFlowData[];
  isLoading?: boolean;
}

export function CashFlowChart({
  data,
  isLoading = false,
}: CashFlowChartProps) {
  const {
    formatCurrency,
    formatDate,
  } = useSettings();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-6">
          <div className="h-5 w-40 animate-pulse rounded bg-gray-100" />

          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="h-72 animate-pulse rounded-lg bg-gray-50" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900">
          Fluxo de caixa
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Acompanhe a evolução das entradas e saídas.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-lg bg-gray-50 px-6 text-center">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Nenhuma movimentação encontrada
            </p>

            <p className="mt-1 text-sm text-gray-500">
              As movimentações financeiras aparecerão aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data}
              margin={{
                top: 8,
                right: 8,
                left: 8,
                bottom: 8,
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
                tickMargin={10}
              />

              <YAxis
                tickFormatter={(value) =>
                  formatCurrency(Number(value))
                }
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={72}
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
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid #e5e7eb",
                  boxShadow:
                    "0 10px 25px rgba(0, 0, 0, 0.08)",
                }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                formatter={(value) =>
                  value === "income"
                    ? "Entradas"
                    : "Saídas"
                }
              />

              <Line
                type="monotone"
                dataKey="income"
                stroke="#059669"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />

              <Line
                type="monotone"
                dataKey="expense"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}