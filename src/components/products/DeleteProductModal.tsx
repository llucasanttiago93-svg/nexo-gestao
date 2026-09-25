import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Modal } from "@/components/ui/Modal";

import { useDeleteProductMutation } from "@/features/products/products.mutations";

interface DeleteProductModalProps {
  open: boolean;
  productId: string;
  productName: string;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteProductModal({
  open,
  productId,
  productName,
  onClose,
  onDeleted,
}: DeleteProductModalProps) {
  const deleteProductMutation = useDeleteProductMutation();

  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    setErrorMessage("");

    try {
      await deleteProductMutation.mutateAsync(productId);

      onDeleted();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o produto.",
      );
    }
  }

  const isDeleting = deleteProductMutation.isPending;

  return (
    <Modal
      open={open}
      onClose={isDeleting ? () => {} : onClose}
      title="Excluir produto"
      description="Essa ação não pode ser desfeita."
      size="sm"
    >
      <div className="space-y-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={20} />
          </div>

          <div className="min-w-0">
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              Você está prestes a excluir:
            </p>

            <p className="mt-1 break-words text-sm font-semibold text-[var(--color-text-primary)]">
              {productName}
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Todos os dados desse produto serão removidos permanentemente.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isDeleting ? "Excluindo..." : "Excluir produto"}
          </button>
        </div>
      </div>
    </Modal>
  );
}