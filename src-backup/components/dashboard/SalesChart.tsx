import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardChartItem } from "@/features/dashboard/dashboard.types";

interface SalesChartProps {
  data: DashboardChartItem[];
}

export function SalesChart({
  data,
}: SalesChartProps) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
          Pedidos
        </h2>

        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Quantidade de pedidos nos últimos meses.
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />

            <Tooltip />

            <Bar
              dataKey="orders"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}