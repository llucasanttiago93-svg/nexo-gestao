import {
  BarChart3,
  CircleDollarSign,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({
  open,
  onClose,
}: MobileMenuProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Fundo escuro */}
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Menu */}
      <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl">
        {/* Cabeçalho */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-5">
          <div>
            <div className="text-lg font-bold tracking-tight text-[var(--color-text-primary)]">
              NEXO
            </div>

            <div className="text-xs font-medium text-[var(--color-text-secondary)]">
              Gestão
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="rounded-lg p-2 text-[var(--color-text-secondary)] transition hover:bg-slate-100 hover:text-[var(--color-text-primary)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <MobileNavItem
            to="/dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Visão geral"
            onClick={onClose}
          />

          <MobileSection title="Vendas">
            <MobileNavItem
              to="/orders"
              icon={<ShoppingCart size={18} />}
              label="Pedidos"
              onClick={onClose}
            />

            <MobileNavItem
              to="/customers"
              icon={<Users size={18} />}
              label="Clientes"
              onClick={onClose}
            />
          </MobileSection>

          <MobileSection title="Catálogo">
            <MobileNavItem
              to="/products"
              icon={<Package size={18} />}
              label="Produtos"
              onClick={onClose}
            />
          </MobileSection>

          <MobileSection title="Financeiro">
            <MobileNavItem
              to="/finance"
              icon={<CircleDollarSign size={18} />}
              label="Financeiro"
              onClick={onClose}
            />
          </MobileSection>

          <MobileSection title="Análises">
            <MobileNavItem
              to="/reports"
              icon={<BarChart3 size={18} />}
              label="Relatórios"
              onClick={onClose}
            />
          </MobileSection>
        </nav>

        {/* Configurações */}
        <div className="border-t border-[var(--color-border)] p-3">
          <MobileNavItem
            to="/settings"
            icon={<Settings size={18} />}
            label="Configurações"
            onClick={onClose}
          />
        </div>
      </aside>
    </div>
  );
}

interface MobileSectionProps {
  title: string;
  children: React.ReactNode;
}

function MobileSection({
  title,
  children,
}: MobileSectionProps) {
  return (
    <div className="mt-7">
      <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {title}
      </div>

      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

interface MobileNavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function MobileNavItem({
  to,
  icon,
  label,
  onClick,
}: MobileNavItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-[var(--color-text-secondary)] hover:bg-slate-50 hover:text-[var(--color-text-primary)]",
        ].join(" ")
      }
    >
      <span className="shrink-0">
        {icon}
      </span>

      <span className="flex-1 text-left">
        {label}
      </span>
    </NavLink>
  );
}