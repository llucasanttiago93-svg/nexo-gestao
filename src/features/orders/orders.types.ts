export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "partially_paid"
  | "refunded";

export interface Order {
  id: string;
  organizationId: string;
  orderNumber: number;
  customerId: string | null;
  customerName: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  notes: string | null;
  createdAt: string;
}

export interface OrdersResult {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetOrdersParams {
  search?: string;
  status?: OrderStatus | "all";
  paymentStatus?: PaymentStatus | "all";
  page?: number;
  pageSize?: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

export interface OrderDetails extends Order {
  items: OrderItem[];
}

export interface OrderCreateCustomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface OrderCreateProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export interface OrderCreateItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderCreateData {
  customers: OrderCreateCustomer[];
  products: OrderCreateProduct[];
}