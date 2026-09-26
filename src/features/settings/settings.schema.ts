import { z } from "zod";

export const companyProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome da empresa."),

  document: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  logo_url: z
    .string()
    .trim()
    .url("Informe uma URL válida.")
    .optional()
    .or(z.literal("")),

  zip_code: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  number: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  complement: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  neighborhood: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  city: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  state: z
    .string()
    .trim()
    .max(2, "Use a sigla do estado.")
    .optional()
    .or(z.literal("")),
});

export type CompanyProfileSchema = z.infer<
  typeof companyProfileSchema
>;

export const companyPreferencesSchema = z.object({
  currency: z.enum(["BRL", "USD", "EUR"]),

  date_format: z.enum([
    "DD/MM/YYYY",
    "MM/DD/YYYY",
    "YYYY-MM-DD",
  ]),

  timezone: z.string().min(1, "Selecione o fuso horário."),

  default_page: z.enum([
    "/dashboard",
    "/products",
    "/customers",
    "/orders",
    "/finance",
  ]),
});

export type CompanyPreferencesSchema = z.infer<
  typeof companyPreferencesSchema
>;