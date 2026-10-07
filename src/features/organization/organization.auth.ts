import { supabase } from "@/lib/supabase";

export async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  return user.id;
}

export async function getCurrentOrganizationId(): Promise<string> {
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", await getCurrentUserId())
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.organization_id) {
    throw new Error(
      "O usuário autenticado não possui vínculo com uma organização.",
    );
  }

  return data.organization_id;
}