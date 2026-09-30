export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

export interface ReportFilters extends ReportPeriod {
  categoryId?: string;
  customerId?: string;
  paymentMethod?: string;
}

export interface ReportSummary {
  revenue: number;
  received: number;
  receivable: number;
  expenses: number;
  paidExpenses: number;
  payable: number;
  result: number;
}

export interface RevenueReportPoint {
  date: string;
  revenue: number;
  received: number;
  orders: number;
}

export interface CashFlowReportPoint {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export interface ProductSalesReport {
  productId: string;
  productName: string;
  sku: string | null;
  quantity: number;
  revenue: number;
  cost: number;
  grossProfit: number;
  margin: number;
}

export interface CustomerSalesReport {
  customerId: string;
  customerName: string;
  orders: number;
  revenue: number;
}

export interface CategorySalesReport {
  categoryId: string | null;
  categoryName: string;
  orders: number;
  revenue: number;
}

export interface PaymentMethodReport {
  paymentMethod: string;
  orders: number;
  revenue: number;
}

export interface DreReport {
  revenue: number;
  deductions: number;
  netRevenue: number;
  costOfGoods: number;
  grossProfit: number;
  operatingExpenses: number;
  netResult: number;
}