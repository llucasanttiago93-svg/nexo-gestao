import { supabase } from "@/lib/supabase";

import type {
  AccountPayable,
  AccountReceivable,
  CashFlowPoint,
  CashMovement,
  CreatePayableInput,
  CreateReceivableFromOrderInput,
  FinanceAccount,
  FinanceCategory,
  FinanceSummary,
  PayableInstallment,
  PayInstallmentInput,
  ReceivableInstallment,
} from "./finance.types";

const DEFAULT_PAGE_SIZE = 10;


// =====================================================
// USUÁRIO
// =====================================================

async function getCurrentUserId(): Promise<string> {
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


// =====================================================
// MAPPERS
// =====================================================

function mapFinanceAccount(row: any): FinanceAccount {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    bankName: row.bank_name,
    accountNumber: row.account_number,
    initialBalance: Number(row.initial_balance),
    currentBalance: Number(row.current_balance),
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapFinanceCategory(row: any): FinanceCategory {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAccountReceivable(
  row: any,
): AccountReceivable {
  const installments = Array.isArray(
    row.accounts_receivable_installments,
  )
    ? row.accounts_receivable_installments
    : [];

  const pendingInstallments = installments
    .filter(
      (installment: any) =>
        ["open", "partially_paid", "overdue"].includes(
          installment.status,
        ) &&
        Number(installment.paid_amount) <
        Number(installment.amount),
    )
    .sort(
      (a: any, b: any) =>
        String(a.due_date).localeCompare(
          String(b.due_date),
        ),
    );

  const nextDueDate =
    pendingInstallments.length > 0
      ? pendingInstallments[0].due_date
      : installments.length > 0
        ? [...installments].sort(
          (a: any, b: any) =>
            String(b.due_date).localeCompare(
              String(a.due_date),
            ),
        )[0].due_date
        : null;

  return {
    id: row.id,
    userId: row.user_id,
    customerId: row.customer_id,
    orderId: row.order_id,
    description: row.description,
    categoryId: row.category_id,
    totalAmount: Number(row.total_amount),
    status: row.status,
    notes: row.notes,
    nextDueDate: nextDueDate,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapReceivableInstallment(
  row: any,
): ReceivableInstallment {
  return {
    id: row.id,
    receivableId: row.receivable_id,
    installmentNumber: row.installment_number,
    dueDate: row.due_date,
    amount: Number(row.amount),
    paidAmount: Number(row.paid_amount),
    status: row.status,
    paymentMethod: row.payment_method,
    paidAt: row.paid_at,
    financialAccountId: row.financial_account_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAccountPayable(row: any): AccountPayable {
  const installments = Array.isArray(
    row.accounts_payable_installments,
  )
    ? row.accounts_payable_installments
    : [];

  const pendingInstallments = installments
    .filter(
      (installment: any) =>
        ["open", "partially_paid", "overdue"].includes(
          installment.status,
        ) &&
        Number(installment.paid_amount) <
        Number(installment.amount),
    )
    .sort(
      (a: any, b: any) =>
        String(a.due_date).localeCompare(
          String(b.due_date),
        ),
    );

  const nextDueDate =
    pendingInstallments.length > 0
      ? pendingInstallments[0].due_date
      : installments.length > 0
        ? [...installments].sort(
          (a: any, b: any) =>
            String(b.due_date).localeCompare(
              String(a.due_date),
            ),
        )[0].due_date
        : null;

  return {
    id: row.id,
    userId: row.user_id,
    description: row.description,
    categoryId: row.category_id,
    totalAmount: Number(row.total_amount),
    status: row.status,
    notes: row.notes,
    nextDueDate,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPayableInstallment(
  row: any,
): PayableInstallment {
  return {
    id: row.id,
    payableId: row.payable_id,
    installmentNumber: row.installment_number,
    dueDate: row.due_date,
    amount: Number(row.amount),
    paidAmount: Number(row.paid_amount),
    status: row.status,
    paymentMethod: row.payment_method,
    paidAt: row.paid_at,
    financialAccountId: row.financial_account_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCashMovement(row: any): CashMovement {
  return {
    id: row.id,
    userId: row.user_id,
    financialAccountId: row.financial_account_id,
    type: row.type,
    description: row.description,
    amount: Number(row.amount),
    movementDate: row.movement_date,
    categoryId: row.category_id,
    orderId: row.order_id,
    receivableInstallmentId: row.receivable_installment_id,
    payableInstallmentId: row.payable_installment_id,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}


// =====================================================
// CONTAS FINANCEIRAS
// =====================================================

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
    receivableResult,
    payableResult,
  ] = await Promise.all([
    supabase
      .from("cash_movements")
      .select("type, amount")
      .eq("user_id", userId)
      .eq("status", "completed"),

    supabase
      .from("accounts_receivable")
      .select("total_amount, status")
      .eq("user_id", userId),

    supabase
      .from("accounts_payable")
      .select("total_amount, status")
      .eq("user_id", userId),
  ]);

  if (cashResult.error) {
    throw cashResult.error;
  }

  if (receivableResult.error) {
    throw receivableResult.error;
  }

  if (payableResult.error) {
    throw payableResult.error;
  }

  let totalIncome = 0;
  let totalExpense = 0;

  for (const movement of cashResult.data ?? []) {
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

  for (const receivable of receivableResult.data ?? []) {
    if (
      receivable.status !== "paid" &&
      receivable.status !== "cancelled" &&
      receivable.status !== "refunded"
    ) {
      totalReceivable += Number(
        receivable.total_amount,
      );
    }

    if (receivable.status === "overdue") {
      overdueReceivable += Number(
        receivable.total_amount,
      );
    }
  }

  let totalPayable = 0;
  let overduePayable = 0;

  for (const payable of payableResult.data ?? []) {
    if (
      payable.status !== "paid" &&
      payable.status !== "cancelled"
    ) {
      totalPayable += Number(payable.total_amount);
    }

    if (payable.status === "overdue") {
      overduePayable += Number(payable.total_amount);
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
    .select(
      "type, amount, movement_date",
    )
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
    const date = String(
      movement.movement_date,
    );

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
      balance:
        values.income - values.expense,
    }),
  );
}