import { useQuery } from "@tanstack/react-query";

import {
  getProduct,
  getProducts,
  type GetProductsParams,
} from "@/features/products/products.service";

export const productsQueryKeys = {
  all: ["products"] as const,

  list: (filters?: GetProductsParams) =>
    [...productsQueryKeys.all, "list", filters ?? {}] as const,

  detail: (id: string) =>
    [...productsQueryKeys.all, "detail", id] as const,
};

export function useProductsQuery(
  params: GetProductsParams = {},
) {
  return useQuery({
    queryKey: productsQueryKeys.list(params),
    queryFn: () => getProducts(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useProductQuery(id: string | undefined) {
  return useQuery({
    queryKey: productsQueryKeys.detail(id ?? ""),
    queryFn: () => getProduct(id as string),
    enabled: Boolean(id),
  });
}