import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import type { Customer } from "@/features/customers/customers.types";

interface DeleteCustomerModalProps {
  customer: Customer | null;
  isDeleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteCustomerModal({
  customer,
  isDeleting,
  error,
  onConfirm,
  onCancel,
}: DeleteCustomerModalProps) {
  if (!customer) {
    return null;
  }

  const hasError = Boolean(error);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-customer-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <h2
                id="delete-customer-title"
                className="text-lg font-semibold text-gray-900"
              >
                {hasError ? "Cliente não pode ser excluído" : "Excluir cliente"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {hasError
                  ? "O cadastro precisa ser mantido para preservar o histórico."
                  : "Essa ação não poderá ser desfeita."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!hasError ? (
            <p className="text-sm leading-6 text-gray-600">
              Você realmente deseja excluir o cliente{" "}
              <strong className="font-semibold text-gray-900">
                {customer.name}
              </strong>
              ?
            </p>
          ) : (
            <p className="text-sm leading-6 text-gray-600">
              O cliente{" "}
              <strong className="font-semibold text-gray-900">
                {customer.name}
              </strong>{" "}
              possui informações vinculadas ao histórico de pedidos e não pode
              ser removido.
            </p>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {hasError ? "Fechar" : "Cancelar"}
          </button>

          {!hasError && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Excluir cliente
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}