export type FinanceAccountType =
  | "cash"
  | "bank"
  | "digital_account"
  | "credit_card";

export type FinanceCategoryType =
  | "income"
  | "expense"
  | "both";

export type ReceivableStatus =
  | "open"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled"
  | "refunded";

export type PayableStatus =
  | "open"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export type CashMovementType =
  | "income"
  | "expense";

export type CashMovementStatus =
  | "completed"
  | "cancelled";


// =====================================================
// CONTAS FINANCEIRAS
// =====================================================

export interface FinanceAccount {
  id: string;
  userId: string;
  name: string;
  type: FinanceAccountType;
  bankName: string | null;
  accountNumber: string | null;
  initialBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


// =====================================================
// CATEGORIAS FINANCEIRAS
// =====================================================

export interface FinanceCategory {
  id: string;
  userId: string;
  name: string;
  type: FinanceCategoryType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


// =====================================================
// CONTAS A RECEBER
// =====================================================

export interface AccountReceivable {
  id: string;
  userId: string;
  customerId: string | null;
  orderId: string | null;
  description: string;
  categoryId: string | null;
  totalAmount: number;
  status: ReceivableStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  nextDueDate: string | null;
}


// =====================================================
// PARCELAS — CONTAS A RECEBER
// =====================================================

export interface ReceivableInstallment {
  id: string;
  receivableId: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: ReceivableStatus;
  paymentMethod: string | null;
  paidAt: string | null;
  financialAccountId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}


// =====================================================
// CONTAS A PAGAR
// =====================================================

export interface AccountPayable {
  id: string;
  userId: string;
  description: string;
  categoryId: string | null;
  totalAmount: number;
  status: PayableStatus;
  notes: string | null;
  nextDueDate: string | null;
  createdAt: string;
  updatedAt: string;
}


// =====================================================
// PARCELAS — CONTAS A PAGAR
// =====================================================

export interface PayableInstallment {
  id: string;
  payableId: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: PayableStatus;
  paymentMethod: string | null;
  paidAt: string | null;
  financialAccountId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}


// =====================================================
// MOVIMENTAÇÕES DE CAIXA
// =====================================================

export interface CashMovement {
  id: string;
  userId: string;
  financialAccountId: string;
  type: CashMovementType;
  description: string;
  amount: number;
  movementDate: string;
  categoryId: string | null;
  orderId: string | null;
  receivableInstallmentId: string | null;
  payableInstallmentId: string | null;
  status: CashMovementStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}


// =====================================================
// RESUMO FINANCEIRO
// =====================================================

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;

  totalReceivable: number;
  totalPayable: number;

  overdueReceivable: number;
  overduePayable: number;

  accountBalance: number;
}


// =====================================================
// PERÍODO
// =====================================================

export interface FinancePeriod {
  startDate: string;
  endDate: string;
}


// =====================================================
// FLUXO DE CAIXA
// =====================================================

export interface CashFlowPoint {
  date: string;
  income: number;
  expense: number;
  balance?: number;
}


// =====================================================
// PAGAMENTO
// =====================================================

export interface PayInstallmentInput {
  installmentId: string;
  financialAccountId: string;
  amount: number;
}


// =====================================================
// CRIAR CONTA A RECEBER A PARTIR DE PEDIDO
// =====================================================

export interface CreateReceivableFromOrderInput {
  orderId: string;
  dueDate?: string;
  paymentMethod?: string | null;
}


// =====================================================
// CRIAR CONTA A PAGAR
// =====================================================

export interface CreatePayableInput {
  description: string;
  amount: number;
  dueDate: string;
  installments: number;
  categoryId?: string | null;
  notes?: string | null;
}