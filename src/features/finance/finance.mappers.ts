import type {
  AccountPayable,
  AccountReceivable,
  CashMovement,
  FinanceAccount,
  FinanceCategory,
  PayableInstallment,
  ReceivableInstallment,
} from "./finance.types";

export function mapFinanceAccount(row: any): FinanceAccount {
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

export function mapFinanceCategory(row: any): FinanceCategory {
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

export function mapAccountReceivable(
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

export function mapReceivableInstallment(
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

export function mapAccountPayable(row: any): AccountPayable {
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

export function mapPayableInstallment(
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

export function mapCashMovement(row: any): CashMovement {
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
    transferId: row.transfer_id,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}


// =====================================================
// CONTAS FINANCEIRAS
// =====================================================
