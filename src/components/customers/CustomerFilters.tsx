import { Search } from "lucide-react";

interface CustomerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function CustomerFilters({
  search,
  onSearchChange,
}: CustomerFiltersProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
      <div className="relative max-w-xl">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Buscar por nome, e-mail, telefone ou documento..."
          className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white pl-10 pr-4 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
        />
      </div>
    </div>
  );
}