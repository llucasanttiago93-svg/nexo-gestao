import { useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";

import type {
  CreatePayableInput,
  FinanceCategory,
} from "@/features/finance/finance.types";

interface PayableFormProps {
  categories: FinanceCategory[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePayableInput) => void;
}

interface PayableFormValues {
  description: string;
  amount: string;
  installments: string;
  dueDate: string;
  categoryId: string;
  notes: string;
}

export function PayableForm({
  categories,
  isSubmitting = false,
  onClose,
  onSubmit,
}: PayableFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PayableFormValues>({
    defaultValues: {
      description: "",
      amount: "",
      installments: "1",
      dueDate: "",
      categoryId: "",
      notes: "",
    },
  });

  useEffect(() => {
    reset({
      description: "",
      amount: "",
      installments: "1",
      dueDate: "",
      categoryId: "",
      notes: "",
    });
  }, [reset]);

  function handleFormSubmit(
    values: PayableFormValues,
  ) {
    onSubmit({
      description: values.description.trim(),
      amount: Number(values.amount),
      installments: Number(values.installments),
      dueDate: values.dueDate,
      categoryId: values.categoryId || null,
      notes: values.notes.trim() || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Financeiro
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Nova conta a pagar
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Cadastre uma despesa, vencimento e condições de pagamento.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-5 px-6 py-6"
        >
          {/* DESCRIÇÃO */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Descrição
            </label>

            <input
              type="text"
              placeholder="Ex.: Compra de mercadorias"
              {...register("description", {
                required: "Informe a descrição.",
                minLength: {
                  value: 2,
                  message:
                    "A descrição deve ter pelo menos 2 caracteres.",
                },
              })}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {errors.description && (
              <p className="mt-1 text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* VALOR / PARCELAS */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Valor total
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                {...register("amount", {
                  required: "Informe o valor.",
                  validate: (value) =>
                    Number(value) > 0 ||
                    "O valor deve ser maior que zero.",
                })}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {errors.amount && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Número de parcelas
              </label>

              <select
                {...register("installments", {
                  required: "Informe o número de parcelas.",
                  validate: (value) => {
                    const number = Number(value);

                    if (!Number.isInteger(number)) {
                      return "Informe um número inteiro.";
                    }

                    if (number < 1 || number > 120) {
                      return "Escolha entre 1 e 120 parcelas.";
                    }

                    return true;
                  },
                })}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="1">1x — à vista</option>
                <option value="2">2x</option>
                <option value="3">3x</option>
                <option value="4">4x</option>
                <option value="5">5x</option>
                <option value="6">6x</option>
                <option value="8">8x</option>
                <option value="10">10x</option>
                <option value="12">12x</option>
                <option value="18">18x</option>
                <option value="24">24x</option>
                <option value="36">36x</option>
                <option value="48">48x</option>
                <option value="60">60x</option>
                <option value="120">120x</option>
              </select>

              {errors.installments && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.installments.message}
                </p>
              )}
            </div>
          </div>

          {/* VENCIMENTO */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Vencimento da 1ª parcela
            </label>

            <input
              type="date"
              {...register("dueDate", {
                required: "Informe o vencimento.",
              })}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {errors.dueDate && (
              <p className="mt-1 text-xs text-red-600">
                {errors.dueDate.message}
              </p>
            )}

            <p className="mt-1.5 text-xs text-slate-500">
              As próximas parcelas serão geradas automaticamente mês a mês.
            </p>
          </div>

          {/* CATEGORIA */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Categoria
            </label>

            <select
              {...register("categoryId")}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Sem categoria
              </option>

              {categories
                .filter(
                  (category) =>
                    category.isActive &&
                    (category.type === "expense" ||
                      category.type === "both"),
                )
                .map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          {/* OBSERVAÇÕES */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Observações
            </label>

            <textarea
              rows={3}
              placeholder="Observações opcionais..."
              {...register("notes")}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* AÇÕES */}
          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Salvando..."
                : "Cadastrar conta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}