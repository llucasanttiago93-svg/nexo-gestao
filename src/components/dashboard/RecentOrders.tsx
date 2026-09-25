import { ArrowUpRight } from "lucide-react";

import type { DashboardOrder } from "@/features/dashboard/dashboard.types";

interface RecentOrdersProps {
  orders: DashboardOrder[];
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatStatus(status: string) {
  const statuses: Record<string, string> = {
    pending: "Pendente",
    processing: "Processando",
    shipped: "Enviado",
    delivered: "Entregue",
    cancelled: "Cancelado",
    paid: "Pago",
  };

  return statuses[status] ?? status;
}

function getStatusClass(status: string) {
  switch (status) {
    case "paid":
    case "delivered":
      return "bg-green-50 text-green-700";

    case "processing":
      return "bg-amber-50 text-amber-700";

    case "shipped":
      return "bg-blue-50 text-blue-700";

    case "cancelled":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function RecentOrders({
  orders,
}: RecentOrdersProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Pedidos recentes
          </h2>

          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Últimas vendas realizadas.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Ver todos
          <ArrowUpRight size={15} />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center px-5 text-center">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Nenhum pedido encontrado
            </p>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Os pedidos realizados aparecerão aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Pedido
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Cliente
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Data
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Valor
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[var(--color-border-light)] last:border-0"
                >
                  <td className="px-5 py-4 text-sm font-semibold text-[var(--color-text-primary)]">
                    #{order.orderNumber}
                  </td>

                  <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">
                    {order.customerName}
                  </td>

                  <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">
                    {new Date(
                      order.createdAt,
                    ).toLocaleDateString("pt-BR")}
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-[var(--color-text-primary)]">
                    {formatCurrency(order.total)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}