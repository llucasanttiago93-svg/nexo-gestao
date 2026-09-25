import { supabase } from "@/lib/supabase";

import type {
  GetOrdersParams,
  Order,
  OrderCreateData,
  OrderCreateItem,
  OrderDetails,
  OrdersResult,
} from "@/features/orders/orders.types";

import type {
  OrderStatus,
  PaymentStatus,
} from "./orders.types";



async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error(
      "Você precisa estar autenticado para acessar os pedidos.",
    );
  }

  return user.id;
}

function mapOrder(row: any): Order {
  const customer = Array.isArray(row.customers)
    ? row.customers[0]
    : row.customers;

  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: customer?.name ?? "Cliente não informado",
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

export async function getOrders(
  params: GetOrdersParams = {},
): Promise<OrdersResult> {
  const userId = await getCurrentUserId();

  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.max(params.pageSize ?? 10, 1);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("orders")
    .select(
      `
        id,
        order_number,
        customer_id,
        status,
        payment_status,
        payment_method,
        subtotal,
        discount,
        shipping,
        total,
        notes,
        created_at,
        customers (
          name
        )
      `,
      {
        count: "exact",
      },
    )
    .eq("user_id", userId);

  if (params.search?.trim()) {
    const search = params.search.trim();

    const isNumber = /^\d+$/.test(search);

    if (isNumber) {
      query = query.eq(
        "order_number",
        Number(search),
      );
    }
  }

  if (
    params.status &&
    params.status !== "all"
  ) {
    query = query.eq(
      "status",
      params.status,
    );
  }

  if (
    params.paymentStatus &&
    params.paymentStatus !== "all"
  ) {
    query = query.eq(
      "payment_status",
      params.paymentStatus,
    );
  }

  const {
    data,
    error,
    count,
  } = await query
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  if (error) {
    throw new Error(
      `Não foi possível carregar os pedidos: ${error.message}`,
    );
  }

  const total = count ?? 0;

  return {
    orders: (data ?? []).map(mapOrder),
    total,
    page,
    pageSize,
    totalPages: Math.max(
      Math.ceil(total / pageSize),
      1,
    ),
  };
}

export async function getOrder(
  orderId: string,
): Promise<Order> {
  const userId = await getCurrentUserId();

  const {
    data,
    error,
  } = await supabase
    .from("orders")
    .select(
      `
        id,
        order_number,
        customer_id,
        status,
        payment_status,
        payment_method,
        subtotal,
        discount,
        shipping,
        total,
        notes,
        created_at,
        customers (
          name
        )
      `,
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(
      `Não foi possível carregar o pedido: ${error.message}`,
    );
  }

  return mapOrder(data);
}

export async function getOrderDetails(
  orderId: string,
): Promise<OrderDetails> {
  const userId = await getCurrentUserId();

  const {
    data: orderData,
    error: orderError,
  } = await supabase
    .from("orders")
    .select(
      `
        id,
        order_number,
        customer_id,
        status,
        payment_status,
        payment_method,
        subtotal,
        discount,
        shipping,
        total,
        notes,
        created_at,
        customers (
          name
        )
      `,
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .single();

  if (orderError) {
    throw new Error(
      `Não foi possível carregar o pedido: ${orderError.message}`,
    );
  }

  const {
    data: itemsData,
    error: itemsError,
  } = await supabase
    .from("order_items")
    .select(
      `
        id,
        order_id,
        product_id,
        product_name,
        sku,
        quantity,
        unit_price,
        total_price,
        created_at
      `,
    )
    .eq("order_id", orderId)
    .order("created_at", {
      ascending: true,
    });

  if (itemsError) {
    throw new Error(
      `Não foi possível carregar os itens do pedido: ${itemsError.message}`,
    );
  }

  const order = mapOrder(orderData);

  return {
    ...order,
    items: (itemsData ?? []).map((item) => ({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      productName: item.product_name,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      totalPrice: Number(item.total_price),
      createdAt: item.created_at,
    })),
  };
}

export async function getOrderCreateData(): Promise<OrderCreateData> {
  const userId = await getCurrentUserId();

  const [
    { data: customers, error: customersError },
    { data: products, error: productsError },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select(
        `
          id,
          name,
          email,
          phone
        `,
      )
      .eq("user_id", userId)
      .order("name", {
        ascending: true,
      }),

    supabase
      .from("products")
      .select(
        `
          id,
          name,
          sku,
          price,
          stock
        `,
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .order("name", {
        ascending: true,
      }),
  ]);

  if (customersError) {
    throw new Error(
      `Não foi possível carregar os clientes: ${customersError.message}`,
    );
  }

  if (productsError) {
    throw new Error(
      `Não foi possível carregar os produtos: ${productsError.message}`,
    );
  }

  return {
    customers: (customers ?? []).map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    })),

    products: (products ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: Number(product.price),
      stock: product.stock,
    })),
  };
}

export async function createOrder(params: {
  customerId: string;
  items: OrderCreateItem[];
  discount: number;
  shipping: number;
  paymentMethod: string | null;
  notes: string;
}): Promise<string> {
  const userId = await getCurrentUserId();

  void userId;

  const {
    data,
    error,
  } = await supabase.rpc(
    "create_order_with_items",
    {
      p_customer_id: params.customerId,
      p_items: params.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      p_discount: params.discount,
      p_shipping: params.shipping,
      p_payment_method: params.paymentMethod,
      p_notes: params.notes,
    },
  );

  if (error) {
    throw new Error(
      `Não foi possível criar o pedido: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      "O pedido foi processado, mas o ID não foi retornado.",
    );
  }

  return data as string;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(
      `Não foi possível atualizar o status do pedido: ${error.message}`,
    );
  }
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(
      `Não foi possível atualizar o pagamento do pedido: ${error.message}`,
    );
  }
}