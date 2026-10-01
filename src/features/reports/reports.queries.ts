import { useQuery } from "@tanstack/react-query";

import {
  getCashFlowReport,
  getCategorySalesReport,
  getCustomerSalesReport,
  getDefaultReportPeriod,
  getDreReport,
  getPaymentMethodReport,
  getProductSalesReport,
  getReportSummary,
  getRevenueReport,
} from "./services/reports.service";

import type { ReportFilters } from "./reports.types";

export const reportsKeys = {
  all: ["reports"] as const,

  summary: (filters: ReportFilters) =>
    [...reportsKeys.all, "summary", filters] as const,

  revenue: (filters: ReportFilters) =>
    [...reportsKeys.all, "revenue", filters] as const,

  cashFlow: (filters: ReportFilters) =>
    [...reportsKeys.all, "cash-flow", filters] as const,

  products: (filters: ReportFilters) =>
    [...reportsKeys.all, "products", filters] as const,

  customers: (filters: ReportFilters) =>
    [...reportsKeys.all, "customers", filters] as const,

  categories: (filters: ReportFilters) =>
    [...reportsKeys.all, "categories", filters] as const,

  paymentMethods: (filters: ReportFilters) =>
    [...reportsKeys.all, "payment-methods", filters] as const,

  dre: (filters: ReportFilters) =>
    [...reportsKeys.all, "dre", filters] as const,

  defaultPeriod: () =>
    [...reportsKeys.all, "default-period"] as const,
};

export function useReportSummaryQuery(
  filters: ReportFilters,
) {
  return useQuery({
    queryKey: reportsKeys.summary(filters),
    queryFn: () => getReportSummary(filters),
    enabled:
      Boolean(filters.startDate) &&
      Boolean(filters.endDate),
  });
}

export function useRevenueReportQuery(
  filters: ReportFilters,
) {
  return useQuery({
    queryKey: reportsKeys.revenue(filters),
    queryFn: () => getRevenueReport(filters),
    enabled:
      Boolean(filters.startDate) &&
      Boolean(filters.endDate),
  });
}

export function useCashFlowReportQuery(
  filters: ReportFilters,
) {
  return useQuery({
    queryKey: reportsKeys.cashFlow(filters),
    queryFn: () => getCashFlowReport(filters),
    enabled:
      Boolean(filters.startDate) &&
      Boolean(filters.endDate),
  });
}

export function useProductSalesReportQuery(
  filters: ReportFilters,
) {
  return useQuery({
    queryKey: reportsKeys.products(filters),
    queryFn: () => getProductSalesReport(filters),
    enabled:
      Boolean(filters.startDate) &&
      Boolean(filters.endDate),
  });
}

export function useCustomerSalesReportQuery(
  filters: ReportFilters,
) {
  return useQuery({
    queryKey: reportsKeys.customers(filters),
    queryFn: () => getCustomerSalesReport(filters),
    enabled:
      Boolean(filters.startDate) &&
      Boolean(filters.endDate),
  });
}

export function useCategorySalesReportQuery(
  filters: ReportFilters,
) {
  return useQuery({
    queryKey: reportsKeys.categories(filters),
    queryFn: () => getCategorySalesReport(filters),
    enabled:
      Boolean(filters.startDate) &&
      Boolean(filters.endDate),
  });
}

export function usePaymentMethodReportQuery(
  filters: ReportFilters,
) {
  return useQuery({
    queryKey: reportsKeys.paymentMethods(filters),
    queryFn: () => getPaymentMethodReport(filters),
    enabled:
      Boolean(filters.startDate) &&
      Boolean(filters.endDate),
  });
}

export function useDreReportQuery(
  filters: ReportFilters,
) {
  return useQuery({
    queryKey: reportsKeys.dre(filters),
    queryFn: () => getDreReport(filters),
    enabled:
      Boolean(filters.startDate) &&
      Boolean(filters.endDate),
  });
}

export function useDefaultReportPeriodQuery() {
  return useQuery({
    queryKey: reportsKeys.defaultPeriod(),
    queryFn: getDefaultReportPeriod,
    staleTime: Infinity,
  });
}