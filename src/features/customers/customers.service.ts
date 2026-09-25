import { supabase } from "@/lib/supabase";

import type {
  Customer,
  CustomerInput,
  CustomersResult,
  GetCustomersParams,
} from "@/features/customers/customers.types";

const DEFAULT_PAGE_SIZE = 10;

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Usuário não autenticado.");
  }

  return user.id;
}

function mapCustomer(row: any): Customer {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    document: row.document,
    address: row.address,
    number: row.number,
    complement: row.complement,
    neighborhood: row.neighborhood,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCustomers(
  params: GetCustomersParams = {},
): Promise<CustomersResult> {
  const userId = await getCurrentUserId();

  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.max(
    params.pageSize ?? DEFAULT_PAGE_SIZE,
    1,
  );

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  const search = params.search?.trim();

  if (search) {
    const escapedSearch = search
      .replace(/\\/g, "\\\\")
      .replace(/%/g, "\\%")
      .replace(/,/g, "\\,");

    query = query.or(
      `name.ilike.%${escapedSearch}%,email.ilike.%${escapedSearch}%,phone.ilike.%${escapedSearch}%,document.ilike.%${escapedSearch}%`,
    );
  }

  const {
    data,
    error,
    count,
  } = await query;

  if (error) {
    throw new Error(
      `Não foi possível carregar os clientes: ${error.message}`,
    );
  }

  const total = count ?? 0;

  return {
    customers: (data ?? []).map(mapCustomer),
    total,
    page,
    pageSize,
    totalPages:
      total === 0
        ? 1
        : Math.ceil(total / pageSize),
  };
}

export async function getCustomer(
  customerId: string,
): Promise<Customer> {
  const userId = await getCurrentUserId();

  const {
    data,
    error,
  } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(
      `Não foi possível carregar o cliente: ${error.message}`,
    );
  }

  return mapCustomer(data);
}

export async function createCustomer(
  input: CustomerInput,
): Promise<Customer> {
  const userId = await getCurrentUserId();

  const {
    data,
    error,
  } = await supabase
    .from("customers")
    .insert({
      user_id: userId,
      name: input.name.trim(),
      email: input.email.trim() || null,
      phone: input.phone.trim() || null,
      document: input.document.trim() || null,
      address: input.address.trim() || null,
      number: input.number.trim() || null,
      complement:
        input.complement.trim() || null,
      neighborhood:
        input.neighborhood.trim() || null,
      city: input.city.trim() || null,
      state: input.state.trim() || null,
      zip_code: input.zipCode.trim() || null,
      notes: input.notes.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Não foi possível cadastrar o cliente: ${error.message}`,
    );
  }

  return mapCustomer(data);
}

export async function updateCustomer(
  customerId: string,
  input: CustomerInput,
): Promise<Customer> {
  const userId = await getCurrentUserId();

  const {
    data,
    error,
  } = await supabase
    .from("customers")
    .update({
      name: input.name.trim(),
      email: input.email.trim() || null,
      phone: input.phone.trim() || null,
      document: input.document.trim() || null,
      address: input.address.trim() || null,
      number: input.number.trim() || null,
      complement:
        input.complement.trim() || null,
      neighborhood:
        input.neighborhood.trim() || null,
      city: input.city.trim() || null,
      state: input.state.trim() || null,
      zip_code: input.zipCode.trim() || null,
      notes: input.notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Não foi possível atualizar o cliente: ${error.message}`,
    );
  }

  return mapCustomer(data);
}

export async function deleteCustomer(
  customerId: string,
): Promise<void> {
  const userId = await getCurrentUserId();

  const {
    count,
    error: countError,
  } = await supabase
    .from("orders")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("customer_id", customerId)
    .eq("user_id", userId);

  if (countError) {
    throw new Error(
      `Não foi possível verificar os pedidos do cliente: ${countError.message}`,
    );
  }

  if ((count ?? 0) > 0) {
    throw new Error(
      "Este cliente possui pedidos vinculados e não pode ser excluído.",
    );
  }

  const {
    error,
  } = await supabase
    .from("customers")
    .delete()
    .eq("id", customerId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(
      `Não foi possível excluir o cliente: ${error.message}`,
    );
  }
}