import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { LowStockProducts } from "@/components/dashboard/LowStockProducts";

import {
  CircleDollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import { useDashboardQuery } from "@/features/dashboard/dashboard.queries";
import { useSettings } from "@/features/settings/SettingsContext";

function calculatePercentageChange(
  current: number,
  previous: number,
) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

function formatPercentage(value: number) {
  const rounded = Math.round(value * 10) / 10;

  return `${rounded >= 0 ? "+" : ""}${rounded.toLocaleString(
    "pt-BR",
  )}%`;
}

export function Dashboard() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useDashboardQuery();

  const { formatCurrency } = useSettings();

  if (isLoading) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <section>
          <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />

          <div className="mt-2 h-5 w-72 animate-pulse rounded bg-slate-100" />
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-xl border border-[var(--color-border)] bg-white"
            />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
          <div className="h-80 animate-pulse rounded-xl border border-[var(--color-border)] bg-white" />

          <div className="h-80 animate-pulse rounded-xl border border-[var(--color-border)] bg-white" />
        </section>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <section>
          <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-2xl">
            Visão geral
          </h1>

          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            Acompanhe os principais indicadores do seu negócio.
          </p>
        </section>

        <section className="rounded-xl border border-red-200 bg-red-50 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-red-700">
            Não foi possível carregar o Dashboard
          </h2>

          <p className="mt-1 text-sm leading-6 text-red-600">
            {error instanceof Error
              ? error.message
              : "Ocorreu um erro inesperado."}
          </p>
        </section>
      </div>
    );
  }

  const {
    revenue,
    orders,
    customers,
    averageTicket,
    previousRevenue,
    previousOrders,
    previousCustomers,
    previousAverageTicket,
  } = data.metrics;

  const revenueChange = calculatePercentageChange(
    revenue,
    previousRevenue,
  );

  const ordersChange = calculatePercentageChange(
    orders,
    previousOrders,
  );

  const customersChange = calculatePercentageChange(
    customers,
    previousCustomers,
  );

  const averageTicketChange = calculatePercentageChange(
    averageTicket,
    previousAverageTicket,
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <section>
        <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-2xl">
          Visão geral
        </h1>

        <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
          Acompanhe os principais indicadores do seu negócio.
        </p>
      </section>

      {/* Indicadores */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <MetricCard
          title="Faturamento"
          value={formatCurrency(revenue)}
          change={formatPercentage(revenueChange)}
          description="vs. mês anterior"
          icon={<CircleDollarSign size={20} />}
          positive={revenueChange >= 0}
        />

        <MetricCard
          title="Pedidos"
          value={orders.toLocaleString("pt-BR")}
          change={formatPercentage(ordersChange)}
          description="vs. mês anterior"
          icon={<ShoppingCart size={20} />}
          positive={ordersChange >= 0}
        />

        <MetricCard
          title="Clientes"
          value={customers.toLocaleString("pt-BR")}
          change={formatPercentage(customersChange)}
          description="novos no mês"
          icon={<Users size={20} />}
          positive={customersChange >= 0}
        />

        <MetricCard
          title="Ticket médio"
          value={formatCurrency(averageTicket)}
          change={formatPercentage(averageTicketChange)}
          description="vs. mês anterior"
          icon={<TrendingUp size={20} />}
          positive={averageTicketChange >= 0}
        />
      </section>

      {/* Gráficos */}
      <section className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
        <div className="min-w-0">
          <RevenueChart data={data.chart} />
        </div>

        <div className="min-w-0">
          <SalesChart data={data.chart} />
        </div>
      </section>

      {/* Tabelas */}
      <section className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <RecentOrders orders={data.recentOrders} />
        </div>

        <div className="min-w-0">
          <LowStockProducts
            products={data.lowStockProducts}
          />
        </div>
      </section>
    </div>
  );
}