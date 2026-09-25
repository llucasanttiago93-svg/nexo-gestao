import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import { queryClient } from "@/lib/queryClient";

import {
  createOrder,
  getOrder,
  getOrderCreateData,
  getOrderDetails,
  getOrders,
  updateOrderPaymentStatus,
  updateOrderStatus,
} from "@/features/orders/orders.service";

import type {
  GetOrdersParams,
  OrderStatus,
  PaymentStatus,
} from "@/features/orders/orders.types";

export const ordersQueryKeys = {
  all: ["orders"] as const,

  list: (filters?: GetOrdersParams) =>
    [
      ...ordersQueryKeys.all,
      "list",
      filters ?? {},
    ] as const,

  detail: (id: string) =>
    [
      ...ordersQueryKeys.all,
      "detail",
      id,
    ] as const,
};

export function useOrdersQuery(
  params: GetOrdersParams = {},
) {
  return useQuery({
    queryKey: ordersQueryKeys.list(params),
    queryFn: () => getOrders(params),
    placeholderData: (previousData) =>
      previousData,
  });
}

export function useOrderQuery(
  id: string | undefined,
) {
  return useQuery({
    queryKey: ordersQueryKeys.detail(
      id ?? "",
    ),
    queryFn: () => getOrder(id as string),
    enabled: Boolean(id),
  });
}

export function useOrderDetailsQuery(
  id: string | undefined,
) {
  return useQuery({
    queryKey: [
      ...ordersQueryKeys.all,
      "details",
      id ?? "",
    ],
    queryFn: () => getOrderDetails(id as string),
    enabled: Boolean(id),
  });
}

export function useOrderCreateDataQuery() {
  return useQuery({
    queryKey: [
      ...ordersQueryKeys.all,
      "create-data",
    ],
    queryFn: getOrderCreateData,
    staleTime: 60_000,
  });
}

export function useCreateOrderMutation() {
  return useMutation({
    mutationFn: createOrder,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.all,
      });

      await queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}

export function useUpdateOrderStatusMutation() {
  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => updateOrderStatus(orderId, status),

    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(variables.orderId),
      });

      void queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}

export function useUpdateOrderPaymentStatusMutation() {
  return useMutation({
    mutationFn: ({
      orderId,
      paymentStatus,
    }: {
      orderId: string;
      paymentStatus: PaymentStatus;
    }) => updateOrderPaymentStatus(orderId, paymentStatus),

    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(variables.orderId),
      });

      void queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}