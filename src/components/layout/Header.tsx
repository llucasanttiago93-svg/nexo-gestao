import {
  Bell,
  Menu,
  Search,
} from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({
  onMenuClick,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 backdrop-blur sm:px-6">
      {/* Lado esquerdo */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-[var(--color-text-secondary)] transition hover:bg-slate-100 hover:text-[var(--color-text-primary)] lg:hidden"
        >
          <Menu size={21} />
        </button>

        {/* Busca desktop */}
        <div className="relative hidden w-full max-w-sm md:block">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />

          <input
            type="search"
            placeholder="Buscar..."
            className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white pl-10 pr-4 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Lado direito */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Notificações"
          className="relative rounded-lg p-2 text-[var(--color-text-secondary)] transition hover:bg-slate-100 hover:text-[var(--color-text-primary)]"
        >
          <Bell size={19} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        <div className="hidden h-8 w-px bg-[var(--color-border)] sm:block" />

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            LS
          </div>

          <div className="hidden lg:block">
            <p className="text-sm font-semibold leading-5 text-[var(--color-text-primary)]">
              Lucas Santiago
            </p>

            <p className="text-xs text-[var(--color-text-secondary)]">
              Administrador
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}