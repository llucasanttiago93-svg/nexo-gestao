import { Filter, X } from "lucide-react";

import { useProductCategoriesQuery } from "@/features/categories/categories.queries";

interface ProductFiltersProps {
  categoryId: string;
  status: "all" | "active" | "inactive";
  onCategoryChange: (categoryId: string) => void;
  onStatusChange: (status: "all" | "active" | "inactive") => void;
  onClear: () => void;
}

export function ProductFilters({
  categoryId,
  status,
  onCategoryChange,
  onStatusChange,
  onClear,
}: ProductFiltersProps) {
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
  } = useProductCategoriesQuery();

  const hasFilters = categoryId !== "" || status !== "all";

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--color-border-light)] pt-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
        <Filter size={16} />
        <span>Filtros</span>
      </div>

      <select
        value={categoryId}
        onChange={(event) =>
          onCategoryChange(event.target.value)
        }
        disabled={isLoadingCategories}
        className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-[var(--color-text-muted)] sm:w-44"
      >
        <option value="">
          {isLoadingCategories
            ? "Carregando categorias..."
            : "Todas as categorias"}
        </option>

        {categories.map((category) => (
          <option
            key={category.id}
            value={category.id}
          >
            {category.name}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(event) =>
          onStatusChange(
            event.target.value as
              | "all"
              | "active"
              | "inactive",
          )
        }
        className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 sm:w-36"
      >
        <option value="all">Todos os status</option>
        <option value="active">Ativos</option>
        <option value="inactive">Inativos</option>
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-slate-100 hover:text-[var(--color-text-primary)]"
        >
          <X size={16} />
          Limpar filtros
        </button>
      )}
    </div>
  );
}