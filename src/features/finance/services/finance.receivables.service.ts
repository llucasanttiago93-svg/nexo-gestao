import { supabase } from "@/lib/supabase";

import { getCurrentUserId } from "../finance.auth";

import {
  mapAccountReceivable,
  mapReceivableInstallment,
} from "../finance.mappers";

import type {
  AccountReceivable,
  CreateReceivableFromOrderInput,
  PayInstallmentInput,
  ReceivableInstallment,
} from "../finance.types";

const DEFAULT_PAGE_SIZE = 10;

export async function getAccountsReceivable(params: {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const userId = await getCurrentUserId();

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("accounts_receivable")
    .select(
      `
    *,
    customers (
      name
    ),
    accounts_receivable_installments (
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
    .order("created_at", { ascending: false });

  if (params.search?.trim()) {
    query = query.ilike(
      "description",
      `%${params.search.trim()}%`,
    );
  }

  if (params.status) {
    query = query.eq("status", params.status);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw error;
  }

  const total = count ?? 0;

  return {
    receivables: (data ?? []).map(mapAccountReceivable),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAccountReceivable(
  receivableId: string,
): Promise<AccountReceivable> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("accounts_receivable")
    .select("*")
    .eq("id", receivableId)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw error;
  }

  return mapAccountReceivable(data);
}

export async function getReceivableInstallments(
  receivableId: string,
): Promise<ReceivableInstallment[]> {
  const { data, error } = await supabase
    .from("accounts_receivable_installments")
    .select("*")
    .eq("receivable_id", receivableId)
    .order("installment_number", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapReceivableInstallment);
}

export async function createReceivableFromOrder(
  input: CreateReceivableFromOrderInput,
): Promise<string> {
  const { data, error } = await supabase.rpc(
    "create_receivable_from_order",
    {
      p_order_id: input.orderId,
      p_due_date: input.dueDate ?? undefined,
      p_payment_method: input.paymentMethod ?? null,
    },
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function payReceivableInstallment(
  input: PayInstallmentInput,
) {
  const { data, error } = await supabase.rpc(
    "pay_receivable_installment",
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
// CONTAS A PAGAR
// =====================================================
