import { supabase } from "@/lib/supabase";

import { getCurrentUserId } from "@/features/organization/organization.auth";

import type { Category } from "@/features/categories/categories.types";

export async function getProductCategories(): Promise<Category[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, created_at")
    .eq("user_id", userId)
    .eq("type", "product")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(
      `Não foi possível carregar as categorias: ${error.message}`,
    );
  }

  return (data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    type: category.type,
    createdAt: category.created_at,
  }));
}