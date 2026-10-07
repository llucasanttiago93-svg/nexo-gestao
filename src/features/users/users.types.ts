export type UserRoleSlug =
  | "owner"
  | "admin"
  | "sales"
  | "finance"
  | "inventory";

export interface UserRole {
  id: string;
  name: string;
  slug: UserRoleSlug;
  description: string | null;
  isSystem: boolean;
}

export interface OrganizationUser {
  userId: string;
  organizationId: string;
  roleId: string;
  role: UserRole;
  createdAt: string;
}

export interface UserPermission {
  id: string;
  module: string;
  action: string;
  name: string;
  description: string | null;
}

export interface UserPermissionKey {
  module: string;
  action: string;
}