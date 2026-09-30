import { supabase } from "@/lib/supabase";

import { getCurrentUserId } from "../finance.auth";

import { mapFinanceAccount } from "../finance.mappers";

import type {
  FinanceAccount,
} from "../finance.types";

export async function getFinanceAccounts(): Promise<
  FinanceAccount[]
> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("finance_accounts")
    .select("*")
    .eq("user_id", userId)
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapFinanceAccount);
}

export async function getFinanceAccount(
  accountId: string,
): Promise<FinanceAccount> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("finance_accounts")
    .select("*")
    .eq("id", accountId)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw error;
  }

  return mapFinanceAccount(data);
}

export async function createFinanceAccount(input: {
  name: string;
  type:
  | "cash"
  | "bank"
  | "digital_account"
  | "credit_card";
  bankName?: string | null;
  accountNumber?: string | null;
  initialBalance?: number;
}): Promise<FinanceAccount> {
  const userId = await getCurrentUserId();

  const initialBalance = input.initialBalance ?? 0;

  const { data, error } = await supabase
    .from("finance_accounts")
    .insert({
      user_id: userId,
      name: input.name.trim(),
      type: input.type,
      bank_name: input.bankName || null,
      account_number: input.accountNumber || null,
      initial_balance: initialBalance,
      current_balance: initialBalance,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapFinanceAccount(data);
}

export async function updateFinanceAccount(
  accountId: string,
  input: {
    name: string;
    type:
    | "cash"
    | "bank"
    | "digital_account"
    | "credit_card";
    bankName?: string | null;
    accountNumber?: string | null;
    isActive?: boolean;
  },
): Promise<FinanceAccount> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("finance_accounts")
    .update({
      name: input.name.trim(),
      type: input.type,
      bank_name: input.bankName || null,
      account_number: input.accountNumber || null,
      is_active: input.isActive ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapFinanceAccount(data);
}

export async function getOrCreateDefaultFinanceAccount(): Promise<string> {
  const { data, error } = await supabase.rpc(
    "get_or_create_default_finance_account",
  );

  if (error) {
    throw error;
  }

  return data;
}


// =====================================================
// CATEGORIAS
// =====================================================
