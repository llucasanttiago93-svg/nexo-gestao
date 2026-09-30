import { supabase } from "@/lib/supabase";

import { getCurrentUserId } from "../finance.auth";

import { mapCashMovement } from "../finance.mappers";

import type {
  CashFlowPoint,
  CashMovement,
  FinanceSummary,
} from "../finance.types";

const DEFAULT_PAGE_SIZE = 10;

export async function getCashMovements(params: {
  type?: "income" | "expense";
  accountId?: string;
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
    .from("cash_movements")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("movement_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.type) {
    query = query.eq("type", params.type);
  }

  if (params.accountId) {
    query = query.eq(
      "financial_account_id",
      params.accountId,
    );
  }

  if (params.startDate) {
    query = query.gte(
      "movement_date",
      params.startDate,
    );
  }

  if (params.endDate) {
    query = query.lte(
      "movement_date",
      params.endDate,
    );
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw error;
  }

  const total = count ?? 0;

  return {
    movements: (data ?? []).map(mapCashMovement),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}


// =====================================================
// RESUMO FINANCEIRO
// =====================================================

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const userId = await getCurrentUserId();

  const [
    cashResult,
    receivableInstallmentsResult,
    payableInstallmentsResult,
  ] = await Promise.all([
    supabase
      .from("cash_movements")
      .select("type, amount, transfer_id")
      .eq("user_id", userId)
      .eq("status", "completed"),

    supabase
      .from("accounts_receivable_installments")
      .select("amount, paid_amount, status, due_date, accounts_receivable!inner(user_id)")
      .eq("accounts_receivable.user_id", userId),

    supabase
      .from("accounts_payable_installments")
      .select("amount, paid_amount, status, due_date, accounts_payable!inner(user_id)")
      .eq("accounts_payable.user_id", userId),
  ]);

  if (cashResult.error) {
    throw cashResult.error;
  }

  if (receivableInstallmentsResult.error) {
    throw receivableInstallmentsResult.error;
  }

  if (payableInstallmentsResult.error) {
    throw payableInstallmentsResult.error;
  }

  let totalIncome = 0;
  let totalExpense = 0;

  for (const movement of cashResult.data ?? []) {
    // Transferências entre contas próprias não representam
    // receita nem despesa consolidada. Elas apenas mudam o
    // dinheiro de uma conta financeira para outra.
    if (movement.transfer_id) {
      continue;
    }

    const amount = Number(movement.amount);

    if (movement.type === "income") {
      totalIncome += amount;
    }

    if (movement.type === "expense") {
      totalExpense += amount;
    }
  }

  let totalReceivable = 0;
  let overdueReceivable = 0;

  for (const installment of receivableInstallmentsResult.data ?? []) {
    const amount = Number(installment.amount);
    const paidAmount = Number(installment.paid_amount);
    const outstanding = Math.max(amount - paidAmount, 0);

    if (
      ["open", "partially_paid", "overdue"].includes(
        installment.status,
      )
    ) {
      totalReceivable += outstanding;
    }

    if (installment.status === "overdue") {
      overdueReceivable += outstanding;
    }
  }

  let totalPayable = 0;
  let overduePayable = 0;

  for (const installment of payableInstallmentsResult.data ?? []) {
    const amount = Number(installment.amount);
    const paidAmount = Number(installment.paid_amount);
    const outstanding = Math.max(amount - paidAmount, 0);

    if (
      ["open", "partially_paid", "overdue"].includes(
        installment.status,
      )
    ) {
      totalPayable += outstanding;
    }

    if (installment.status === "overdue") {
      overduePayable += outstanding;
    }
  }

  const balance = totalIncome - totalExpense;

  const { data: accounts, error: accountsError } =
    await supabase
      .from("finance_accounts")
      .select("current_balance")
      .eq("user_id", userId)
      .eq("is_active", true);

  if (accountsError) {
    throw accountsError;
  }

  const accountBalance = (accounts ?? []).reduce(
    (total, account) =>
      total + Number(account.current_balance),
    0,
  );

  return {
    totalIncome,
    totalExpense,
    balance,
    totalReceivable,
    totalPayable,
    overdueReceivable,
    overduePayable,
    accountBalance,
  };
}


// =====================================================
// FLUXO DE CAIXA
// =====================================================

export async function getCashFlow(
  startDate: string,
  endDate: string,
): Promise<CashFlowPoint[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("cash_movements")
    .select("type, amount, movement_date, transfer_id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("movement_date", startDate)
    .lte("movement_date", endDate)
    .order("movement_date", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  const grouped = new Map<
    string,
    {
      income: number;
      expense: number;
    }
  >();

  for (const movement of data ?? []) {
    // Transferências internas não devem inflar
    // entradas/saídas no fluxo consolidado.
    if (movement.transfer_id) {
      continue;
    }

    const date = String(movement.movement_date);
    const month = date.slice(0, 7);

    const current = grouped.get(month) ?? {
      income: 0,
      expense: 0,
    };

    const amount = Number(movement.amount);

    if (movement.type === "income") {
      current.income += amount;
    }

    if (movement.type === "expense") {
      current.expense += amount;
    }

    grouped.set(month, current);
  }

  return Array.from(grouped.entries()).map(
    ([month, values]) => ({
      date: `${month}-01`,
      income: values.income,
      expense: values.expense,
      balance: values.income - values.expense,
    }),
  );
}

export interface TransferFinanceAccountInput {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  description?: string;
}
