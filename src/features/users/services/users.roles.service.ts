import { supabase } from "@/lib/supabase";

import type { UserRole, UserRoleSlug } from "../users.types";

interface RoleRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_system: boolean;
}

function mapRole(row: RoleRow): UserRole {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug as UserRoleSlug,
    description: row.description,
    isSystem: row.is_system,
  };
}

export async function getAvailableUserRoles(): Promise<UserRole[]> {
  const { data, error } = await supabase
    .from("roles")
    .select(`
      id,
      name,
      slug,
      description,
      is_system
    `)
    .neq("slug", "owner")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRole);
}