import {
  BarChart3,
  CircleDollarSign,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

import { NavLink } from "react-router-dom";

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:flex">
      <div className="flex h-16 items-center border-b border-[var(--color-border)] px-6">
        <div>
          <div className="text-lg font-bold tracking-tight text-[var(--color-text-primary)]">
            NEXO
          </div>

          <div className="text-xs font-medium text-[var(--color-text-secondary)]">
            Gestão
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-1">
          <SidebarItem
            to="/dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Visão geral"
          />
        </div>

        <SidebarSection title="Vendas">
          <SidebarItem
            to="/orders"
            icon={<ShoppingCart size={18} />}
            label="Pedidos"
          />

          <SidebarItem
            to="/customers"
            icon={<Users size={18} />}
            label="Clientes"
          />
        </SidebarSection>

        <SidebarSection title="Catálogo">
          <SidebarItem
            to="/products"
            icon={<Package size={18} />}
            label="Produtos"
          />
        </SidebarSection>

        <SidebarSection title="Financeiro">
          <SidebarItem
            to="/finance"
            icon={<CircleDollarSign size={18} />}
            label="Financeiro"
          />
        </SidebarSection>

        <SidebarSection title="Análises">
          <SidebarItem
            to="/reports"
            icon={<BarChart3 size={18} />}
            label="Relatórios"
          />
        </SidebarSection>
      </nav>

      <div className="border-t border-[var(--color-border)] p-3">
        <SidebarItem
          to="/settings"
          icon={<Settings size={18} />}
          label="Configurações"
        />
      </div>
    </aside>
  );
}

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

function SidebarSection({
  title,
  children,
}: SidebarSectionProps) {
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

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function SidebarItem({
  to,
  icon,
  label,
}: SidebarItemProps) {
  return (
    <NavLink
      to={to}
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