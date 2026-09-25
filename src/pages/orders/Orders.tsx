import {
    Plus,
    Search,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { OrderFilters } from "@/components/orders/OrderFilters";
import { OrderMobileList } from "@/components/orders/OrderMobileList";
import { OrderTable } from "@/components/orders/OrderTable";
import { Pagination } from "@/components/ui/Pagination";

import { useDebounce } from "@/hooks/useDebounce";

import { useOrdersQuery } from "@/features/orders/orders.queries";

import type {
    OrderStatus,
    PaymentStatus,
} from "@/features/orders/orders.types";

export function Orders() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [status, setStatus] =
        useState<OrderStatus | "all">("all");
    const [paymentStatus, setPaymentStatus] =
        useState<PaymentStatus | "all">("all");
    const [page, setPage] = useState(1);

    const debouncedSearch = useDebounce(
        search,
        200,
    );

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
    } = useOrdersQuery({
        search: debouncedSearch,
        status,
        paymentStatus,
        page,
        pageSize: 10,
    });

    function handleSearch(
        value: string,
    ) {
        setSearch(value);
        setPage(1);
    }

    function handleStatusChange(
        value: OrderStatus | "all",
    ) {
        setStatus(value);
        setPage(1);
    }

    function handlePaymentStatusChange(
        value: PaymentStatus | "all",
    ) {
        setPaymentStatus(value);
        setPage(1);
    }

    if (isLoading) {
        return (
            <div className="space-y-5 sm:space-y-6">
                <div>
                    <div className="h-7 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="mt-2 h-5 w-64 animate-pulse rounded bg-slate-100" />
                </div>

                <div className="h-24 animate-pulse rounded-xl bg-white" />

                <div className="h-96 animate-pulse rounded-xl bg-white" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <section className="rounded-xl border border-red-200 bg-red-50 p-5">
                <h2 className="text-sm font-semibold text-red-700">
                    Não foi possível carregar os pedidos
                </h2>

                <p className="mt-1 text-sm text-red-600">
                    {error instanceof Error
                        ? error.message
                        : "Ocorreu um erro inesperado."}
                </p>
            </section>
        );
    }

    return (
        <div className="space-y-5 sm:space-y-6">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-2xl">
                        Pedidos
                    </h1>

                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                        Gerencie os pedidos e acompanhe suas vendas.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/orders/new")}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    <Plus size={17} />
                    Novo pedido
                </button>
            </section>

            <section className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)]">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-md">
                        <Search
                            size={18}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                        />

                        <input
                            value={search}
                            onChange={(event) =>
                                handleSearch(event.target.value)
                            }
                            placeholder="Buscar por número do pedido..."
                            className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white pl-10 pr-3 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <OrderFilters
                        status={status}
                        paymentStatus={paymentStatus}
                        onStatusChange={handleStatusChange}
                        onPaymentStatusChange={
                            handlePaymentStatusChange
                        }
                    />
                </div>

                {isFetching && (
                    <div className="mt-3 text-xs text-[var(--color-text-muted)]">
                        Atualizando...
                    </div>
                )}
            </section>

            <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
                {data.orders.length === 0 ? (
                    <div className="flex min-h-72 items-center justify-center px-5 text-center">
                        <div>
                            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                                Nenhum pedido encontrado
                            </h2>

                            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                Tente alterar os filtros ou criar um novo pedido.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="hidden md:block">
                            <OrderTable
                                orders={data.orders}
                                onView={(id) =>
                                    navigate(`/orders/${id}`)
                                }
                            />
                        </div>

                        <OrderMobileList
                            orders={data.orders}
                            onView={(id) =>
                                navigate(`/orders/${id}`)
                            }
                        />
                    </>
                )}

                {data.orders.length > 0 && (
                    <Pagination
                        page={data.page}
                        totalPages={data.totalPages}
                        totalItems={data.total}
                        pageSize={data.pageSize}
                        isFetching={isFetching}
                        onPageChange={setPage}
                    />
                )}
            </section>
        </div>
    );
}