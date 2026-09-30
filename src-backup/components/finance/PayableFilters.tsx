import type { PayableStatus } from "@/features/finance/finance.types";

export type PayableStatusFilter = PayableStatus | "all";

interface PayableFiltersProps {
  search: string;
  status: PayableStatusFilter;
  startDate: string;
  endDate: string;

  onSearchChange: (value: string) => void;
  onStatusChange: (value: PayableStatusFilter) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

const statusOptions: {
  value: PayableStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "Todos os status" },
  { value: "open", label: "Em aberto" },
  { value: "partially_paid", label: "Parcialmente pago" },
  { value: "paid", label: "Pago" },
  { value: "overdue", label: "Vencido" },
  { value: "cancelled", label: "Cancelado" },
];

export function PayableFilters({
  search,
  status,
  startDate,
  endDate,
  onSearchChange,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
}: PayableFiltersProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="xl:col-span-1">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Buscar
        </label>

        <input
          type="text"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Descrição da conta..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Status
        </label>

        <select
          value={status}
          onChange={(event) =>
            onStatusChange(
              event.target.value as PayableStatusFilter,
            )
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {statusOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Vencimento inicial
        </label>

        <input
          type="date"
          value={startDate}
          onChange={(event) =>
            onStartDateChange(event.target.value)
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Vencimento final
        </label>

        <input
          type="date"
          value={endDate}
          onChange={(event) =>
            onEndDateChange(event.target.value)
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}