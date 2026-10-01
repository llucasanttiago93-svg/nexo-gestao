import { useQuery } from "@tanstack/react-query";

import {
  getCurrentOrganization,
  getCurrentOrganizationId,
  getCurrentOrganizationMember,
} from "./services/organization.service";

export const organizationQueryKeys = {
  all: ["organization"] as const,

  current: () =>
    [...organizationQueryKeys.all, "current"] as const,

  currentId: () =>
    [...organizationQueryKeys.all, "current-id"] as const,

  currentMember: () =>
    [...organizationQueryKeys.all, "current-member"] as const,
};

export function useCurrentOrganizationQuery() {
  return useQuery({
    queryKey: organizationQueryKeys.current(),
    queryFn: getCurrentOrganization,
  });
}

export function useCurrentOrganizationIdQuery() {
  return useQuery({
    queryKey: organizationQueryKeys.currentId(),
    queryFn: getCurrentOrganizationId,
  });
}

export function useCurrentOrganizationMemberQuery() {
  return useQuery({
    queryKey: organizationQueryKeys.currentMember(),
    queryFn: getCurrentOrganizationMember,
  });
}