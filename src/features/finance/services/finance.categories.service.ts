import { supabase } from "@/lib/supabase";

import { getCurrentUserId } from "../finance.auth";

import { mapFinanceCategory } from "../finance.mappers";

import type {
  FinanceCategory,
} from "../finance.types";

export async function getFinanceCategories(): Promise<
  FinanceCategory[]
> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("finance_categories")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapFinanceCategory);
}

export async function createDefaultFinanceCategories(): Promise<number> {
  const { data, error } = await supabase.rpc(
    "create_default_finance_categories",
  );

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
}


// =====================================================
// CONTAS A RECEBER
// =====================================================
