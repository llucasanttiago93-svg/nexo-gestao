import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres."),

  sku: z
    .string()
    .min(2, "Informe um SKU válido."),

  categoryId: z
    .string()
    .min(1, "Selecione uma categoria."),

  price: z
    .number()
    .positive("O preço deve ser maior que zero."),

  costPrice: z
    .number()
    .min(0, "O preço de custo não pode ser negativo."),

  stock: z
    .number()
    .int("O estoque deve ser um número inteiro.")
    .min(0, "O estoque não pode ser negativo."),

  minStock: z
    .number()
    .int("O estoque mínimo deve ser um número inteiro.")
    .min(0, "O estoque mínimo não pode ser negativo."),

  status: z.enum(["active", "inactive"]),
});

export type ProductFormData = z.infer<typeof productSchema>;