
import { supabase } from "@/lib/supabase";

export interface InviteOrganizationUserInput {
  name: string;
  email: string;
  roleId: string;
}

interface InviteOrganizationUserResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function inviteOrganizationUser(
  input: InviteOrganizationUserInput,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke<
    InviteOrganizationUserResponse
  >("invite-organization-user", {
    body: {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      roleId: input.roleId,
    },
  });

  if (error) {
    throw new Error(
      error.message || "Não foi possível enviar o convite.",
    );
  }

  if (!data?.success) {
    throw new Error(
      data?.error || "Não foi possível enviar o convite.",
    );
  }
}
