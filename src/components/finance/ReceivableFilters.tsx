import { Search, SlidersHorizontal } from "lucide-react";

export type ReceivableStatusFilter =
  | "all"
  | "open"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled"
  | "refunded";

interface ReceivableFiltersProps {
  search: string;
  status: ReceivableStatusFilter;
  startDate: string;
  endDate: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (
    value: ReceivableStatusFilter,
  ) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export function ReceivableFilters({
  search,
  status,
  startDate,
  endDate,
  onSearchChange,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
}: ReceivableFiltersProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4">

        {/* Busca */}

        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder="Buscar por descrição..."
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />
        </div>


        {/* Filtros */}

        <div className="flex flex-col gap-3 md:flex-row md:items-center">

          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <SlidersHorizontal className="h-4 w-4 text-gray-500" />

            <span>Filtros</span>
          </div>


          {/* Status */}

          <select
            value={status}
            onChange={(event) =>
              onStatusChange(
                event.target.value as ReceivableStatusFilter,
              )
            }
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 md:w-48"
          >
            <option value="all">
              Todos os status
            </option>

            <option value="open">
              Em aberto
            </option>

            <option value="partially_paid">
              Parcialmente pago
            </option>

            <option value="paid">
              Pago
            </option>

            <option value="overdue">
              Vencido
            </option>

            <option value="cancelled">
              Cancelado
            </option>

            <option value="refunded">
              Estornado
            </option>
          </select>


          {/* Data inicial */}

          <input
            type="date"
            value={startDate}
            onChange={(event) =>
              onStartDateChange(event.target.value)
            }
            aria-label="Data inicial"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 md:w-44"
          />


          {/* Data final */}

          <input
            type="date"
            value={endDate}
            onChange={(event) =>
              onEndDateChange(event.target.value)
            }
            aria-label="Data final"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 md:w-44"
          />

        </div>
      </div>
    </div>
  );
}