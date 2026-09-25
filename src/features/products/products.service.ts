import { supabase } from "@/lib/supabase";

import type { Product } from "@/features/products/products.types";
import type { ProductFormData } from "@/features/products/products.schema";

export interface GetProductsParams {
  search?: string;
  categoryId?: string;
  status?: "active" | "inactive" | "all";
  page?: number;
  pageSize?: number;
}

export interface ProductsResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  category_id: string;
  price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
  status: "active" | "inactive";
  created_at: string;
  categories:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
}

function getCategoryName(
  categories: ProductRow["categories"],
) {
  if (!categories) {
    return "";
  }

  if (Array.isArray(categories)) {
    return categories[0]?.name ?? "";
  }

  return categories.name;
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    categoryId: row.category_id,
    category: getCategoryName(row.categories),
    price: Number(row.price),
    costPrice: Number(row.cost_price),
    stock: row.stock,
    minStock: row.min_stock,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(
      "Não foi possível verificar o usuário autenticado.",
    );
  }

  if (!user) {
    throw new Error(
      "Você precisa estar autenticado para acessar os produtos.",
    );
  }

  return user.id;
}

const productSelect = `
  id,
  name,
  sku,
  category_id,
  price,
  cost_price,
  stock,
  min_stock,
  status,
  created_at,
  categories (
    name
  )
`;

export async function getProducts(
  params: GetProductsParams = {},
): Promise<ProductsResult> {
  const userId = await getCurrentUserId();

  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.max(params.pageSize ?? 10, 1);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select(productSelect, {
      count: "exact",
    })
    .eq("user_id", userId);

  if (params.search?.trim()) {
    const search = params.search.trim();

    query = query.or(
      `name.ilike.%${search}%,sku.ilike.%${search}%`,
    );
  }

  if (params.categoryId) {
    query = query.eq("category_id", params.categoryId);
  }

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const { data, error, count } = await query
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  if (error) {
    throw new Error(
      `Não foi possível carregar os produtos: ${error.message}`,
    );
  }

  const total = count ?? 0;

  return {
    products: (data ?? []).map((row) =>
      mapProduct(row as unknown as ProductRow),
    ),
    total,
    page,
    pageSize,
    totalPages: Math.max(
      Math.ceil(total / pageSize),
      1,
    ),
  };
}

export async function getProduct(
  productId: string,
): Promise<Product> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("id", productId)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(
      `Não foi possível carregar o produto: ${error.message}`,
    );
  }

  return mapProduct(
    data as unknown as ProductRow,
  );
}

export async function createProduct(
  product: ProductFormData,
): Promise<Product> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: userId,
      name: product.name.trim(),
      sku: product.sku.trim(),
      category_id: product.categoryId,
      price: product.price,
      cost_price: product.costPrice,
      stock: product.stock,
      min_stock: product.minStock,
      status: product.status,
    })
    .select(productSelect)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "Já existe um produto com esse SKU.",
      );
    }

    throw new Error(
      `Não foi possível criar o produto: ${error.message}`,
    );
  }

  return mapProduct(
    data as unknown as ProductRow,
  );
}

export async function updateProduct(
  productId: string,
  product: ProductFormData,
): Promise<Product> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("products")
    .update({
      name: product.name.trim(),
      sku: product.sku.trim(),
      category_id: product.categoryId,
      price: product.price,
      cost_price: product.costPrice,
      stock: product.stock,
      min_stock: product.minStock,
      status: product.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .eq("user_id", userId)
    .select(productSelect)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "Já existe outro produto com esse SKU.",
      );
    }

    throw new Error(
      `Não foi possível atualizar o produto: ${error.message}`,
    );
  }

  return mapProduct(
    data as unknown as ProductRow,
  );
}

export async function deleteProduct(
  productId: string,
): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(
      `Não foi possível excluir o produto: ${error.message}`,
    );
  }
}