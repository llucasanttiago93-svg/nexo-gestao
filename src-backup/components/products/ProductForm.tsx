import { useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  productSchema,
  type ProductFormData,
} from "@/features/products/products.schema";

import { useProductCategoriesQuery } from "@/features/categories/categories.queries";

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  defaultValues?: Partial<ProductFormData>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function ProductForm({
  onSubmit,
  onCancel,
  defaultValues,
  submitLabel = "Salvar produto",
  isSubmitting = false,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      categoryId: "",
      price: 0,
      costPrice: 0,
      stock: 0,
      minStock: 0,
      status: "active",
      ...defaultValues,
    },
  });

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
  } = useProductCategoriesQuery();

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name ?? "",
        sku: defaultValues.sku ?? "",
        categoryId: defaultValues.categoryId ?? "",
        price: defaultValues.price ?? 0,
        costPrice: defaultValues.costPrice ?? 0,
        stock: defaultValues.stock ?? 0,
        minStock: defaultValues.minStock ?? 0,
        status: defaultValues.status ?? "active",
      });
    }
  }, [defaultValues, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <section className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Informações do produto
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            Informe os dados principais do produto.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField
            label="Nome do produto"
            error={errors.name?.message}
          >
            <input
              {...register("name")}
              type="text"
              placeholder="Ex.: Kit Shampoo Premium"
              className={inputClass(!!errors.name)}
            />
          </FormField>

          <FormField
            label="SKU"
            error={errors.sku?.message}
          >
            <input
              {...register("sku")}
              type="text"
              placeholder="Ex.: SHP-001"
              className={inputClass(!!errors.sku)}
            />
          </FormField>

          <FormField
            label="Categoria"
            error={errors.categoryId?.message}
          >
            <select
              {...register("categoryId")}
              disabled={isLoadingCategories}
              className={`${inputClass(
                !!errors.categoryId,
              )} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-[var(--color-text-muted)]`}
            >
              <option value="">
                {isLoadingCategories
                  ? "Carregando categorias..."
                  : "Selecione uma categoria"}
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            {isCategoriesError && (
              <p className="mt-1.5 text-xs text-red-600">
                Não foi possível carregar as categorias.
              </p>
            )}
          </FormField>

          <FormField
            label="Preço"
            error={errors.price?.message}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-secondary)]">
                R$
              </span>

              <input
                {...register("price", {
                  valueAsNumber: true,
                })}
                onFocus={(event) => {
                  if (event.currentTarget.value === "0") {
                    event.currentTarget.select();
                  }
                }}
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                className={`${inputClass(!!errors.price)} pl-10`}
              />
            </div>
          </FormField>

          <FormField
            label="Preço de custo"
            error={errors.costPrice?.message}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-secondary)]">
                R$
              </span>

              <input
                {...register("costPrice", {
                  valueAsNumber: true,
                })}
                onFocus={(event) => {
                  if (event.currentTarget.value === "0") {
                    event.currentTarget.select();
                  }
                }}
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                className={`${inputClass(
                  !!errors.costPrice,
                )} pl-10`}
              />
            </div>
          </FormField>

          <FormField
            label="Estoque"
            error={errors.stock?.message}
          >
            <input
              {...register("stock", {
                valueAsNumber: true,
              })}
              onFocus={(event) => {
                if (event.currentTarget.value === "0") {
                  event.currentTarget.select();
                }
              }}
              type="number"
              min="0"
              step="1"
              placeholder="0"
              className={inputClass(!!errors.stock)}
            />
          </FormField>

          <FormField
            label="Estoque mínimo"
            error={errors.minStock?.message}
          >
            <input
              {...register("minStock", {
                valueAsNumber: true,
              })}
              onFocus={(event) => {
                if (event.currentTarget.value === "0") {
                  event.currentTarget.select();
                }
              }}
              type="number"
              min="0"
              step="1"
              placeholder="0"
              className={inputClass(!!errors.minStock)}
            />
          </FormField>

          <FormField
            label="Status"
            error={errors.status?.message}
          >
            <select
              {...register("status")}
              className={inputClass(!!errors.status)}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </FormField>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-[var(--color-border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

function FormField({
  label,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    "h-11 w-full rounded-lg border bg-white px-3 text-sm text-[var(--color-text-primary)] outline-none transition",
    "placeholder:text-[var(--color-text-muted)]",
    "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100",
    hasError
      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
      : "border-[var(--color-border)]",
  ].join(" ");
}