import { Search, SlidersHorizontal } from "lucide-react";

interface FinanceFiltersProps {
  search: string;
  type: "all" | "income" | "expense";
  startDate: string;
  endDate: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (
    value: "all" | "income" | "expense",
  ) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export function FinanceFilters({
  search,
  type,
  startDate,
  endDate,
  onSearchChange,
  onTypeChange,
  onStartDateChange,
  onEndDateChange,
}: FinanceFiltersProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4">

        {/* Busca */}

        <div className="relative w-full">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder="Buscar movimentação..."
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />
        </div>


        {/* Filtros */}

        <div className="flex flex-col gap-3 md:flex-row md:items-center">

          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <SlidersHorizontal className="h-4 w-4 text-gray-500" />

            <span>Filtros</span>
          </div>


          {/* Tipo */}

          <select
            value={type}
            onChange={(event) =>
              onTypeChange(
                event.target.value as
                  | "all"
                  | "income"
                  | "expense",
              )
            }
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 md:w-44"
          >
            <option value="all">
              Todos os tipos
            </option>

            <option value="income">
              Entradas
            </option>

            <option value="expense">
              Saídas
            </option>
          </select>


          {/* Data inicial */}

          <input
            type="date"
            value={startDate}
            onChange={(event) =>
              onStartDateChange(
                event.target.value,
              )
            }
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 md:w-44"
            aria-label="Data inicial"
          />


          {/* Data final */}

          <input
            type="date"
            value={endDate}
            onChange={(event) =>
              onEndDateChange(
                event.target.value,
              )
            }
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 md:w-44"
            aria-label="Data final"
          />

        </div>
      </div>
    </div>
  );
}