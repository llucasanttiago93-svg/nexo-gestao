import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateOrganizationMemberRole,
} from "./services/users.write.service";

import { usersQueryKeys } from "./users.queries";

interface UpdateUserRoleInput {
  organizationId: string;
  userId: string;
  roleId: string;
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      userId,
      roleId,
    }: UpdateUserRoleInput) =>
      updateOrganizationMemberRole(
        organizationId,
        userId,
        roleId,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.organization(
          variables.organizationId,
        ),
      });
    },
  });
}