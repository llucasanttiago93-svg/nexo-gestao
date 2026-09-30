import type { ReportFilters as ReportFiltersType } from "@/features/reports/reports.types";

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onChange: (
    filters: ReportFiltersType,
  ) => void;
}

export function ReportFilters({
  filters,
  onChange,
}: ReportFiltersProps) {
  function updateFilter(
    field: keyof ReportFiltersType,
    value: string,
  ) {
    onChange({
      ...filters,
      [field]: value,
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Data inicial
          </label>

          <input
            type="date"
            value={filters.startDate}
            onChange={(event) =>
              updateFilter(
                "startDate",
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
            value={filters.endDate}
            onChange={(event) =>
              updateFilter(
                "endDate",
                event.target.value,
              )
            }
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Cliente
          </label>

          <select
            value={filters.customerId ?? ""}
            onChange={(event) =>
              updateFilter(
                "customerId",
                event.target.value,
              )
            }
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              Todos os clientes
            </option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Forma de pagamento
          </label>

          <select
            value={filters.paymentMethod ?? ""}
            onChange={(event) =>
              updateFilter(
                "paymentMethod",
                event.target.value,
              )
            }
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              Todas
            </option>
            <option value="pix">Pix</option>
            <option value="credit_card">
              Cartão de crédito
            </option>
            <option value="debit_card">
              Cartão de débito
            </option>
            <option value="cash">Dinheiro</option>
            <option value="bank_transfer">
              Transferência
            </option>
            <option value="boleto">
              Boleto
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}