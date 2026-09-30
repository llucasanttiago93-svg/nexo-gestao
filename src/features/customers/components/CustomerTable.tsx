import {
  Edit3,
  Mail,
  MoreHorizontal,
  Phone,
  Trash2,
  User,
} from "lucide-react";

import type { Customer } from "@/features/customers/customers.types";

interface CustomerTableProps {
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

function formatPhone(value: string | null) {
  if (!value) {
    return "—";
  }

  return value;
}

export function CustomerTable({
  customers,
  onEdit,
  onDelete,
}: CustomerTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-sm md:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b border-[var(--color-border-light)] bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Cliente
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Contato
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Documento
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Cidade
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Cadastro
              </th>

              <th className="w-20 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-[var(--color-border-light)] transition last:border-b-0 hover:bg-slate-50/70"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                      <User size={17} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                        {customer.name}
                      </p>

                      {customer.email && (
                        <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                          {customer.email}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="space-y-1">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                        <Mail
                          size={13}
                          className="shrink-0 text-[var(--color-text-muted)]"
                        />

                        <span className="max-w-[220px] truncate">
                          {customer.email}
                        </span>
                      </div>
                    )}

                    {customer.phone && (
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                        <Phone
                          size={13}
                          className="shrink-0 text-[var(--color-text-muted)]"
                        />

                        <span>
                          {formatPhone(customer.phone)}
                        </span>
                      </div>
                    )}

                    {!customer.email &&
                      !customer.phone && (
                        <span className="text-xs text-[var(--color-text-muted)]">
                          —
                        </span>
                      )}
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">
                  {customer.document || "—"}
                </td>

                <td className="px-5 py-4">
                  <div className="max-w-[180px]">
                    <p className="truncate text-sm text-[var(--color-text-secondary)]">
                      {customer.city || "—"}
                    </p>

                    {customer.state && (
                      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                        {customer.state}
                      </p>
                    )}
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">
                  {formatDate(customer.createdAt)}
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
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

                    <button
                      type="button"
                      title="Mais opções"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-slate-100 hover:text-[var(--color-text-primary)]"
                    >
                      <MoreHorizontal size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}