import type { Order } from "@/features/orders/orders.types";

interface OrderTableProps {
  orders: Order[];
  onView: (orderId: string) => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatStatus(status: Order["status"]) {
  const labels: Record<
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

  return labels[status];
}

function getStatusClass(
  status: Order["status"],
) {
  const classes: Record<
    Order["status"],
    string
  > = {
    pending: "bg-slate-100 text-slate-700",
    confirmed: "bg-blue-50 text-blue-700",
    processing: "bg-amber-50 text-amber-700",
    shipped: "bg-indigo-50 text-indigo-700",
    completed: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return classes[status];
}

function formatPaymentStatus(
  status: Order["paymentStatus"],
) {
  const labels: Record<
    Order["paymentStatus"],
    string
  > = {
    pending: "Pendente",
    paid: "Pago",
    partially_paid: "Parcial",
    refunded: "Reembolsado",
  };

  return labels[status];
}

export function OrderTable({
  orders,
  onView,
}: OrderTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
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
              Pedido
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Pagamento
            </th>

            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Ação
            </th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-[var(--color-border-light)] last:border-0 hover:bg-slate-50/70"
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

              <td className="px-5 py-4 text-sm font-semibold text-[var(--color-text-primary)]">
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

              <td className="px-5 py-4">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {formatPaymentStatus(
                    order.paymentStatus,
                  )}
                </span>
              </td>

              <td className="px-5 py-4 text-right">
                <button
                  type="button"
                  onClick={() => onView(order.id)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Visualizar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}