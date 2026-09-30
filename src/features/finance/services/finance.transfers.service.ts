import { supabase } from "@/lib/supabase";

export interface TransferFinanceAccountInput {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  description?: string;
}

export async function transferBetweenFinanceAccounts(
  input: TransferFinanceAccountInput,
) {
  const { data, error } = await supabase.rpc(
    "transfer_between_finance_accounts",
    {
      p_source_account_id: input.sourceAccountId,
      p_destination_account_id:
        input.destinationAccountId,
      p_amount: input.amount,
      p_description: input.description ?? null,
    },
  );

  if (error) {
    throw error;
  }

  return data;
}
