
import type { SupabaseClient } from "npm:@supabase/supabase-js@^2";

interface CreateInvitationParams {
  supabaseAdmin: SupabaseClient;
  organizationId: string;
  invitedBy: string;
  name: string;
  email: string;
  roleId: string;
}

interface ServiceResult {
  success: boolean;
  error?: string;
}

export async function createOrganizationInvitation({
  supabaseAdmin,
  organizationId,
  invitedBy,
  name,
  email,
  roleId,
}: CreateInvitationParams): Promise<ServiceResult> {
  const { data: role, error: roleError } = await supabaseAdmin
    .from("roles")
    .select("id, slug")
    .eq("id", roleId)
    .maybeSingle();

  if (roleError || !role) {
    return {
      success: false,
      error: "O papel selecionado não foi encontrado.",
    };
  }

  if (role.slug === "owner") {
    return {
      success: false,
      error: "Não é permitido convidar usuários como proprietário.",
    };
  }

  const { data: existingInvitation, error: invitationQueryError } =
    await supabaseAdmin
      .from("organization_invitations")
      .select("id, status, expires_at")
      .eq("organization_id", organizationId)
      .ilike("email", email)
      .eq("status", "pending")
      .maybeSingle();

  if (invitationQueryError) {
    console.error(
      "Erro ao consultar convites existentes:",
      invitationQueryError,
    );

    return {
      success: false,
      error: "Não foi possível verificar convites existentes.",
    };
  }

  if (
    existingInvitation &&
    new Date(existingInvitation.expires_at).getTime() > Date.now()
  ) {
    return {
      success: false,
      error: "Já existe um convite pendente para esse e-mail.",
    };
  }

  if (existingInvitation) {
    const { error: expireError } = await supabaseAdmin
      .from("organization_invitations")
      .update({
        status: "expired",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingInvitation.id);

    if (expireError) {
      console.error("Erro ao expirar convite:", expireError);

      return {
        success: false,
        error: "Não foi possível atualizar o convite anterior.",
      };
    }
  }

  const { data: invitation, error: createError } = await supabaseAdmin
    .from("organization_invitations")
    .insert({
      organization_id: organizationId,
      email,
      role_id: roleId,
      invited_by: invitedBy,
      status: "pending",
    })
    .select("id")
    .single();

  if (createError || !invitation) {
    console.error("Erro ao registrar convite:", createError);

    return {
      success: false,
      error: "Não foi possível registrar o convite.",
    };
  }

  const { error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: name,
        organization_invitation_id: invitation.id,
      },
    });

  if (inviteError) {
    console.error("Erro ao enviar convite:", inviteError);

    const { error: rollbackError } = await supabaseAdmin
      .from("organization_invitations")
      .delete()
      .eq("id", invitation.id);

    if (rollbackError) {
      console.error(
        "Erro ao remover convite após falha:",
        rollbackError,
      );
    }

    return {
      success: false,
      error: "Não foi possível enviar o convite por e-mail.",
    };
  }

  return { success: true };
}
