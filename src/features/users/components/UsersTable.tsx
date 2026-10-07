import { UserRoleBadge } from "./UserRoleBadge";
import { UserRoleSelect } from "./UserRoleSelect";

import type {
  OrganizationUser,
  UserRole,
} from "../users.types";

interface UsersTableProps {
  users: OrganizationUser[];
  roles: UserRole[];
  currentUserId: string | null;
  updatingUserId?: string | null;
  onRoleChange: (userId: string, roleId: string) => void;
}

export function UsersTable({
  users,
  roles,
  currentUserId,
  updatingUserId,
  onRoleChange,
}: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Usuário
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Perfil
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Alterar perfil
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Desde
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const isCurrentUser = user.userId === currentUserId;
              const isUpdating = updatingUserId === user.userId;

              return (
                <tr key={user.userId}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {isCurrentUser
                          ? "Você"
                          : user.userId}
                      </p>

                      <p className="text-xs text-gray-500">
                        ID: {user.userId}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <UserRoleBadge role={user.role.slug} />
                  </td>

                  <td className="w-56 px-6 py-4">
                    {user.role.slug === "owner" ? (
                      <span className="text-sm text-gray-500">
                        Proprietário
                      </span>
                    ) : (
                      <UserRoleSelect
                        roles={roles}
                        value={user.roleId}
                        disabled={isCurrentUser || isUpdating}
                        onChange={(roleId) =>
                          onRoleChange(user.userId, roleId)
                        }
                      />
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString(
                      "pt-BR",
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}