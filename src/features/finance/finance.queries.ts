import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createDefaultFinanceCategories,
  createFinanceAccount,
  createPayable,
  createReceivableFromOrder,
  getAccountsPayable,
  getAccountsReceivable,
  getCashFlow,
  getCashMovements,
  getFinanceAccount,
  getFinanceAccounts,
  getFinanceCategories,
  getFinanceSummary,
  getAccountPayable,
  getAccountReceivable,
  getPayableInstallments,
  getReceivableInstallments,
  getOrCreateDefaultFinanceAccount,
  payPayableInstallment,
  payReceivableInstallment,
  transferBetweenFinanceAccounts,
  updateFinanceAccount,
} from "./finance.service";

import type {
  CreatePayableInput,
  CreateReceivableFromOrderInput,
  PayInstallmentInput,
} from "./finance.types";


// =====================================================
// QUERY KEYS
// =====================================================

export const financeQueryKeys = {
  all: ["finance"] as const,

  accounts: () =>
    [...financeQueryKeys.all, "accounts"] as const,

  accountList: () =>
    [...financeQueryKeys.accounts(), "list"] as const,

  account: (id: string) =>
    [...financeQueryKeys.accounts(), "detail", id] as const,

  categories: () =>
    [...financeQueryKeys.all, "categories"] as const,

  receivables: () =>
    [...financeQueryKeys.all, "receivables"] as const,

  receivableList: (params: {
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) =>
    [
      ...financeQueryKeys.receivables(),
      "list",
      params,
    ] as const,

  receivable: (id: string) =>
    [
      ...financeQueryKeys.receivables(),
      "detail",
      id,
    ] as const,

  receivableInstallments: (id: string) =>
    [
      ...financeQueryKeys.receivables(),
      "installments",
      id,
    ] as const,

  payables: () =>
    [...financeQueryKeys.all, "payables"] as const,

  payableList: (params: {
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) =>
    [
      ...financeQueryKeys.payables(),
      "list",
      params,
    ] as const,

  payable: (id: string) =>
    [
      ...financeQueryKeys.payables(),
      "detail",
      id,
    ] as const,

  payableInstallments: (id: string) =>
    [
      ...financeQueryKeys.payables(),
      "installments",
      id,
    ] as const,

  cashMovements: () =>
    [...financeQueryKeys.all, "cash-movements"] as const,

  cashMovementList: (params: {
    type?: "income" | "expense";
    accountId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) =>
    [
      ...financeQueryKeys.cashMovements(),
      "list",
      params,
    ] as const,

  summary: () =>
    [...financeQueryKeys.all, "summary"] as const,

  cashFlow: (
    startDate: string,
    endDate: string,
  ) =>
    [
      ...financeQueryKeys.all,
      "cash-flow",
      startDate,
      endDate,
    ] as const,
};


// =====================================================
// CONTAS FINANCEIRAS
// =====================================================

export function useFinanceAccountsQuery() {
  return useQuery({
    queryKey: financeQueryKeys.accountList(),
    queryFn: getFinanceAccounts,
  });
}


export function useFinanceAccountQuery(
  accountId: string | undefined,
) {
  return useQuery({
    queryKey: financeQueryKeys.account(
      accountId ?? "",
    ),
    queryFn: () =>
      getFinanceAccount(accountId!),
    enabled: Boolean(accountId),
  });
}


export function useCreateFinanceAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFinanceAccount,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: financeQueryKeys.accounts(),
      });

      queryClient.invalidateQueries({
        queryKey: financeQueryKeys.summary(),
      });
    },
  });
}


export function useUpdateFinanceAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      input,
    }: {
      accountId: string;
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
      };
    }) =>
      updateFinanceAccount(
        accountId,
        input,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: financeQueryKeys.accounts(),
      });

      queryClient.invalidateQueries({
        queryKey: financeQueryKeys.account(
          variables.accountId,
        ),
      });

      queryClient.invalidateQueries({
        queryKey: financeQueryKeys.summary(),
      });
    },
  });
}


export function useGetOrCreateDefaultFinanceAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn:
      getOrCreateDefaultFinanceAccount,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: financeQueryKeys.accounts(),
      });

      queryClient.invalidateQueries({
        queryKey: financeQueryKeys.summary(),
      });
    },
  });
}


// =====================================================
// CATEGORIAS
// =====================================================

export function useFinanceCategoriesQuery() {
  return useQuery({
    queryKey: financeQueryKeys.categories(),
    queryFn: getFinanceCategories,
  });
}


export function useCreateDefaultFinanceCategoriesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn:
      createDefaultFinanceCategories,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: financeQueryKeys.categories(),
      });
    },
  });
}


// =====================================================
// CONTAS A RECEBER
// =====================================================

export function useAccountsReceivableQuery(
  params: {
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  } = {},
) {
  return useQuery({
    queryKey:
      financeQueryKeys.receivableList(
        params,
      ),
    queryFn: () =>
      getAccountsReceivable(params),
  });
}


export function useAccountReceivableQuery(
  receivableId: string | undefined,
) {
  return useQuery({
    queryKey:
      financeQueryKeys.receivable(
        receivableId ?? "",
      ),
    queryFn: () =>
      getAccountReceivable(
        receivableId!,
      ),
    enabled: Boolean(receivableId),
  });
}


export function useReceivableInstallmentsQuery(
  receivableId: string | undefined,
) {
  return useQuery({
    queryKey:
      financeQueryKeys.receivableInstallments(
        receivableId ?? "",
      ),
    queryFn: () =>
      getReceivableInstallments(
        receivableId!,
      ),
    enabled: Boolean(receivableId),
  });
}


export function useCreateReceivableFromOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: CreateReceivableFromOrderInput,
    ) =>
      createReceivableFromOrder(
        input,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          financeQueryKeys.receivables(),
      });

      queryClient.invalidateQueries({
        queryKey:
          financeQueryKeys.summary(),
      });
    },
  });
}


export function usePayReceivableInstallmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: PayInstallmentInput,
    ) =>
      payReceivableInstallment(
        input,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          financeQueryKeys.receivables(),
      });

      queryClient.invalidateQueries({
        queryKey:
          financeQueryKeys.accounts(),
      });

      queryClient.invalidateQueries({
        queryKey:
          financeQueryKeys.cashMovements(),
      });

      queryClient.invalidateQueries({
        queryKey:
          financeQueryKeys.summary(),
      });

      queryClient.invalidateQueries({
        queryKey:
          financeQueryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}


// =====================================================
// CONTAS A PAGAR
// =====================================================

export function useAccountsPayableQuery(
  params: {
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  } = {},
) {
  return useQuery({
    queryKey:
      financeQueryKeys.payableList(
        params,
      ),
    queryFn: () =>
      getAccountsPayable(params),
  });
}


export function useAccountPayableQuery(
  payableId: string | undefined,
) {
  return useQuery({
    queryKey:
      financeQueryKeys.payable(
        payableId ?? "",
      ),
    queryFn: () =>
      getAccountPayable(
        payableId!,
      ),
    enabled: Boolean(payableId),
  });
}


export function usePayableInstallmentsQuery(
  payableId: string | undefined,
) {
  return useQuery({
    queryKey:
      financeQueryKeys.payableInstallments(
        payableId ?? "",
      ),
    queryFn: () =>
      getPayableInstallments(
        payableId!,
      ),
    enabled: Boolean(payableId),
  });
}


export function useCreatePayableMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: CreatePayableInput,
    ) =>
      createPayable(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          financeQueryKeys.payables(),
      });

      queryClient.invalidateQueries({
        queryKey:
          financeQueryKeys.summary(),
      });
    },
  });
}


export function usePayPayableInstallmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: PayInstallmentInput,
    ) =>
      payPayableInstallment(
        input,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          financeQueryKeys.payables(),
      });

      queryClient.invalidateQueries({
        queryKey:
          financeQueryKeys.accounts(),
      });

      queryClient.invalidateQueries({
        queryKey:
          financeQueryKeys.cashMovements(),
      });

      queryClient.invalidateQueries({
        queryKey:
          financeQueryKeys.summary(),
      });

      queryClient.invalidateQueries({
        queryKey:
          financeQueryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey:
          ["dashboard"],
      });
    },
  });
}


// =====================================================
// MOVIMENTAÇÕES DE CAIXA
// =====================================================

export function useCashMovementsQuery(
  params: {
    type?: "income" | "expense";
    accountId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  } = {},
) {
  return useQuery({
    queryKey:
      financeQueryKeys.cashMovementList(
        params,
      ),
    queryFn: () =>
      getCashMovements(params),
  });
}


// =====================================================
// RESUMO
// =====================================================

export function useFinanceSummaryQuery() {
  return useQuery({
    queryKey:
      financeQueryKeys.summary(),
    queryFn: getFinanceSummary,
  });
}


// =====================================================
// FLUXO DE CAIXA
// =====================================================

export function useCashFlowQuery(
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey:
      financeQueryKeys.cashFlow(
        startDate,
        endDate,
      ),
    queryFn: () =>
      getCashFlow(
        startDate,
        endDate,
      ),
    enabled: Boolean(
      startDate && endDate,
    ),
  });
}

export function useTransferFinanceAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transferBetweenFinanceAccounts,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["finance", "accounts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["finance", "cash-movements"],
      });

      queryClient.invalidateQueries({
        queryKey: ["finance", "summary"],
      });

      queryClient.invalidateQueries({
        queryKey: ["finance", "cash-flow"],
      });
    },
  });
}