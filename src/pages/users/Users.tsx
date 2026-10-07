import { useState } from "react";

import {
    useAvailableUserRoles,
    useOrganizationUsers,
} from "@/features/users/users.queries";
import { useUpdateUserRole } from "@/features/users/users.mutations";
import { UsersEmptyState } from "@/features/users/components/UsersEmptyState";
import { UsersTable } from "@/features/users/components/UsersTable";

import { useAuth } from "@/features/auth/AuthContext";
import { useCurrentOrganizationIdQuery } from "@/features/organization/organization.queries";

export function Users() {
    const { user } = useAuth();

    const organizationIdQuery =
        useCurrentOrganizationIdQuery();

    const organizationId = organizationIdQuery.data ?? null;

    const usersQuery = useOrganizationUsers(organizationId);
    const rolesQuery = useAvailableUserRoles();
    const updateRoleMutation = useUpdateUserRole();

    const [updatingUserId, setUpdatingUserId] = useState<string | null>(
        null,
    );

    function handleRoleChange(userId: string, roleId: string) {
        if (!organizationId) {
            return;
        }

        setUpdatingUserId(userId);

        updateRoleMutation.mutate(
            {
                organizationId,
                userId,
                roleId,
            },
            {
                onSettled: () => {
                    setUpdatingUserId(null);
                },
            },
        );
    }

    if (
        organizationIdQuery.isLoading ||
        usersQuery.isLoading ||
        rolesQuery.isLoading
    ) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-gray-500">
                    Carregando usuários...
                </p>
            </div>
        );
    }

    if (
        organizationIdQuery.isError ||
        usersQuery.isError ||
        rolesQuery.isError
    ) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h2 className="font-semibold text-red-800">
                    Não foi possível carregar os usuários
                </h2>

                <p className="mt-1 text-sm text-red-700">
                    Tente novamente. Se o problema continuar, verifique as
                    permissões da organização.
                </p>
            </div>
        );
    }

    const users = usersQuery.data ?? [];
    const roles = rolesQuery.data ?? [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    Usuários
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Gerencie os usuários e os perfis de acesso da organização.
                </p>
            </div>

            {users.length === 0 ? (
                <UsersEmptyState />
            ) : (
                <UsersTable
                    users={users}
                    roles={roles}
                    currentUserId={user?.id ?? null}
                    updatingUserId={updatingUserId}
                    onRoleChange={handleRoleChange}
                />
            )}
        </div>
    );
}