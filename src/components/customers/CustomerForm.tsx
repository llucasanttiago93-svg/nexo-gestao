import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  useForm,
} from "react-hook-form";
import { z } from "zod";

import type {
  CustomerInput,
} from "@/features/customers/customers.types";

const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome do cliente."),

  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .or(z.literal("")),

  phone: z.string().trim(),
  document: z.string().trim(),

  address: z.string().trim(),
  number: z.string().trim(),
  complement: z.string().trim(),
  neighborhood: z.string().trim(),
  city: z.string().trim(),
  state: z.string().trim(),
  zipCode: z.string().trim(),
  notes: z.string().trim(),
});

interface CustomerFormProps {
  initialValues?: CustomerInput;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (data: CustomerInput) => void;
  onCancel: () => void;
}

const emptyValues: CustomerInput = {
  name: "",
  email: "",
  phone: "",
  document: "",
  address: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
  notes: "",
};

export function CustomerForm({
  initialValues,
  isSubmitting = false,
  submitLabel = "Salvar cliente",
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
    },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues:
      initialValues ?? emptyValues,
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* DADOS PRINCIPAIS */}
      <section className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Dados principais
          </h2>

          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Informações básicas para identificar o cliente.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Nome *
            </label>

            <input
              id="name"
              {...register("name")}
              placeholder="Nome completo"
              className={`h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:ring-2 ${
                errors.name
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
              }`}
            />

            {errors.name && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="cliente@email.com"
              className={`h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:ring-2 ${
                errors.email
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
              }`}
            />

            {errors.email && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Telefone
            </label>

            <input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="(11) 99999-9999"
              className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          <div>
            <label
              htmlFor="document"
              className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              CPF / CNPJ
            </label>

            <input
              id="document"
              {...register("document")}
              placeholder="000.000.000-00"
              className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>
        </div>
      </section>

      {/* ENDEREÇO */}
      <section className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Endereço
          </h2>

          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Endereço de entrega ou localização do cliente.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="zipCode"
              className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              CEP
            </label>

            <input
              id="zipCode"
              {...register("zipCode")}
              placeholder="00000-000"
              className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label
              htmlFor="address"
              className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Endereço
            </label>

            <input
              id="address"
              {...register("address")}
              placeholder="Rua, avenida..."
              className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          <div>
            <label
              htmlFor="number"
              className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Número
            </label>

            <input
              id="number"
              {...register("number")}
              placeholder="123"
              className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          <div className="sm:col-span-1 lg:col-span-3">
            <label
              htmlFor="complement"
              className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Complemento
            </label>

            <input
              id="complement"
              {...register("complement")}
              placeholder="Apto, sala, bloco..."
              className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          <div>
            <label
              htmlFor="neighborhood"
              className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Bairro
            </label>

            <input
              id="neighborhood"
              {...register("neighborhood")}
              placeholder="Bairro"
              className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          <div className="sm:col-span-1 lg:col-span-2">
            <label
              htmlFor="city"
              className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Cidade
            </label>

            <input
              id="city"
              {...register("city")}
              placeholder="São Paulo"
              className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          <div>
            <label
              htmlFor="state"
              className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Estado
            </label>

            <input
              id="state"
              {...register("state")}
              placeholder="SP"
              maxLength={2}
              className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm uppercase outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>
        </div>
      </section>

      {/* OBSERVAÇÕES */}
      <section className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Observações
          </h2>

          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Informações adicionais sobre o cliente.
          </p>
        </div>

        <textarea
          id="notes"
          {...register("notes")}
          rows={5}
          placeholder="Digite alguma observação..."
          className="w-full resize-y rounded-lg border border-[var(--color-border)] bg-white px-3 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
        />
      </section>

      {/* AÇÕES */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-11 rounded-lg border border-[var(--color-border)] bg-white px-5 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-lg bg-[var(--color-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Salvando..."
            : submitLabel}
        </button>
      </div>
    </form>
  );
}