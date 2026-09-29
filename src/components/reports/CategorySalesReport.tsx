import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CategorySalesReport as CategorySalesReportType } from "@/features/reports/reports.types";
import { useSettings } from "@/features/settings/SettingsContext";

interface CategorySalesReportProps {
  data: CategorySalesReportType[];
  isLoading?: boolean;
}

export function CategorySalesReport({
  data,
  isLoading = false,
}: CategorySalesReportProps) {
  const { formatCurrency } = useSettings();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">
          Vendas por categoria
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Distribuição do faturamento por categoria.
        </p>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-slate-100" />
      ) : data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
          Nenhuma categoria encontrada.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={data.slice(0, 8)}
              layout="vertical"
              margin={{
                top: 0,
                right: 12,
                left: 20,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
              />

              <XAxis
                type="number"
                tickFormatter={(value) =>
                  formatCurrency(Number(value))
                }
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />

              <YAxis
                type="category"
                dataKey="categoryName"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={100}
              />

              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Faturamento",
                ]}
              />

              <Bar
                dataKey="revenue"
                fill="currentColor"
                className="text-blue-600"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}