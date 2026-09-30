import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductMobileList } from "@/components/products/ProductMobileList";
import { ProductTable } from "@/components/products/ProductTable";
import { Pagination } from "@/components/ui/Pagination";

import { useDebounce } from "@/hooks/useDebounce";

import { useProductsQuery } from "@/features/products/products.queries";

export function Products() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 200);

  const pageSize = 10;

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useProductsQuery({
    search: debouncedSearch,
    categoryId,
    status,
    page,
    pageSize,
  });

  const products = data?.products ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value);
    setPage(1);
  }

  function handleStatusChange(
    value: "all" | "active" | "inactive",
  ) {
    setStatus(value);
    setPage(1);
  }

  function handleClearFilters() {
    setCategoryId("");
    setStatus("all");
    setPage(1);
  }

  function handleCreateProduct() {
    navigate("/products/new");
  }

  function handleEditProduct(productId: string) {
    navigate(`/products/${productId}/edit`);
  }

  if (isLoading) {
    return <ProductsLoading />;
  }

  if (isError) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <section>
          <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-2xl">
            Produtos
          </h1>

          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            Gerencie seu catálogo e acompanhe o estoque.
          </p>
        </section>

        <section className="rounded-xl border border-red-200 bg-red-50 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-red-700">
            Não foi possível carregar os produtos
          </h2>

          <p className="mt-1 text-sm leading-6 text-red-600">
            {error instanceof Error
              ? error.message
              : "Ocorreu um erro inesperado."}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-2xl">
            Produtos
          </h1>

          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            Gerencie seu catálogo e acompanhe o estoque.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateProduct}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] sm:w-auto sm:py-2.5"
        >
          <Plus size={18} />
          Novo produto
        </button>
      </section>

      <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-3 sm:p-4">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
              placeholder="Buscar produto, SKU ou categoria..."
              className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <ProductFilters
            categoryId={categoryId}
            status={status}
            onCategoryChange={handleCategoryChange}
            onStatusChange={handleStatusChange}
            onClear={handleClearFilters}
          />

          {isFetching && (
            <p className="text-xs text-[var(--color-text-muted)]">
              Atualizando resultados...
            </p>
          )}
        </div>

        <ProductMobileList
          products={products}
          onProductClick={handleEditProduct}
        />

        <ProductTable
          products={products}
          onProductClick={handleEditProduct}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          isFetching={isFetching}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}

function ProductsLoading() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <section>
        <div className="h-7 w-32 animate-pulse rounded bg-slate-100" />

        <div className="mt-2 h-5 w-72 max-w-full animate-pulse rounded bg-slate-100" />
      </section>

      <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-sm">
        <div className="border-b border-[var(--color-border)] p-3 sm:p-4">
          <div className="h-11 w-full animate-pulse rounded-lg bg-slate-100 sm:max-w-md" />
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          <div className="h-12 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-12 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-12 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-12 w-full animate-pulse rounded bg-slate-100" />
        </div>
      </section>
    </div>
  );
}