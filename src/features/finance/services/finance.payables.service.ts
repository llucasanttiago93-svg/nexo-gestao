import { supabase } from "@/lib/supabase";

import { getCurrentUserId } from "../finance.auth";

import {
  mapAccountPayable,
  mapPayableInstallment,
} from "../finance.mappers";

import type {
  AccountPayable,
  CreatePayableInput,
  PayableInstallment,
  PayInstallmentInput,
} from "../finance.types";

const DEFAULT_PAGE_SIZE = 10;

export async function getAccountsPayable(params: {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const userId = await getCurrentUserId();

  const page = params.page ?? 1;
  const pageSize =
    params.pageSize ?? DEFAULT_PAGE_SIZE;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("accounts_payable")
    .select(
      `
        *,
        accounts_payable_installments (
          due_date,
          amount,
          paid_amount,
          status,
          installment_number
        )
      `,
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (params.search?.trim()) {
    query = query.ilike(
      "description",
      `%${params.search.trim()}%`,
    );
  }

  if (params.status) {
    query = query.eq(
      "status",
      params.status,
    );
  }

  const { data, error, count } =
    await query.range(from, to);

  if (error) {
    throw error;
  }

  const total = count ?? 0;

  return {
    payables: (data ?? []).map(
      mapAccountPayable,
    ),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(
      total / pageSize,
    ),
  };
}

export async function getAccountPayable(
  payableId: string,
): Promise<AccountPayable> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("accounts_payable")
    .select("*")
    .eq("id", payableId)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw error;
  }

  return mapAccountPayable(data);
}

export async function getPayableInstallments(
  payableId: string,
): Promise<PayableInstallment[]> {
  const { data, error } = await supabase
    .from("accounts_payable_installments")
    .select("*")
    .eq("payable_id", payableId)
    .order("installment_number", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapPayableInstallment);
}

export async function createPayable(
  input: CreatePayableInput,
): Promise<string> {
  const { data, error } = await supabase.rpc(
    "create_payable_with_installments",
    {
      p_description: input.description,
      p_amount: input.amount,
      p_due_date: input.dueDate,
      p_installments: input.installments,
      p_category_id: input.categoryId ?? null,
      p_notes: input.notes ?? null,
    },
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function payPayableInstallment(
  input: PayInstallmentInput,
) {
  const { data, error } = await supabase.rpc(
    "pay_payable_installment",
    {
      p_installment_id: input.installmentId,
      p_financial_account_id: input.financialAccountId,
      p_amount: input.amount,
    },
  );

  if (error) {
    throw error;
  }

  return data;
}


// =====================================================
// MOVIMENTAÇÕES DE CAIXA
// =====================================================
