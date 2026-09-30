import type { FinanceAccount } from "@/features/finance/finance.types";

export type CashMovementTypeFilter =
  | "all"
  | "income"
  | "expense";

interface CashMovementFiltersProps {
  accounts: FinanceAccount[];

  type: CashMovementTypeFilter;
  accountId: string;
  startDate: string;
  endDate: string;

  onTypeChange: (
    value: CashMovementTypeFilter,
  ) => void;

  onAccountChange: (value: string) => void;

  onStartDateChange: (value: string) => void;

  onEndDateChange: (value: string) => void;
}

export function CashMovementFilters({
  accounts,
  type,
  accountId,
  startDate,
  endDate,
  onTypeChange,
  onAccountChange,
  onStartDateChange,
  onEndDateChange,
}: CashMovementFiltersProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Tipo
        </label>

        <select
          value={type}
          onChange={(event) =>
            onTypeChange(
              event.target.value as CashMovementTypeFilter,
            )
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">
            Todas as movimentações
          </option>

          <option value="income">
            Entradas
          </option>

          <option value="expense">
            Saídas
          </option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Conta
        </label>

        <select
          value={accountId}
          onChange={(event) =>
            onAccountChange(
              event.target.value,
            )
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">
            Todas as contas
          </option>

          {accounts
            .filter((account) => account.isActive)
            .map((account) => (
              <option
                key={account.id}
                value={account.id}
              >
                {account.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Data inicial
        </label>

        <input
          type="date"
          value={startDate}
          onChange={(event) =>
            onStartDateChange(
              event.target.value,
            )
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Data final
        </label>

        <input
          type="date"
          value={endDate}
          onChange={(event) =>
            onEndDateChange(
              event.target.value,
            )
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}