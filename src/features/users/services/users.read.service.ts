import { supabase } from "@/lib/supabase";

import type {
  OrganizationUser,
  UserRole,
  UserRoleSlug,
} from "../users.types";

interface RoleRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_system: boolean;
}

interface OrganizationMemberRow {
  user_id: string;
  organization_id: string;
  role_id: string;
  created_at: string;
  role: RoleRow | RoleRow[] | null;
}

function mapOrganizationUser(
  row: OrganizationMemberRow,
): OrganizationUser {
  const roleRow = Array.isArray(row.role)
    ? row.role[0]
    : row.role;

  if (!roleRow) {
    throw new Error(
      "O usuário não possui um papel válido.",
    );
  }

  const role: UserRole = {
    id: roleRow.id,
    name: roleRow.name,
    slug: roleRow.slug as UserRoleSlug,
    description: roleRow.description,
    isSystem: roleRow.is_system,
  };

  return {
    userId: row.user_id,
    organizationId: row.organization_id,
    roleId: row.role_id,
    role,
    createdAt: row.created_at,
  };
}

export async function getCurrentOrganizationUsers(
  organizationId: string,
): Promise<OrganizationUser[]> {
  const { data, error } = await supabase
    .from("organization_members")
    .select(
      `
        user_id,
        organization_id,
        role_id,
        created_at,
        role:roles (
          id,
          name,
          slug,
          description,
          is_system
        )
      `,
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    (row) =>
      mapOrganizationUser(
        row as unknown as OrganizationMemberRow,
      ),
  );
}