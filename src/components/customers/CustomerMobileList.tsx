import {
  Edit3,
  Mail,
  MapPin,
  Phone,
  Trash2,
  User,
} from "lucide-react";

import type { Customer } from "@/features/customers/customers.types";

interface CustomerMobileListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function CustomerMobileList({
  customers,
  onEdit,
  onDelete,
}: CustomerMobileListProps) {
  return (
    <div className="space-y-3 md:hidden">
      {customers.map((customer) => (
        <article
          key={customer.id}
          className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <User size={18} />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                  {customer.name}
                </h3>

                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  Cliente desde{" "}
                  {formatDate(customer.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(customer)}
                title="Editar cliente"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-blue-50 hover:text-blue-600"
              >
                <Edit3 size={16} />
              </button>

              <button
                type="button"
                onClick={() => onDelete(customer)}
                title="Excluir cliente"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-[var(--color-border-light)] pt-3">
            {customer.email && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <Mail
                  size={14}
                  className="shrink-0 text-[var(--color-text-muted)]"
                />

                <span className="min-w-0 truncate">
                  {customer.email}
                </span>
              </div>
            )}

            {customer.phone && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <Phone
                  size={14}
                  className="shrink-0 text-[var(--color-text-muted)]"
                />

                <span>{customer.phone}</span>
              </div>
            )}

            {(customer.city || customer.state) && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <MapPin
                  size={14}
                  className="shrink-0 text-[var(--color-text-muted)]"
                />

                <span className="truncate">
                  {[customer.city, customer.state]
                    .filter(Boolean)
                    .join(" - ")}
                </span>
              </div>
            )}

            {customer.document && (
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-xs text-[var(--color-text-muted)]">
                  Documento
                </span>

                <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                  {customer.document}
                </span>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}