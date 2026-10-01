import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import { queryClient } from "@/lib/queryClient";

import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  getCustomers,
  updateCustomer,
} from "@/features/customers/services/customers.service";

import type {
  CustomerInput,
  GetCustomersParams,
} from "@/features/customers/customers.types";

export const customersQueryKeys = {
  all: ["customers"] as const,

  list: (filters?: GetCustomersParams) =>
    [
      ...customersQueryKeys.all,
      "list",
      filters ?? {},
    ] as const,

  detail: (id: string) =>
    [
      ...customersQueryKeys.all,
      "detail",
      id,
    ] as const,
};

export function useCustomersQuery(
  params: GetCustomersParams = {},
) {
  return useQuery({
    queryKey: customersQueryKeys.list(params),
    queryFn: () => getCustomers(params),
    placeholderData: (previousData) =>
      previousData,
  });
}

export function useCustomerQuery(
  id: string | undefined,
) {
  return useQuery({
    queryKey: customersQueryKeys.detail(
      id ?? "",
    ),
    queryFn: () => getCustomer(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateCustomerMutation() {
  return useMutation({
    mutationFn: (input: CustomerInput) =>
      createCustomer(input),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: customersQueryKeys.all,
      });

      await queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}

export function useUpdateCustomerMutation() {
  return useMutation({
    mutationFn: ({
      customerId,
      input,
    }: {
      customerId: string;
      input: CustomerInput;
    }) =>
      updateCustomer(customerId, input),

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: customersQueryKeys.all,
      });

      await queryClient.invalidateQueries({
        queryKey:
          customersQueryKeys.detail(
            variables.customerId,
          ),
      });

      await queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}

export function useDeleteCustomerMutation() {
  return useMutation({
    mutationFn: (customerId: string) =>
      deleteCustomer(customerId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: customersQueryKeys.all,
      });

      await queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}