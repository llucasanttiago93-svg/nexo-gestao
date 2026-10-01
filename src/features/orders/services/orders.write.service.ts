import { supabase } from "@/lib/supabase";

import { getCurrentUserId } from "../orders.auth";

import type {
  OrderCreateItem,
  OrderStatus,
  PaymentStatus,
} from "../orders.types";

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
