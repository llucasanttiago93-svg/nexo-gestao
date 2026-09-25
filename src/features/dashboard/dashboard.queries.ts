import { useQuery } from "@tanstack/react-query";

import { getDashboardData } from "@/features/dashboard/dashboard.service";

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
};

export function useDashboardQuery() {
  return useQuery({
    queryKey: dashboardQueryKeys.all,
    queryFn: getDashboardData,
    staleTime: 30_000,
  });
}