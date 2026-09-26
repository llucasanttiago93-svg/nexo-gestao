import type { CompanyProfileSchema } from "./settings.schema";

export interface CompanyProfile {
  id: string;
  user_id: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  logo_url: string | null;
  zip_code: string | null;
  address: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
  updated_at: string;
}

export type CompanyProfileFormData = CompanyProfileSchema;

export interface CompanyPreferences {
  id: string;
  user_id: string;
  currency: "BRL" | "USD" | "EUR";
  date_format: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  timezone: string;
  default_page:
    | "/dashboard"
    | "/products"
    | "/customers"
    | "/orders"
    | "/finance";
  created_at: string;
  updated_at: string;
}

export interface CompanyPreferencesFormData {
  currency: CompanyPreferences["currency"];
  date_format: CompanyPreferences["date_format"];
  timezone: CompanyPreferences["timezone"];
  default_page: CompanyPreferences["default_page"];
}