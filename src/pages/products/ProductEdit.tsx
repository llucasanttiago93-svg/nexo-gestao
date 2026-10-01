import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ProductForm } from "@/features/products/components/ProductForm";
import { DeleteProductModal } from "@/features/products/components/DeleteProductModal";

import type { ProductFormData } from "@/features/products/products.schema";

import { getProduct } from "@/features/products/services/products.service";

import { useUpdateProductMutation } from "@/features/products/products.mutations";

export function ProductEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const updateProductMutation = useUpdateProductMutation();

  const [product, setProduct] = useState<
    Awaited<ReturnType<typeof getProduct>> | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!id) {
        setErrorMessage("Produto não encontrado.");
        setLoading(false);
        return;
      }

      try {
        const data = await getProduct(id);
        setProduct(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o produto.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  async function handleSubmit(data: ProductFormData) {
    if (!id) return;

    setErrorMessage("");

    try {
      const updatedProduct = await updateProductMutation.mutateAsync({
        productId: id,
        product: data,
      });

      setProduct(updatedProduct);

      navigate("/products");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o produto.",
      );
    }
  }

  function handleCancel() {
    navigate("/products");
  }

  function handleDeleted() {
    setDeleteModalOpen(false);
    navigate("/products");
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Carregando produto...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <section>
          <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-2xl">
            Produto não encontrado
          </h1>

          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            Não foi possível carregar este produto.
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

        <button
          type="button"
          onClick={handleCancel}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
        >
          Voltar para produtos
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5 sm:space-y-6">
        <section>
          <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-2xl">
            Editar produto
          </h1>

          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            Atualize as informações do produto.
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
          defaultValues={{
            name: product.name,
            sku: product.sku,
            categoryId: product.categoryId,
            price: product.price,
            costPrice: product.costPrice,
            stock: product.stock,
            minStock: product.minStock,
            status: product.status,
          }}
          submitLabel="Salvar alterações"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={updateProductMutation.isPending}
        />

        <section className="rounded-xl border border-red-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-red-700">
                Zona de perigo
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                A exclusão do produto é permanente e não poderá ser desfeita.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="w-full shrink-0 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
            >
              Excluir produto
            </button>
          </div>
        </section>
      </div>

      <DeleteProductModal
        open={deleteModalOpen}
        productId={product.id}
        productName={product.name}
        onClose={() => setDeleteModalOpen(false)}
        onDeleted={handleDeleted}
      />
    </>
  );
}