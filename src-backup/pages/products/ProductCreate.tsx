import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ProductForm } from "@/components/products/ProductForm";

import type { ProductFormData } from "@/features/products/products.schema";

import { useCreateProductMutation } from "@/features/products/products.mutations";

export function ProductCreate() {
  const navigate = useNavigate();

  const createProductMutation = useCreateProductMutation();

  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(data: ProductFormData) {
    setErrorMessage("");

    try {
      await createProductMutation.mutateAsync(data);

      navigate("/products");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o produto.",
      );
    }
  }

  function handleCancel() {
    navigate("/products");
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section>
        <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-2xl">
          Novo produto
        </h1>

        <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
          Cadastre um novo produto no catálogo.
        </p>
      </section>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <ProductForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createProductMutation.isPending}
      />
    </div>
  );
}