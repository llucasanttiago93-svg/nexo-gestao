import { useEffect, useState } from "react";
import type { FinanceAccount } from "@/features/finance/finance.types";

interface FinanceTransferFormProps {
  accounts: FinanceAccount[];
  isSubmitting?: boolean;
  onSubmit: (data: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    description?: string;
  }) => void;
  onCancel: () => void;
}

export function FinanceTransferForm({
  accounts,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: FinanceTransferFormProps) {
  const [sourceAccountId, setSourceAccountId] =
    useState("");

  const [destinationAccountId, setDestinationAccountId] =
    useState("");

  const [amount, setAmount] = useState("");

  const [description, setDescription] =
    useState("");

  useEffect(() => {
    if (accounts.length >= 2) {
      setSourceAccountId(accounts[0].id);
      setDestinationAccountId(accounts[1].id);
    }
  }, [accounts]);

  const sourceAccount = accounts.find(
    (account) => account.id === sourceAccountId,
  );

  const destinationAccount = accounts.find(
    (account) => account.id === destinationAccountId,
  );

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const numericAmount =
      Number(amount.replace(",", ".")) || 0;

    if (
      !sourceAccountId ||
      !destinationAccountId ||
      sourceAccountId === destinationAccountId ||
      numericAmount <= 0
    ) {
      return;
    }

    onSubmit({
      sourceAccountId,
      destinationAccountId,
      amount: numericAmount,
      description:
        description.trim() || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Conta de origem
        </label>

        <select
          value={sourceAccountId}
          onChange={(event) =>
            setSourceAccountId(event.target.value)
          }
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
        >
          <option value="">
            Selecione a conta de origem
          </option>

          {accounts.map((account) => (
            <option
              key={account.id}
              value={account.id}
            >
              {account.name} —{" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(account.currentBalance)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Conta de destino
        </label>

        <select
          value={destinationAccountId}
          onChange={(event) =>
            setDestinationAccountId(
              event.target.value,
            )
          }
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
        >
          <option value="">
            Selecione a conta de destino
          </option>

          {accounts.map((account) => (
            <option
              key={account.id}
              value={account.id}
              disabled={account.id === sourceAccountId}
            >
              {account.name} —{" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(account.currentBalance)}
            </option>
          ))}
        </select>
      </div>

      {sourceAccount && (
        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
          Saldo disponível na origem:{" "}
          <strong>
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(sourceAccount.currentBalance)}
          </strong>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Valor da transferência
        </label>

        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            R$
          </span>

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
            placeholder="0,00"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Descrição
        </label>

        <input
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="Ex.: Transferência para o banco"
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
        />
      </div>

      {sourceAccount &&
        destinationAccount &&
        sourceAccountId !== destinationAccountId &&
        Number(amount.replace(",", ".")) > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Origem
              </span>

              <span className="font-medium text-gray-900">
                {sourceAccount.name}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Destino
              </span>

              <span className="font-medium text-gray-900">
                {destinationAccount.name}
              </span>
            </div>

            <div className="mt-3 border-t border-gray-100 pt-3 flex items-center justify-between">
              <span className="font-medium text-gray-700">
                Valor
              </span>

              <span className="text-lg font-semibold text-gray-900">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(
                  Number(amount.replace(",", ".")),
                )}
              </span>
            </div>
          </div>
        )}

      <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={
            isSubmitting ||
            !sourceAccountId ||
            !destinationAccountId ||
            sourceAccountId === destinationAccountId ||
            Number(amount.replace(",", ".")) <= 0
          }
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Transferindo..."
            : "Transferir"}
        </button>
      </div>
    </form>
  );
}