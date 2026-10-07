import type { Order } from "./orders.types";

export function mapOrder(row: any): Order {
  const customer = Array.isArray(row.customers)
    ? row.customers[0]
    : row.customers;

  return {
    id: row.id,
    organizationId: row.organization_id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName:
      customer?.name ??
      "Cliente não informado",
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    shipping: Number(row.shipping),
    total: Number(row.total),
    notes: row.notes,
    createdAt: row.created_at,
  };
}