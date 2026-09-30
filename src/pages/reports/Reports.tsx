import {
    BarChart3,
    CalendarDays,
    CircleDollarSign,
    CreditCard,
    Download,
    Package,
    TrendingDown,
    TrendingUp,
    Users,
    Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useSettings } from "@/features/settings/SettingsContext";

import { CashFlowReport } from "@/features/reports/components/CashFlowReport";
import { CategorySalesReport } from "@/features/reports/components/CategorySalesReport";
import { CustomerSalesReport } from "@/features/reports/components/CustomerSalesReport";
import { PaymentMethodReport } from "@/features/reports/components/PaymentMethodReport";
import { ProductSalesReport } from "@/features/reports/components/ProductSalesReport";
import { ReportFilters } from "@/features/reports/components/ReportFilters";
import { ReportMetricCard } from "@/features/reports/components/ReportMetricCard";
import { RevenueReport } from "@/features/reports/components/RevenueReport";

import {
    useCashFlowReportQuery,
    useCategorySalesReportQuery,
    useCustomerSalesReportQuery,
    useDefaultReportPeriodQuery,
    useDreReportQuery,
    usePaymentMethodReportQuery,
    useProductSalesReportQuery,
    useReportSummaryQuery,
    useRevenueReportQuery,
} from "@/features/reports/reports.queries";

import type { ReportFilters as ReportFiltersType } from "@/features/reports/reports.types";

function getCurrentMonthPeriod(): ReportFiltersType {
    const today = new Date();

    const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
    );

    const end = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
    );

    const formatDate = (date: Date) =>
        date.toISOString().slice(0, 10);

    return {
        startDate: formatDate(start),
        endDate: formatDate(end),
        customerId: "",
        categoryId: "",
        paymentMethod: "",
    };
}

export default function Reports() {
    const { formatCurrency } = useSettings();

    const defaultPeriodQuery =
        useDefaultReportPeriodQuery();

    const [filters, setFilters] =
        useState<ReportFiltersType>(
            getCurrentMonthPeriod(),
        );

    const effectiveFilters = useMemo<ReportFiltersType>(
        () => ({
            ...filters,
            startDate:
                filters.startDate ||
                defaultPeriodQuery.data?.startDate ||
                "",
            endDate:
                filters.endDate ||
                defaultPeriodQuery.data?.endDate ||
                "",
        }),
        [filters, defaultPeriodQuery.data],
    );

    const summaryQuery =
        useReportSummaryQuery(effectiveFilters);

    const revenueQuery =
        useRevenueReportQuery(effectiveFilters);

    const cashFlowQuery =
        useCashFlowReportQuery(effectiveFilters);

    const productsQuery =
        useProductSalesReportQuery(effectiveFilters);

    const customersQuery =
        useCustomerSalesReportQuery(effectiveFilters);

    const categoriesQuery =
        useCategorySalesReportQuery(effectiveFilters);

    const paymentMethodsQuery =
        usePaymentMethodReportQuery(effectiveFilters);

    const dreQuery =
        useDreReportQuery(effectiveFilters);

    const summary = summaryQuery.data;

    const revenue = summary?.revenue ?? 0;
    const received = summary?.received ?? 0;
    const receivable = summary?.receivable ?? 0;
    const expenses = summary?.expenses ?? 0;
    const paidExpenses = summary?.paidExpenses ?? 0;
    const payable = summary?.payable ?? 0;
    const result = summary?.result ?? 0;

    const totalOrders =
        revenueQuery.data?.reduce(
            (total, item) => total + (item.orders ?? 0),
            0,
        ) ?? 0;

    function handleFiltersChange(
        nextFilters: ReportFiltersType,
    ) {
        setFilters(nextFilters);
    }

    function resetFilters() {
        setFilters(getCurrentMonthPeriod());
    }

    return (
        <div className="min-h-full bg-slate-50">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <BarChart3 size={16} />

                            <span>Relatórios</span>
                        </div>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                            Relatórios
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Analise o desempenho financeiro e comercial
                            do seu negócio.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            <CalendarDays size={16} />

                            Período atual
                        </button>

                        <button
                            type="button"
                            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            <Download size={16} />

                            Exportar
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <ReportFilters
                        filters={effectiveFilters}
                        onChange={handleFiltersChange}
                    />
                </div>

                {/* Main summary */}
                <section className="mb-6">
                    <div className="mb-4">
                        <h2 className="text-base font-semibold text-slate-900">
                            Visão geral
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Principais indicadores do período.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <ReportMetricCard
                            title="Faturamento"
                            value={formatCurrency(revenue)}
                            icon={CircleDollarSign}
                            description="Total vendido no período"
                            variant="default"
                        />

                        <ReportMetricCard
                            title="Recebido"
                            value={formatCurrency(received)}
                            icon={TrendingUp}
                            description="Vendas já recebidas"
                            variant="positive"
                        />

                        <ReportMetricCard
                            title="A receber"
                            value={formatCurrency(receivable)}
                            icon={Wallet}
                            description="Valores pendentes"
                            variant="default"
                        />

                        <ReportMetricCard
                            title="Despesas"
                            value={formatCurrency(expenses)}
                            icon={TrendingDown}
                            description="Despesas registradas"
                            variant="negative"
                        />
                    </div>
                </section>

                {/* Financial result */}
                <section className="mb-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <ReportMetricCard
                            title="Despesas pagas"
                            value={formatCurrency(paidExpenses)}
                            icon={CreditCard}
                            description="Saídas efetivadas"
                            variant="negative"
                        />

                        <ReportMetricCard
                            title="A pagar"
                            value={formatCurrency(payable)}
                            icon={Wallet}
                            description="Compromissos pendentes"
                            variant="default"
                        />

                        <ReportMetricCard
                            title="Resultado"
                            value={formatCurrency(result)}
                            icon={
                                result >= 0
                                    ? TrendingUp
                                    : TrendingDown
                            }
                            description="Recebimentos menos pagamentos"
                            variant={
                                result >= 0
                                    ? "positive"
                                    : "negative"
                            }
                        />

                        <ReportMetricCard
                            title="Pedidos analisados"
                            value={String(totalOrders)}
                            icon={BarChart3}
                            description="Pedidos no período"
                            variant="default"
                        />
                    </div>
                </section>

                {/* Main charts */}
                <section className="mb-6 grid gap-6 xl:grid-cols-2">
                    <RevenueReport
                        data={revenueQuery.data ?? []}
                        isLoading={revenueQuery.isLoading}
                    />

                    <CashFlowReport
                        data={cashFlowQuery.data ?? []}
                        isLoading={cashFlowQuery.isLoading}
                    />
                </section>

                {/* Commercial analysis */}
                <section className="mb-6">
                    <div className="mb-4">
                        <h2 className="text-base font-semibold text-slate-900">
                            Análise comercial
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Entenda quais produtos, clientes e categorias
                            geram mais vendas.
                        </p>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                        <ProductSalesReport
                            data={productsQuery.data ?? []}
                            isLoading={productsQuery.isLoading}
                        />

                        <CustomerSalesReport
                            data={customersQuery.data ?? []}
                            isLoading={customersQuery.isLoading}
                        />
                    </div>
                </section>

                {/* Category + payment */}
                <section className="mb-6 grid gap-6 xl:grid-cols-2">
                    <CategorySalesReport
                        data={categoriesQuery.data ?? []}
                        isLoading={categoriesQuery.isLoading}
                    />

                    <PaymentMethodReport
                        data={paymentMethodsQuery.data ?? []}
                        isLoading={paymentMethodsQuery.isLoading}
                    />
                </section>

                {/* DRE */}
                <section className="mb-6">
                    <div className="rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-200 p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                    <BarChart3
                                        size={19}
                                        className="text-slate-600"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">
                                        DRE simplificada
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Visão resumida da formação do resultado.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {dreQuery.isLoading ? (
                            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
                                {Array.from({ length: 4 }).map(
                                    (_, index) => (
                                        <div
                                            key={index}
                                            className="h-24 animate-pulse rounded-lg bg-slate-100"
                                        />
                                    ),
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-lg bg-slate-50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Receita bruta
                                    </p>

                                    <p className="mt-2 text-lg font-bold text-slate-900">
                                        {formatCurrency(
                                            dreQuery.data?.revenue ?? 0,
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-slate-50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Receita líquida
                                    </p>

                                    <p className="mt-2 text-lg font-bold text-slate-900">
                                        {formatCurrency(
                                            dreQuery.data?.netRevenue ?? 0,
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-slate-50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Lucro bruto
                                    </p>

                                    <p className="mt-2 text-lg font-bold text-slate-900">
                                        {formatCurrency(
                                            dreQuery.data?.grossProfit ?? 0,
                                        )}
                                    </p>
                                </div>

                                <div
                                    className={`rounded-lg p-4 ${(dreQuery.data?.netResult ?? 0) >= 0
                                            ? "bg-emerald-50"
                                            : "bg-red-50"
                                        }`}
                                >
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Resultado líquido
                                    </p>

                                    <p
                                        className={`mt-2 text-lg font-bold ${(dreQuery.data?.netResult ?? 0) >= 0
                                                ? "text-emerald-700"
                                                : "text-red-700"
                                            }`}
                                    >
                                        {formatCurrency(
                                            dreQuery.data?.netResult ?? 0,
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-4 border-t border-slate-200 p-5 sm:grid-cols-2">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-slate-500">
                                    Custo dos produtos
                                </span>

                                <span className="text-sm font-semibold text-slate-900">
                                    {formatCurrency(
                                        dreQuery.data?.costOfGoods ?? 0,
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-slate-500">
                                    Despesas operacionais
                                </span>

                                <span className="text-sm font-semibold text-slate-900">
                                    {formatCurrency(
                                        dreQuery.data?.operatingExpenses ?? 0,
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer information */}
                <div className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={14} />

                        <span>
                            Relatórios calculados com base nos dados
                            registrados no Nexo Gestão.
                        </span>
                    </div>

                    <span>
                        Período: {effectiveFilters.startDate} até{" "}
                        {effectiveFilters.endDate}
                    </span>
                </div>
            </div>
        </div>
    );
}