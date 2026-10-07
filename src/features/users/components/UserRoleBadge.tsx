import { Badge } from "@/components/ui/Badge";

import type { UserRoleSlug } from "../users.types";

interface UserRoleBadgeProps {
  role: UserRoleSlug;
}

const roleLabels: Record<UserRoleSlug, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  sales: "Vendedor",
  finance: "Financeiro",
  inventory: "Estoquista",
};

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  return <Badge>{roleLabels[role]}</Badge>;
}