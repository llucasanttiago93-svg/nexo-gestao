
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

import { validateInviteInput } from "./validation.ts";
import { createOrganizationInvitation } from "./invitation.service.ts";

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json(
        { error: "Método não permitido." },
        { status: 405 },
      );
    }

    try {
      const userId = ctx.userClaims?.id;

      if (!userId) {
        return Response.json(
          { error: "Usuário não autenticado." },
          { status: 401 },
        );
      }

      let body: unknown;

      try {
        body = await req.json();
      } catch {
        return Response.json(
          { error: "O corpo da solicitação não contém JSON válido." },
          { status: 400 },
        );
      }

      const validation = validateInviteInput(body);

      if (!validation.success || !validation.data) {
        return Response.json(
          { error: validation.error ?? "Dados inválidos." },
          { status: 400 },
        );
      }

      const { name, email, roleId } = validation.data;

      const { data: organizationId, error: organizationError } =
        await ctx.supabase.rpc("get_user_organization_id");

      if (organizationError || !organizationId) {
        console.error(
          "Erro ao identificar organização:",
          organizationError,
        );

        return Response.json(
          { error: "Não foi possível identificar sua organização." },
          { status: 403 },
        );
      }

      const { data: canInvite, error: permissionError } =
        await ctx.supabase.rpc("has_permission", {
          p_module: "users",
          p_action: "invite",
        });

      if (permissionError || canInvite !== true) {
        return Response.json(
          { error: "Você não tem permissão para convidar usuários." },
          { status: 403 },
        );
      }

      const result = await createOrganizationInvitation({
        supabaseAdmin: ctx.supabaseAdmin,
        organizationId,
        invitedBy: userId,
        name,
        email,
        roleId,
      });

      if (!result.success) {
        return Response.json(
          { error: result.error ?? "Não foi possível criar o convite." },
          { status: 400 },
        );
      }

      return Response.json(
        {
          success: true,
          message: "Convite enviado com sucesso.",
        },
        { status: 201 },
      );
    } catch (error) {
      console.error("Erro ao processar convite:", error);

      return Response.json(
        { error: "Erro interno ao processar o convite." },
        { status: 500 },
      );
    }
  }),
};
