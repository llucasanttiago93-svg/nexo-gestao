import { useEffect, useState } from "react";
import type {
  FinanceAccount,
  FinanceAccountType,
} from "@/features/finance/finance.types";

interface FinanceAccountFormProps {
  account?: FinanceAccount | null;
  isSubmitting?: boolean;
  onSubmit: (data: {
    name: string;
    type: FinanceAccountType;
    bankName?: string | null;
    accountNumber?: string | null;
    initialBalance?: number;
  }) => void;
  onCancel: () => void;
}

export function FinanceAccountForm({
  account,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: FinanceAccountFormProps) {
  const [name, setName] = useState("");
  const [type, setType] =
    useState<FinanceAccountType>("bank");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] =
    useState("");
  const [initialBalance, setInitialBalance] =
    useState("0");

  const isEditing = Boolean(account);

  useEffect(() => {
    if (!account) {
      setName("");
      setType("bank");
      setBankName("");
      setAccountNumber("");
      setInitialBalance("0");
      return;
    }

    setName(account.name);
    setType(account.type);
    setBankName(account.bankName ?? "");
    setAccountNumber(account.accountNumber ?? "");
    setInitialBalance(
      String(account.initialBalance),
    );
  }, [account]);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    onSubmit({
      name: name.trim(),
      type,
      bankName: bankName.trim() || null,
      accountNumber:
        accountNumber.trim() || null,
      initialBalance:
        Number(initialBalance.replace(",", ".")) || 0,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Nome da conta
        </label>

        <input
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Ex.: Banco Itaú"
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Tipo de conta
        </label>

        <select
          value={type}
          onChange={(event) =>
            setType(
              event.target
                .value as FinanceAccountType,
            )
          }
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
        >
          <option value="cash">Caixa</option>
          <option value="bank">Banco</option>
          <option value="digital_account">
            Conta digital
          </option>
          <option value="credit_card">
            Cartão de crédito
          </option>
        </select>
      </div>

      {(type === "bank" ||
        type === "digital_account") && (
        <>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Banco
            </label>

            <input
              value={bankName}
              onChange={(event) =>
                setBankName(event.target.value)
              }
              placeholder="Ex.: Itaú"
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Número da conta
            </label>

            <input
              value={accountNumber}
              onChange={(event) =>
                setAccountNumber(
                  event.target.value,
                )
              }
              placeholder="Opcional"
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
            />
          </div>
        </>
      )}

      {!isEditing && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Saldo inicial
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              R$
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={initialBalance}
              onChange={(event) =>
                setInitialBalance(
                  event.target.value,
                )
              }
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
            />
          </div>

          <p className="mt-1.5 text-xs text-gray-500">
            Valor disponível nessa conta antes do
            início dos lançamentos.
          </p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Salvando..."
            : isEditing
              ? "Salvar alterações"
              : "Cadastrar conta"}
        </button>
      </div>
    </form>
  );
}