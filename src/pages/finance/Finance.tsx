import { useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Landmark,
  Wallet,
  RefreshCw,
} from "lucide-react";

import {
  useFinanceAccountsQuery,
  useFinanceCategoriesQuery,
  useFinanceSummaryQuery,
  useCashFlowQuery,
  useCashMovementsQuery,
  useAccountsReceivableQuery,
  useReceivableInstallmentsQuery,
  usePayReceivableInstallmentMutation,
  useAccountsPayableQuery,
  usePayableInstallmentsQuery,
  usePayPayableInstallmentMutation,
  useCreatePayableMutation,
} from "@/features/finance/finance.queries";

import { useSettings } from "@/features/settings/SettingsContext";

import { CashFlowChart } from "@/features/finance/components/CashFlowChart";
import { ReceivableTable } from "@/features/finance/components/ReceivableTable";

import {
  ReceivableFilters,
  type ReceivableStatusFilter,
} from "@/features/finance/components/ReceivableFilters";

import { ReceivableDetails } from "@/features/finance/components/ReceivableDetails";
import { PayableTable } from "@/features/finance/components/PayableTable";

import {
  PayableFilters,
  type PayableStatusFilter,
} from "@/features/finance/components/PayableFilters";

import { PayableDetails } from "@/features/finance/components/PayableDetails";
import { PayableForm } from "@/features/finance/components/PayableForm";

import { CashMovementTable } from "@/features/finance/components/CashMovementTable";

import {
  CashMovementFilters,
  type CashMovementTypeFilter,
} from "@/features/finance/components/CashMovementFilters";

import type {
  AccountReceivable,
  AccountPayable,
} from "@/features/finance/finance.types";

type FinanceTab =
  | "overview"
  | "receivable"
  | "payable"
  | "accounts";

function getDateMonthsAgo(months: number) {
  const date = new Date();

  date.setMonth(date.getMonth() - months);
  date.setDate(1);

  return date.toISOString().slice(0, 10);
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export function Finance() {
  const [activeTab, setActiveTab] =
    useState<FinanceTab>("overview");

  const { formatCurrency } = useSettings();

  /*
   * =====================================================
   * VISÃO GERAL
   * =====================================================
   */

  const [startDate] = useState(
    getDateMonthsAgo(5),
  );

  const [endDate] = useState(
    getToday(),
  );

  /*
   * =====================================================
   * CONTAS A RECEBER
   * =====================================================
   */

  const [receivableSearch, setReceivableSearch] =
    useState("");

  const [receivableStatus, setReceivableStatus] =
    useState<ReceivableStatusFilter>("all");

  const [receivableStartDate, setReceivableStartDate] =
    useState("");

  const [receivableEndDate, setReceivableEndDate] =
    useState("");

  const [selectedReceivable, setSelectedReceivable] =
    useState<AccountReceivable | null>(null);

  /*
   * =====================================================
   * CONTAS A PAGAR
   * =====================================================
   */

  const [payableSearch, setPayableSearch] =
    useState("");

  const [payableStatus, setPayableStatus] =
    useState<PayableStatusFilter>("all");

  const [payableStartDate, setPayableStartDate] =
    useState("");

  const [payableEndDate, setPayableEndDate] =
    useState("");

  const [selectedPayable, setSelectedPayable] =
    useState<AccountPayable | null>(null);

  const [isPayableFormOpen, setIsPayableFormOpen] =
    useState(false);

  /*
   * =====================================================
   * MOVIMENTAÇÕES DE CAIXA
   * =====================================================
   */

  const [cashMovementType, setCashMovementType] =
    useState<CashMovementTypeFilter>("all");

  const [cashMovementAccountId, setCashMovementAccountId] =
    useState("");

  const [cashMovementStartDate, setCashMovementStartDate] =
    useState("");

  const [cashMovementEndDate, setCashMovementEndDate] =
    useState("");

  const [cashMovementPage, setCashMovementPage] =
    useState(1);

  /*
   * =====================================================
   * QUERIES GERAIS
   * =====================================================
   */

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useFinanceSummaryQuery();

  const {
    data: accounts = [],
    isLoading: isAccountsLoading,
  } = useFinanceAccountsQuery();

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
  } = useFinanceCategoriesQuery();

  const {
    data: cashFlow = [],
    isLoading: isCashFlowLoading,
  } = useCashFlowQuery(
    startDate,
    endDate,
  );

  const {
    data: cashMovementResult,
    isLoading: isCashMovementsLoading,
    isError: isCashMovementsError,
  } = useCashMovementsQuery({
    type:
      cashMovementType === "all"
        ? undefined
        : cashMovementType,
    accountId:
      cashMovementAccountId || undefined,
    startDate:
      cashMovementStartDate || undefined,
    endDate:
      cashMovementEndDate || undefined,
    page: cashMovementPage,
  });

  const cashMovements =
    cashMovementResult?.movements ?? [];

  const cashMovementTotalPages =
    cashMovementResult?.totalPages ?? 1;

  /*
   * =====================================================
   * QUERIES - CONTAS A RECEBER
   * =====================================================
   */

  const {
    data: receivableResult,
    isLoading: isReceivablesLoading,
    isError: isReceivablesError,
  } = useAccountsReceivableQuery({
    search:
      receivableSearch || undefined,

    status:
      receivableStatus === "all"
        ? undefined
        : receivableStatus,

    startDate:
      receivableStartDate || undefined,

    endDate:
      receivableEndDate || undefined,
  });

  const receivables =
    receivableResult?.receivables ?? [];

  const {
    data: receivableInstallments = [],
    isLoading: isInstallmentsLoading,
  } = useReceivableInstallmentsQuery(
    selectedReceivable?.id,
  );

  /*
   * =====================================================
   * QUERIES - CONTAS A PAGAR
   * =====================================================
   */

  const {
    data: payableResult,
    isLoading: isPayablesLoading,
    isError: isPayablesError,
  } = useAccountsPayableQuery({
    search:
      payableSearch || undefined,

    status:
      payableStatus === "all"
        ? undefined
        : payableStatus,

    startDate:
      payableStartDate || undefined,

    endDate:
      payableEndDate || undefined,
  });

  const payables =
    payableResult?.payables ?? [];

  const {
    data: payableInstallments = [],
    isLoading:
      isPayableInstallmentsLoading,
  } = usePayableInstallmentsQuery(
    selectedPayable?.id,
  );

  /*
   * =====================================================
   * MUTATIONS
   * =====================================================
   */

  const payReceivableMutation =
    usePayReceivableInstallmentMutation();

  const payPayableMutation =
    usePayPayableInstallmentMutation();

  const createPayableMutation =
    useCreatePayableMutation();

  /*
   * =====================================================
   * ESTADOS
   * =====================================================
   */

  const isLoading =
    isSummaryLoading ||
    isAccountsLoading ||
    isCategoriesLoading;

  /*
   * =====================================================
   * TABS
   * =====================================================
   */

  const tabs = [
    {
      id: "overview" as const,
      label: "Visão geral",
    },
    {
      id: "receivable" as const,
      label: "A receber",
    },
    {
      id: "payable" as const,
      label: "A pagar",
    },
    {
      id: "accounts" as const,
      label: "Caixas e bancos",
    },
  ];

  /*
   * =====================================================
   * PAGAMENTO DE CONTA A RECEBER
   * =====================================================
   */

  function handlePayReceivable(
    installmentId: string,
    accountId: string,
    amount: number,
  ) {
    payReceivableMutation.mutate({
      installmentId,
      financialAccountId: accountId,
      amount,
    });
  }

  /*
   * =====================================================
   * PAGAMENTO DE CONTA A PAGAR
   * =====================================================
   */

  function handlePayPayable(
    installmentId: string,
    accountId: string,
    amount: number,
  ) {
    payPayableMutation.mutate({
      installmentId,
      financialAccountId: accountId,
      amount,
    });
  }

  function handleCreatePayable(
    data: Parameters<
      typeof createPayableMutation.mutate
    >[0],
  ) {
    createPayableMutation.mutate(data, {
      onSuccess: () => {
        setIsPayableFormOpen(false);
      },
    });
  }

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <div className="space-y-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Financeiro
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Controle seu caixa, contas a receber,
          contas a pagar e contas financeiras.
        </p>
      </div>

      {/* ================================================= */}
      {/* NAVEGAÇÃO */}
      {/* ================================================= */}

      <div className="overflow-x-auto border-b border-gray-200">
        <nav className="flex min-w-max gap-6">
          {tabs.map((tab) => {
            const isActive =
              activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`relative pb-3 text-sm font-medium transition ${
                  isActive
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}

                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gray-900" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ================================================= */}
      {/* VISÃO GERAL */}
      {/* ================================================= */}

      {activeTab === "overview" && (
        <div className="space-y-6">

          {isSummaryError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Não foi possível carregar os
              dados financeiros.
            </div>
          )}

          {/* CARDS PRINCIPAIS */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* SALDO */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Saldo em contas
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {isLoading
                      ? "..."
                      : formatCurrency(
                          summary?.accountBalance ?? 0,
                        )}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-100 p-2.5">
                  <Wallet className="h-5 w-5 text-gray-700" />
                </div>

              </div>
            </div>

            {/* A RECEBER */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    A receber
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {isLoading
                      ? "..."
                      : formatCurrency(
                          summary?.totalReceivable ?? 0,
                        )}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Em aberto
                  </p>
                </div>

                <div className="rounded-lg bg-green-50 p-2.5">
                  <ArrowUpCircle className="h-5 w-5 text-green-600" />
                </div>

              </div>
            </div>

            {/* A PAGAR */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    A pagar
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {isLoading
                      ? "..."
                      : formatCurrency(
                          summary?.totalPayable ?? 0,
                        )}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Em aberto
                  </p>
                </div>

                <div className="rounded-lg bg-red-50 p-2.5">
                  <ArrowDownCircle className="h-5 w-5 text-red-600" />
                </div>

              </div>
            </div>

            {/* RESULTADO */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Resultado realizado
                  </p>

                  <p
                    className={`mt-2 text-2xl font-bold ${
                      (summary?.balance ?? 0) >= 0
                        ? "text-gray-900"
                        : "text-red-600"
                    }`}
                  >
                    {isLoading
                      ? "..."
                      : formatCurrency(
                          summary?.balance ?? 0,
                        )}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Entradas − saídas
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 p-2.5">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                </div>

              </div>
            </div>

          </div>

          {/* FLUXO DE CAIXA */}

          <CashFlowChart
            data={cashFlow}
            isLoading={isCashFlowLoading}
          />

          {/* CONTAS FINANCEIRAS */}

          <section className="space-y-4">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Caixas e bancos
                </h2>

                <p className="text-sm text-gray-500">
                  Contas financeiras e seus saldos atuais.
                </p>
              </div>

              <Landmark className="h-5 w-5 text-gray-400" />

            </div>

            {isAccountsLoading ? (

              <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
                Carregando contas...
              </div>

            ) : accounts.length === 0 ? (

              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">

                <Wallet className="mx-auto h-8 w-8 text-gray-400" />

                <p className="mt-3 text-sm font-medium text-gray-900">
                  Nenhuma conta financeira cadastrada
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Cadastre uma conta para começar
                  a controlar seu caixa.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                {accounts.map((account) => (

                  <div
                    key={account.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                  >

                    <div className="flex items-start justify-between">

                      <div>

                        <p className="text-sm font-semibold text-gray-900">
                          {account.name}
                        </p>

                        <p className="mt-1 text-xs capitalize text-gray-500">
                          {account.type === "bank"
                            ? "Banco"
                            : account.type === "cash"
                              ? "Caixa"
                              : account.type === "digital_account"
                                ? "Conta digital"
                                : "Cartão de crédito"}
                        </p>

                      </div>

                      <div className="rounded-lg bg-gray-100 p-2">
                        <Landmark className="h-4 w-4 text-gray-600" />
                      </div>

                    </div>

                    <p className="mt-5 text-xl font-bold text-gray-900">
                      {formatCurrency(
                        account.currentBalance,
                      )}
                    </p>

                    {account.bankName && (
                      <p className="mt-1 text-xs text-gray-500">
                        {account.bankName}
                      </p>
                    )}

                  </div>

                ))}

              </div>

            )}

          </section>

          {/* CATEGORIAS */}

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Categorias financeiras
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Categorias disponíveis para organizar
                  receitas e despesas.
                </p>

              </div>

              <span className="text-sm font-medium text-gray-500">
                {categories.length}{" "}
                {categories.length === 1
                  ? "categoria"
                  : "categorias"}
              </span>

            </div>

            <div className="mt-5 flex flex-wrap gap-2">

              {categories.map((category) => (

                <span
                  key={category.id}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700"
                >
                  {category.name}
                </span>

              ))}

            </div>

          </section>

        </div>
      )}

      {/* ================================================= */}
      {/* CONTAS A RECEBER */}
      {/* ================================================= */}

      {activeTab === "receivable" && (
        <div className="space-y-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                Contas a receber
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Acompanhe valores em aberto,
                vencimentos e recebimentos.
              </p>

            </div>

            <div className="text-sm text-gray-500">
              {receivables.length}{" "}
              {receivables.length === 1
                ? "conta"
                : "contas"}
            </div>

          </div>

          {isReceivablesError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Não foi possível carregar as contas
              a receber.
            </div>
          )}

          <ReceivableFilters
            search={receivableSearch}
            status={receivableStatus}
            startDate={receivableStartDate}
            endDate={receivableEndDate}
            onSearchChange={setReceivableSearch}
            onStatusChange={setReceivableStatus}
            onStartDateChange={setReceivableStartDate}
            onEndDateChange={setReceivableEndDate}
          />

          <ReceivableTable
            receivables={receivables}
            isLoading={isReceivablesLoading}
            onSelect={setSelectedReceivable}
          />

        </div>
      )}

      {/* ================================================= */}
      {/* CONTAS A PAGAR */}
      {/* ================================================= */}

      {activeTab === "payable" && (
        <div className="space-y-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                Contas a pagar
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Gerencie despesas, vencimentos e pagamentos.
              </p>

            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">

              <div className="text-sm text-gray-500">
                {payables.length}{" "}
                {payables.length === 1
                  ? "conta"
                  : "contas"}
              </div>

              <button
                type="button"
                onClick={() => setIsPayableFormOpen(true)}
                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                + Nova conta
              </button>

            </div>

          </div>

          {isPayablesError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Não foi possível carregar as contas
              a pagar.
            </div>
          )}

          <PayableFilters
            search={payableSearch}
            status={payableStatus}
            startDate={payableStartDate}
            endDate={payableEndDate}
            onSearchChange={setPayableSearch}
            onStatusChange={setPayableStatus}
            onStartDateChange={setPayableStartDate}
            onEndDateChange={setPayableEndDate}
          />

          <PayableTable
            payables={payables}
            isLoading={isPayablesLoading}
            onSelect={setSelectedPayable}
          />

        </div>
      )}

      {/* ================================================= */}
      {/* CAIXAS E BANCOS */}
      {/* ================================================= */}

      {activeTab === "accounts" && (
        <div className="space-y-6">

          <div>

            <h2 className="text-lg font-semibold text-gray-900">
              Caixas e bancos
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Acompanhe seus saldos e todas as
              movimentações financeiras.
            </p>

          </div>

          {/* CONTAS FINANCEIRAS */}

          {isAccountsLoading ? (

            <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
              Carregando contas...
            </div>

          ) : accounts.length === 0 ? (

            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">

              <Wallet className="mx-auto h-8 w-8 text-gray-400" />

              <p className="mt-3 text-sm font-medium text-gray-900">
                Nenhuma conta financeira cadastrada
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Cadastre uma conta financeira para
                começar a controlar seu caixa.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

              {accounts.map((account) => (

                <div
                  key={account.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="font-semibold text-gray-900">
                        {account.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {account.type === "bank"
                          ? "Banco"
                          : account.type === "cash"
                            ? "Caixa"
                            : account.type ===
                                "digital_account"
                              ? "Conta digital"
                              : "Cartão de crédito"}
                      </p>

                      {account.bankName && (
                        <p className="mt-1 text-xs text-gray-500">
                          {account.bankName}
                        </p>
                      )}

                    </div>

                    <div className="rounded-lg bg-gray-100 p-2">
                      <Landmark className="h-4 w-4 text-gray-600" />
                    </div>

                  </div>

                  <p className="mt-5 text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      account.currentBalance,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Saldo atual
                  </p>

                </div>

              ))}

            </div>

          )}

          {/* MOVIMENTAÇÕES */}

          <section className="space-y-4">

            <div>

              <h3 className="text-lg font-semibold text-gray-900">
                Movimentações
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Entradas e saídas realizadas nas contas
                financeiras.
              </p>

            </div>

            {isCashMovementsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Não foi possível carregar as
                movimentações financeiras.
              </div>
            )}

            <CashMovementFilters
              accounts={accounts}
              type={cashMovementType}
              accountId={cashMovementAccountId}
              startDate={cashMovementStartDate}
              endDate={cashMovementEndDate}
              onTypeChange={(value) => {
                setCashMovementType(value);
                setCashMovementPage(1);
              }}
              onAccountChange={(value) => {
                setCashMovementAccountId(value);
                setCashMovementPage(1);
              }}
              onStartDateChange={(value) => {
                setCashMovementStartDate(value);
                setCashMovementPage(1);
              }}
              onEndDateChange={(value) => {
                setCashMovementEndDate(value);
                setCashMovementPage(1);
              }}
            />

            <CashMovementTable
              movements={cashMovements}
              accounts={accounts}
              isLoading={isCashMovementsLoading}
            />

            {!isCashMovementsLoading &&
              cashMovementTotalPages > 1 && (
                <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-sm text-gray-500">
                    Página{" "}
                    <span className="font-medium text-gray-900">
                      {cashMovementPage}
                    </span>{" "}
                    de{" "}
                    <span className="font-medium text-gray-900">
                      {cashMovementTotalPages}
                    </span>
                  </p>

                  <div className="flex gap-2">

                    <button
                      type="button"
                      disabled={cashMovementPage <= 1}
                      onClick={() =>
                        setCashMovementPage(
                          (page) =>
                            Math.max(page - 1, 1),
                        )
                      }
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Anterior
                    </button>

                    <button
                      type="button"
                      disabled={
                        cashMovementPage >=
                        cashMovementTotalPages
                      }
                      onClick={() =>
                        setCashMovementPage(
                          (page) =>
                            Math.min(
                              page + 1,
                              cashMovementTotalPages,
                            ),
                        )
                      }
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Próxima
                    </button>

                  </div>

                </div>
              )}

          </section>

        </div>
      )}

      {/* ================================================= */}
      {/* NOVA CONTA A PAGAR */}
      {/* ================================================= */}

      {isPayableFormOpen && (
        <PayableForm
          categories={categories}
          isSubmitting={
            createPayableMutation.isPending
          }
          onClose={() =>
            setIsPayableFormOpen(false)
          }
          onSubmit={handleCreatePayable}
        />
      )}

      {/* ================================================= */}
      {/* DETALHES DA CONTA A RECEBER */}
      {/* ================================================= */}

      {selectedReceivable && (
        <ReceivableDetails
          receivable={selectedReceivable}
          installments={receivableInstallments}
          accounts={accounts}
          isLoading={isInstallmentsLoading}
          isPaying={
            payReceivableMutation.isPending
          }
          onClose={() =>
            setSelectedReceivable(null)
          }
          onPay={(installment, accountId, amount) => {
            handlePayReceivable(
              installment.id,
              accountId,
              amount,
            );
          }}
        />
      )}

      {/* ================================================= */}
      {/* DETALHES DA CONTA A PAGAR */}
      {/* ================================================= */}

      {selectedPayable && (
        <PayableDetails
          payable={selectedPayable}
          installments={payableInstallments}
          accounts={accounts}
          isLoading={
            isPayableInstallmentsLoading
          }
          isPaying={
            payPayableMutation.isPending
          }
          onClose={() =>
            setSelectedPayable(null)
          }
          onPay={(
            installment,
            accountId,
            amount,
          ) => {
            handlePayPayable(
              installment.id,
              accountId,
              amount,
            );
          }}
        />
      )}

    </div>
  );
}