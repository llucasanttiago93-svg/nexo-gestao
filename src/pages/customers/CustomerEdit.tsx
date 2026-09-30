import { ArrowLeft, UserRoundPen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { CustomerForm } from "@/features/customers/components/CustomerForm";

import {
  useCustomerQuery,
  useUpdateCustomerMutation,
} from "@/features/customers/customers.queries";

import type {
  CustomerInput,
} from "@/features/customers/customers.types";

export function CustomerEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    data: customer,
    isLoading,
    isError,
    error,
  } = useCustomerQuery(id);

  const updateCustomerMutation =
    useUpdateCustomerMutation();

  function handleSubmit(data: CustomerInput) {
    if (!id) {
      return;
    }

    updateCustomerMutation.mutate(
      {
        customerId: id,
        input: data,
      },
      {
        onSuccess: () => {
          navigate("/customers");
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />

        <div className="space-y-5">
          <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6">
        <h2 className="text-base font-semibold text-red-800">
          Não foi possível carregar o cliente
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error instanceof Error
            ? error.message
            : "O cliente não foi encontrado."}
        </p>

        <button
          type="button"
          onClick={() => navigate("/customers")}
          className="mt-5 inline-flex h-10 items-center rounded-lg bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90"
        >
          Voltar para clientes
        </button>
      </div>
    );
  }

  const initialValues: CustomerInput = {
    name: customer.name,
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    document: customer.document ?? "",
    address: customer.address ?? "",
    number: customer.number ?? "",
    complement: customer.complement ?? "",
    neighborhood: customer.neighborhood ?? "",
    city: customer.city ?? "",
    state: customer.state ?? "",
    zipCode: customer.zipCode ?? "",
    notes: customer.notes ?? "",
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* CABEÇALHO */}
      <section>
        <button
          type="button"
          onClick={() => navigate("/customers")}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={17} />
          Voltar para clientes
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <UserRoundPen size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
              Editar cliente
            </h1>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Atualize as informações de {customer.name}.
            </p>
          </div>
        </div>
      </section>

      {/* ERRO DA MUTATION */}
      {updateCustomerMutation.isError && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            Não foi possível atualizar o cliente.
          </p>

          <p className="mt-1 text-xs text-red-700">
            {updateCustomerMutation.error instanceof
            Error
              ? updateCustomerMutation.error.message
              : "Ocorreu um erro inesperado."}
          </p>
        </div>
      )}

      {/* FORMULÁRIO */}
      <CustomerForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/customers")}
        isSubmitting={
          updateCustomerMutation.isPending
        }
        submitLabel="Salvar alterações"
      />
    </div>
  );
}