import { ArrowLeft, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { CustomerForm } from "@/components/customers/CustomerForm";

import {
  useCreateCustomerMutation,
} from "@/features/customers/customers.queries";

import type {
  CustomerInput,
} from "@/features/customers/customers.types";

export function CustomerCreate() {
  const navigate = useNavigate();

  const createCustomerMutation =
    useCreateCustomerMutation();

  function handleSubmit(data: CustomerInput) {
    createCustomerMutation.mutate(data, {
      onSuccess: () => {
        navigate("/customers");
      },
    });
  }

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
            <UserPlus size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
              Novo cliente
            </h1>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Cadastre um novo cliente na sua base.
            </p>
          </div>
        </div>
      </section>

      {/* ERRO */}
      {createCustomerMutation.isError && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            Não foi possível cadastrar o cliente.
          </p>

          <p className="mt-1 text-xs text-red-700">
            {createCustomerMutation.error instanceof
            Error
              ? createCustomerMutation.error.message
              : "Ocorreu um erro inesperado."}
          </p>
        </div>
      )}

      {/* FORMULÁRIO */}
      <CustomerForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/customers")}
        isSubmitting={
          createCustomerMutation.isPending
        }
        submitLabel="Cadastrar cliente"
      />
    </div>
  );
}