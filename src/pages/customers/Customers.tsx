import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";

import { CustomerFilters } from "@/features/customers/components/CustomerFilters";
import { CustomerMobileList } from "@/features/customers/components/CustomerMobileList";
import { CustomerTable } from "@/features/customers/components/CustomerTable";
import { DeleteCustomerModal } from "@/features/customers/components/DeleteCustomerModal";

import {
  useCustomersQuery,
  useDeleteCustomerMutation,
} from "@/features/customers/customers.queries";

import type { Customer } from "@/features/customers/customers.types";

import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";

export function Customers() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") ?? "",
  );

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [page, setPage] = useState(
    Number(searchParams.get("page")) || 1,
  );

  const [customerToDelete, setCustomerToDelete] =
    useState<Customer | null>(null);

  const deleteCustomerMutation = useDeleteCustomerMutation();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 200);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, page, setSearchParams]);

  const { data, isLoading, isError, error } = useCustomersQuery({
    search: debouncedSearch,
    page,
    pageSize: 10,
  });

  function handleEdit(customer: Customer) {
    window.location.href = `/customers/${customer.id}/edit`;
  }

  function handleDelete(customer: Customer) {
    deleteCustomerMutation.reset();
    setCustomerToDelete(customer);
  }

  function handleCancelDelete() {
    if (deleteCustomerMutation.isPending) {
      return;
    }

    deleteCustomerMutation.reset();
    setCustomerToDelete(null);
  }

  function handleConfirmDelete() {
    if (!customerToDelete) {
      return;
    }

    deleteCustomerMutation.mutate(customerToDelete.id, {
      onSuccess: () => {
        setCustomerToDelete(null);
        deleteCustomerMutation.reset();
      },
    });
  }

  const customers = data?.customers ?? [];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Clientes
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Gerencie os clientes cadastrados no sistema.
            </p>
          </div>

          <Link
            to="/customers/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Novo cliente
          </Link>
        </div>

        {/* Filtros */}
        <CustomerFilters
          search={search}
          onSearchChange={setSearch}
        />

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              Não foi possível carregar os clientes.
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error instanceof Error
                ? error.message
                : "Ocorreu um erro inesperado."}
            </p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && customers.length === 0 && (
          <EmptyState
            title={
              debouncedSearch
                ? "Nenhum cliente encontrado"
                : "Nenhum cliente cadastrado"
            }
            description={
              debouncedSearch
                ? "Tente alterar os termos da busca."
                : "Cadastre seu primeiro cliente para começar."
            }
          />
        )}

        {/* Desktop */}
        {!isLoading && !isError && customers.length > 0 && (
          <>
            <CustomerTable
              customers={customers}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Mobile */}
            <CustomerMobileList
              customers={customers}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Paginação */}
            {data && data.totalPages > 1 && (
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                totalItems={data.total}
                pageSize={data.pageSize}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {/* Modal de exclusão */}
      <DeleteCustomerModal
        customer={customerToDelete}
        isDeleting={deleteCustomerMutation.isPending}
        error={
          deleteCustomerMutation.isError
            ? deleteCustomerMutation.error instanceof Error
              ? deleteCustomerMutation.error.message
              : "Não foi possível excluir o cliente."
            : null
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}