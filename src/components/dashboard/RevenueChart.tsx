import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardChartItem } from "@/features/dashboard/dashboard.types";
import { useSettings } from "@/features/settings/SettingsContext";

interface RevenueChartProps {
  data: DashboardChartItem[];
}

export function RevenueChart({
  data,
}: RevenueChartProps) {
  const { formatCurrency, currency } = useSettings();

  const formatAxisValue = (value: number) => {
    const formatted = formatCurrency(value);

    if (value >= 1000) {
      const compactValue = value / 1000;

      const symbol =
        currency === "BRL"
          ? "R$"
          : currency === "USD"
            ? "US$"
            : "€";

      return `${symbol} ${compactValue.toLocaleString(
        "pt-BR",
        {
          maximumFractionDigits: 1,
        },
      )}k`;
    }

    return formatted;
  };

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
          Faturamento
        </h2>

        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Evolução do faturamento nos últimos meses.
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
              tickFormatter={(value) =>
                formatAxisValue(Number(value))
              }
            />

            <Tooltip
              formatter={(value) =>
                formatCurrency(Number(value))
              }
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}