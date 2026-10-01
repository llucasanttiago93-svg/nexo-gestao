import { supabase } from "@/lib/supabase";

export async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error(
      "Você precisa estar autenticado para acessar os pedidos.",
    );
  }

  return user.id;
}
