import type {
  OrderStatus,
  PaymentStatus,
} from "@/features/orders/orders.types";

interface OrderFiltersProps {
  status: OrderStatus | "all";
  paymentStatus: PaymentStatus | "all";
  onStatusChange: (
    value: OrderStatus | "all",
  ) => void;
  onPaymentStatusChange: (
    value: PaymentStatus | "all",
  ) => void;
}

export function OrderFilters({
  status,
  paymentStatus,
  onStatusChange,
  onPaymentStatusChange,
}: OrderFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <select
        value={status}
        onChange={(event) =>
          onStatusChange(
            event.target.value as OrderStatus | "all",
          )
        }
        className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        <option value="all">
          Todos os status
        </option>

        <option value="pending">
          Pendente
        </option>

        <option value="confirmed">
          Confirmado
        </option>

        <option value="processing">
          Processando
        </option>

        <option value="shipped">
          Enviado
        </option>

        <option value="completed">
          Concluído
        </option>

        <option value="cancelled">
          Cancelado
        </option>
      </select>

      <select
        value={paymentStatus}
        onChange={(event) =>
          onPaymentStatusChange(
            event.target.value as PaymentStatus | "all",
          )
        }
        className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        <option value="all">
          Todos os pagamentos
        </option>

        <option value="pending">
          Pendente
        </option>

        <option value="paid">
          Pago
        </option>

        <option value="partially_paid">
          Parcialmente pago
        </option>

        <option value="refunded">
          Reembolsado
        </option>
      </select>
    </div>
  );
}