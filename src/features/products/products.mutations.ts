import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/features/products/services/products.service";

import type { ProductFormData } from "@/features/products/products.schema";

import { productsQueryKeys } from "@/features/products/products.queries";

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: ProductFormData) => {
      return createProduct(product);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: productsQueryKeys.all,
      });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      product,
    }: {
      productId: string;
      product: ProductFormData;
    }) => {
      return updateProduct(productId, product);
    },

    onSuccess: async (_updatedProduct, variables) => {
      await queryClient.invalidateQueries({
        queryKey: productsQueryKeys.all,
      });

      await queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(variables.productId),
      });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => {
      return deleteProduct(productId);
    },

    onSuccess: async (_data, productId) => {
      await queryClient.invalidateQueries({
        queryKey: productsQueryKeys.all,
      });

      await queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId),
      });
    },
  });
}