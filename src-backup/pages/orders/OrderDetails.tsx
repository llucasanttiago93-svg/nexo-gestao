import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Package,
  User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  useOrderDetailsQuery,
  useUpdateOrderStatusMutation,
} from "@/features/orders/orders.queries";

import type {
  OrderStatus,
} from "@/features/orders/orders.types";

type StatusConfig = {
  label: string;
  className: string;
};

const statusConfig: Record<string, StatusConfig> = {
  pending: {
    label: "Pendente",
    className: "bg-slate-100 text-slate-700",
  },

  confirmed: {
    label: "Confirmado",
    className: "bg-blue-50 text-blue-700",
  },

  processing: {
    label: "Processando",
    className: "bg-amber-50 text-amber-700",
  },

  shipped: {
    label: "Enviado",
    className: "bg-indigo-50 text-indigo-700",
  },

  completed: {
    label: "Concluído",
    className: "bg-green-50 text-green-700",
  },

  cancelled: {
    label: "Cancelado",
    className: "bg-red-50 text-red-700",
  },
};

const paymentStatusConfig: Record<string, StatusConfig> = {
  pending: {
    label: "Pendente",
    className: "bg-slate-100 text-slate-700",
  },

  paid: {
    label: "Pago",
    className: "bg-green-50 text-green-700",
  },

  partially_paid: {
    label: "Parcialmente pago",
    className: "bg-amber-50 text-amber-700",
  },

  refunded: {
    label: "Reembolsado",
    className: "bg-red-50 text-red-700",
  },
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useOrderDetailsQuery(id);

  const updateStatusMutation =
    useUpdateOrderStatusMutation();

  function handleStatusChange(value: string) {
    if (!id) {
      return;
    }

    updateStatusMutation.mutate({
      orderId: id,
      status: value as OrderStatus,
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <div className="h-96 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6">
        <h2 className="text-base font-semibold text-red-800">
          Não foi possível carregar o pedido
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error instanceof Error
            ? error.message
            : "O pedido não foi encontrado."}
        </p>

        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="mt-5 inline-flex h-10 items-center rounded-lg bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90"
        >
          Voltar para pedidos
        </button>
      </div>
    );
  }

  const status =
    statusConfig[order.status] ?? {
      label: order.status,
      className: "bg-slate-100 text-slate-700",
    };

  const paymentStatus =
    paymentStatusConfig[order.paymentStatus] ?? {
      label: order.paymentStatus,
      className: "bg-slate-100 text-slate-700",
    };

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* CABEÇALHO */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
          >
            <ArrowLeft size={17} />
            Voltar para pedidos
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
              Pedido #{order.orderNumber}
            </h1>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Criado em {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="w-full sm:w-auto sm:min-w-[220px]">
          <label
            htmlFor="order-status"
            className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]"
          >
            Status do pedido
          </label>

          <select
            id="order-status"
            value={order.status}
            onChange={(event) =>
              handleStatusChange(event.target.value)
            }
            disabled={updateStatusMutation.isPending}
            className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm font-medium text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-[220px]"
          >
            <option value="pending">
              Pendente
            </option>

            <option value="confirmed">
              Confirmado
            </option>

            <option value="processing">
              Em processamento
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

          {updateStatusMutation.isPending && (
            <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
              Atualizando status...
            </p>
          )}

          {updateStatusMutation.isError && (
            <p className="mt-1.5 text-xs text-red-600">
              {updateStatusMutation.error instanceof Error
                ? updateStatusMutation.error.message
                : "Não foi possível atualizar o status."}
            </p>
          )}
        </div>
      </section>

      {/* CONTEÚDO */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">

        {/* COLUNA PRINCIPAL */}
        <div className="space-y-5">

          {/* PRODUTOS */}
          <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-[var(--color-border-light)] px-4 py-4 sm:px-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Package size={18} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Produtos
                </h2>

                <p className="text-xs text-[var(--color-text-muted)]">
                  {order.items.length}{" "}
                  {order.items.length === 1
                    ? "item"
                    : "itens"}{" "}
                  no pedido
                </p>
              </div>
            </div>

            {/* DESKTOP */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[650px]">
                <thead>
                  <tr className="border-b border-[var(--color-border-light)] bg-slate-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Produto
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Qtd.
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Unitário
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {order.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[var(--color-border-light)] last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {item.productName}
                        </p>

                        {item.sku && (
                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            SKU: {item.sku}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center text-sm text-[var(--color-text-secondary)]">
                        {item.quantity}
                      </td>

                      <td className="px-5 py-4 text-right text-sm text-[var(--color-text-secondary)]">
                        {formatCurrency(item.unitPrice)}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-semibold text-[var(--color-text-primary)]">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="divide-y divide-[var(--color-border-light)] md:hidden">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {item.productName}
                      </p>

                      {item.sku && (
                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                          SKU: {item.sku}
                        </p>
                      )}
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-[var(--color-text-primary)]">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                    <span>
                      {item.quantity} x{" "}
                      {formatCurrency(item.unitPrice)}
                    </span>

                    <span>
                      Total: {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* OBSERVAÇÕES */}
          {order.notes && (
            <section className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Observações
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                {order.notes}
              </p>
            </section>
          )}

          {/* RESUMO FINANCEIRO */}
          <section className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Resumo financeiro
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--color-text-secondary)]">
                  Subtotal
                </span>

                <span className="font-medium text-[var(--color-text-primary)]">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--color-text-secondary)]">
                  Desconto
                </span>

                <span className="font-medium text-green-600">
                  - {formatCurrency(order.discount)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--color-text-secondary)]">
                  Frete
                </span>

                <span className="font-medium text-[var(--color-text-primary)]">
                  {formatCurrency(order.shipping)}
                </span>
              </div>

              <div className="border-t border-[var(--color-border-light)] pt-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-base font-semibold text-[var(--color-text-primary)]">
                    Total
                  </span>

                  <span className="text-xl font-bold text-[var(--color-text-primary)]">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* COLUNA LATERAL */}
        <aside className="space-y-5">

          {/* CLIENTE */}
          <section className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <User size={18} />
              </div>

              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Cliente
              </h2>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {order.customerName}
              </p>

              {!order.customerId && (
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Cliente não vinculado
                </p>
              )}
            </div>
          </section>

          {/* PAGAMENTO */}
          <section className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <CreditCard size={18} />
              </div>

              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Pagamento
              </h2>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Status
                </p>

                <span
                  className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStatus.className}`}
                >
                  {paymentStatus.label}
                </span>

                <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                  O recebimento deve ser registrado em
                  Financeiro → Contas a receber para
                  atualizar o caixa e os lançamentos
                  financeiros.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/finance")}
                  className="mt-3 inline-flex h-9 items-center rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text-primary)] transition hover:bg-slate-50"
                >
                  Ir para Financeiro
                </button>
              </div>

              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Forma de pagamento
                </p>

                <p className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">
                  {order.paymentMethod || "Não informado"}
                </p>
              </div>
            </div>
          </section>

          {/* DATA */}
          <section className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <CalendarDays size={18} />
              </div>

              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Informações
              </h2>
            </div>

            <div className="mt-4">
              <p className="text-xs text-[var(--color-text-muted)]">
                Data do pedido
              </p>

              <p className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}