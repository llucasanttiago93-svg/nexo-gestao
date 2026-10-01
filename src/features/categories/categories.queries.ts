import { useQuery } from "@tanstack/react-query";

import { getProductCategories } from "@/features/categories/services/categories.service";

export const categoriesQueryKeys = {
  all: ["categories"] as const,

  products: () =>
    [...categoriesQueryKeys.all, "products"] as const,
};

export function useProductCategoriesQuery() {
  return useQuery({
    queryKey: categoriesQueryKeys.products(),
    queryFn: getProductCategories,
  });
}