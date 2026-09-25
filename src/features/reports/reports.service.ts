import { supabase } from "@/lib/supabase";

import type {
  CategorySalesReport,
  CashFlowReportPoint,
  CustomerSalesReport,
  DreReport,
  PaymentMethodReport,
  ReportFilters,
  ReportPeriod,
  ReportSummary,
  RevenueReportPoint,
  ProductSalesReport,
} from "./reports.types";

interface OrderRow {
  id: string;
  customer_id: string | null;
  payment_method: string | null;
  total: number | string;
  discount: number | string;
  shipping: number | string;
  created_at: string;
  status: string;
  payment_status: string;
}

interface OrderItemRow {
  order_id: string;
  product_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number | string;
  total_price: number | string;
}

interface CustomerRow {
  id: string;
  name: string;
}

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(filters: ReportFilters) {
  const start = filters.startDate;
  const end = filters.endDate;

  return {
    start,
    end,
  };
}

async function getOrders(filters: ReportFilters) {
  let query = supabase
    .from("orders")
    .select(
      `
        id,
        customer_id,
        payment_method,
        total,
        discount,
        shipping,
        created_at,
        status,
        payment_status
      `,
    )
    .gte("created_at", `${filters.startDate}T00:00:00`)
    .lte("created_at", `${filters.endDate}T23:59:59`)
    .neq("status", "cancelled")
    .order("created_at", { ascending: true });

  if (filters.customerId) {
    query = query.eq("customer_id", filters.customerId);
  }

  if (filters.paymentMethod) {
    query = query.eq("payment_method", filters.paymentMethod);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as OrderRow[];
}

async function getOrderItems(orderIds: string[]) {
  if (orderIds.length === 0) {
    return [] as OrderItemRow[];
  }

  const { data, error } = await supabase
    .from("order_items")
    .select(
      `
        order_id,
        product_id,
        product_name,
        sku,
        quantity,
        unit_price,
        total_price
      `,
    )
    .in("order_id", orderIds);

  if (error) {
    throw error;
  }

  return (data ?? []) as OrderItemRow[];
}

async function getCustomers(customerIds: string[]) {
  if (customerIds.length === 0) {
    return [] as CustomerRow[];
  }

  const { data, error } = await supabase
    .from("customers")
    .select("id, name")
    .in("id", customerIds);

  if (error) {
    throw error;
  }

  return (data ?? []) as CustomerRow[];
}

export async function getReportSummary(
  filters: ReportFilters,
): Promise<ReportSummary> {
  const orders = await getOrders(filters);

  const revenue = orders.reduce(
    (total, order) => total + toNumber(order.total),
    0,
  );

  const received = orders
    .filter((order) => order.payment_status === "paid")
    .reduce(
      (total, order) => total + toNumber(order.total),
      0,
    );

  const receivable = orders
    .filter(
      (order) =>
        order.payment_status !== "paid" &&
        order.payment_status !== "refunded",
    )
    .reduce(
      (total, order) => total + toNumber(order.total),
      0,
    );

  const { data: payableData, error: payableError } =
    await supabase
      .from("accounts_payable")
      .select("total_amount, status")
      .gte("created_at", `${filters.startDate}T00:00:00`)
      .lte("created_at", `${filters.endDate}T23:59:59`);

  if (payableError) {
    throw payableError;
  }

  const payables = payableData ?? [];

  const expenses = payables.reduce(
    (total, item) => total + toNumber(item.total_amount),
    0,
  );

  const paidExpenses = payables
    .filter((item) => item.status === "paid")
    .reduce(
      (total, item) => total + toNumber(item.total_amount),
      0,
    );

  const payable = payables
    .filter(
      (item) =>
        item.status !== "paid" &&
        item.status !== "cancelled",
    )
    .reduce(
      (total, item) => total + toNumber(item.total_amount),
      0,
    );

  return {
    revenue,
    received,
    receivable,
    expenses,
    paidExpenses,
    payable,
    result: received - paidExpenses,
  };
}

export async function getRevenueReport(
  filters: ReportFilters,
): Promise<RevenueReportPoint[]> {
  const orders = await getOrders(filters);

  const grouped = new Map<string, RevenueReportPoint>();

for (const order of orders) {
  const date = order.created_at.slice(0, 10);

  const total = toNumber(order.total);

  const received =
    order.payment_status === "paid"
      ? total
      : 0;

  const current = grouped.get(date) ?? {
    date,
    revenue: 0,
    received: 0,
    orders: 0,
  };

  current.revenue += total;
  current.received += received;
  current.orders += 1;

  grouped.set(date, current);
}

  return Array.from(grouped.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export async function getCashFlowReport(
  filters: ReportFilters,
): Promise<CashFlowReportPoint[]> {
  const { data, error } = await supabase
    .from("cash_movements")
    .select(
      `
        movement_date,
        type,
        amount
      `,
    )
    .gte("movement_date", filters.startDate)
    .lte("movement_date", filters.endDate)
    .eq("status", "completed")
    .order("movement_date", { ascending: true });

  if (error) {
    throw error;
  }

  const grouped = new Map<
    string,
    CashFlowReportPoint
  >();

  for (const movement of data ?? []) {
    const date = movement.movement_date;

    const current = grouped.get(date) ?? {
      date,
      income: 0,
      expense: 0,
      balance: 0,
    };

    const amount = toNumber(movement.amount);

    if (movement.type === "income") {
      current.income += amount;
    } else {
      current.expense += amount;
    }

    grouped.set(date, current);
  }

  let balance = 0;

  return Array.from(grouped.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => {
      balance += item.income - item.expense;

      return {
        ...item,
        balance,
      };
    });
}

export async function getProductSalesReport(
  filters: ReportFilters,
): Promise<ProductSalesReport[]> {
  const orders = await getOrders(filters);

  if (orders.length === 0) {
    return [];
  }

  const items = await getOrderItems(
    orders.map((order) => order.id),
  );

  const grouped = new Map<string, ProductSalesReport>();

  for (const item of items) {
    const key = item.product_id ?? item.product_name;

    const current = grouped.get(key) ?? {
      productId: item.product_id ?? "",
      productName: item.product_name,
      sku: item.sku,
      quantity: 0,
      revenue: 0,
    };

    current.quantity += item.quantity;
    current.revenue += toNumber(item.total_price);

    grouped.set(key, current);
  }

  return Array.from(grouped.values()).sort(
    (a, b) => b.revenue - a.revenue,
  );
}

export async function getCustomerSalesReport(
  filters: ReportFilters,
): Promise<CustomerSalesReport[]> {
  const orders = await getOrders(filters);

  const customerIds = Array.from(
    new Set(
      orders
        .map((order) => order.customer_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const customers = await getCustomers(customerIds);

  const customerMap = new Map(
    customers.map((customer) => [
      customer.id,
      customer.name,
    ]),
  );

  const grouped = new Map<string, CustomerSalesReport>();

  for (const order of orders) {
    if (!order.customer_id) {
      continue;
    }

    const key = order.customer_id;

    const current = grouped.get(key) ?? {
      customerId: key,
      customerName:
        customerMap.get(key) ?? "Cliente não identificado",
      orders: 0,
      revenue: 0,
    };

    current.orders += 1;
    current.revenue += toNumber(order.total);

    grouped.set(key, current);
  }

  return Array.from(grouped.values()).sort(
    (a, b) => b.revenue - a.revenue,
  );
}

export async function getCategorySalesReport(
  filters: ReportFilters,
): Promise<CategorySalesReport[]> {
  const orders = await getOrders(filters);

  if (orders.length === 0) {
    return [];
  }

  const items = await getOrderItems(
    orders.map((order) => order.id),
  );

  const productIds = Array.from(
    new Set(
      items
        .map((item) => item.product_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  if (productIds.length === 0) {
    return [];
  }

  const { data: products, error } = await supabase
    .from("products")
    .select(
      `
        id,
        category_id,
        categories (
          id,
          name
        )
      `,
    )
    .in("id", productIds);

  if (error) {
    throw error;
  }

  const productMap = new Map(
    (products ?? []).map((product) => {
      const category = Array.isArray(product.categories)
        ? product.categories[0]
        : product.categories;

      return [
        product.id,
        {
          categoryId: product.category_id,
          categoryName:
            category?.name ?? "Sem categoria",
        },
      ];
    }),
  );

  const grouped = new Map<
    string,
    CategorySalesReport
  >();

  for (const item of items) {
    if (!item.product_id) {
      continue;
    }

    const product = productMap.get(item.product_id);

    const categoryId =
      product?.categoryId ?? null;

    const key = categoryId ?? "without-category";

    const current = grouped.get(key) ?? {
      categoryId,
      categoryName:
        product?.categoryName ?? "Sem categoria",
      orders: 0,
      revenue: 0,
    };

    current.revenue += toNumber(item.total_price);

    grouped.set(key, current);
  }

  const orderIdsByCategory = new Map<
    string,
    Set<string>
  >();

  for (const item of items) {
    if (!item.product_id) {
      continue;
    }

    const product = productMap.get(item.product_id);

    const key =
      product?.categoryId ?? "without-category";

    const orderSet =
      orderIdsByCategory.get(key) ??
      new Set<string>();

    orderSet.add(item.order_id);

    orderIdsByCategory.set(key, orderSet);
  }

  for (const [key, orderSet] of orderIdsByCategory) {
    const current = grouped.get(key);

    if (current) {
      current.orders = orderSet.size;
    }
  }

  return Array.from(grouped.values()).sort(
    (a, b) => b.revenue - a.revenue,
  );
}

export async function getPaymentMethodReport(
  filters: ReportFilters,
): Promise<PaymentMethodReport[]> {
  const orders = await getOrders(filters);

  const grouped = new Map<
    string,
    PaymentMethodReport
  >();

  for (const order of orders) {
    const key =
      order.payment_method?.trim() ||
      "Não informado";

    const current = grouped.get(key) ?? {
      paymentMethod: key,
      orders: 0,
      revenue: 0,
    };

    current.orders += 1;
    current.revenue += toNumber(order.total);

    grouped.set(key, current);
  }

  return Array.from(grouped.values()).sort(
    (a, b) => b.revenue - a.revenue,
  );
}

export async function getDreReport(
  filters: ReportFilters,
): Promise<DreReport> {
  const summary = await getReportSummary(filters);

  const orders = await getOrders(filters);

  const items = await getOrderItems(
    orders.map((order) => order.id),
  );

  let costOfGoods = 0;

  if (items.length > 0) {
    const productIds = Array.from(
      new Set(
        items
          .map((item) => item.product_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    if (productIds.length > 0) {
      const { data: products, error } = await supabase
        .from("products")
        .select("id, cost_price")
        .in("id", productIds);

      if (error) {
        throw error;
      }

      const costMap = new Map(
        (products ?? []).map((product) => [
          product.id,
          toNumber(product.cost_price),
        ]),
      );

      for (const item of items) {
        if (!item.product_id) {
          continue;
        }

        const cost =
          costMap.get(item.product_id) ?? 0;

        costOfGoods += cost * item.quantity;
      }
    }
  }

  const grossProfit =
    summary.revenue - costOfGoods;

  const operatingExpenses = summary.paidExpenses;

  const netResult =
    grossProfit - operatingExpenses;

  return {
    revenue: summary.revenue,
    deductions: 0,
    netRevenue: summary.revenue,
    costOfGoods,
    grossProfit,
    operatingExpenses,
    netResult,
  };
}

export async function getDefaultReportPeriod(): Promise<ReportPeriod> {
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

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

export { getDateRange };