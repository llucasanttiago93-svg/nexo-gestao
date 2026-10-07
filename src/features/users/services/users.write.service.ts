import { supabase } from "@/lib/supabase";

export async function updateOrganizationMemberRole(
  organizationId: string,
  userId: string,
  roleId: string,
): Promise<void> {
  const { error } = await supabase
    .from("organization_members")
    .update({
      role_id: roleId,
    })
    .eq("organization_id", organizationId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}