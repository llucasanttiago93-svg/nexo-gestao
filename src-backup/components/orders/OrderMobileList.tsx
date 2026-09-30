import type { Order } from "@/features/orders/orders.types";

interface OrderMobileListProps {
  orders: Order[];
  onView: (orderId: string) => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const statusLabels: Record<
  Order["status"],
  string
> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  processing: "Processando",
  shipped: "Enviado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export function OrderMobileList({
  orders,
  onView,
}: OrderMobileListProps) {
  return (
    <div className="divide-y divide-[var(--color-border-light)] md:hidden">
      {orders.map((order) => (
        <button
          key={order.id}
          type="button"
          onClick={() => onView(order.id)}
          className="block w-full px-4 py-4 text-left transition hover:bg-slate-50"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                #{order.orderNumber}
              </p>

              <p className="mt-1 truncate text-sm text-[var(--color-text-secondary)]">
                {order.customerName}
              </p>
            </div>

            <p className="shrink-0 text-sm font-semibold text-[var(--color-text-primary)]">
              {formatCurrency(order.total)}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-muted)]">
              {new Date(
                order.createdAt,
              ).toLocaleDateString("pt-BR")}
            </span>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {statusLabels[order.status]}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}