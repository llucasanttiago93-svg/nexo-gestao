import { useQuery } from "@tanstack/react-query";

import { getCurrentOrganizationUsers } from "./services/users.read.service";
import { getAvailableUserRoles } from "./services/users.roles.service";

export const usersQueryKeys = {
  all: ["users"] as const,

  organization: (organizationId: string) =>
    ["users", "organization", organizationId] as const,
};

export const userRolesQueryKeys = {
  all: ["user-roles"] as const,
};

export function useOrganizationUsers(organizationId: string | null) {
  return useQuery({
    queryKey: organizationId
      ? usersQueryKeys.organization(organizationId)
      : usersQueryKeys.all,

    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organização não identificada.");
      }

      return getCurrentOrganizationUsers(organizationId);
    },

    enabled: Boolean(organizationId),
  });
}

export function useAvailableUserRoles() {
  return useQuery({
    queryKey: userRolesQueryKeys.all,
    queryFn: getAvailableUserRoles,
  });
}