import { supabase } from "@/lib/supabase";

import { getCurrentUserId } from "@/features/organization/organization.auth";
import { getCurrentOrganizationId } from "@/features/organization/services/organization.service";

import type {
  CompanyPreferences,
  CompanyPreferencesFormData,
  CompanyProfile,
} from "../settings.types";

import type {
  CompanyPreferencesSchema,
  CompanyProfileSchema,
} from "../settings.schema";

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("company_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function saveCompanyProfile(
  formData: CompanyProfileSchema,
): Promise<CompanyProfile> {
  const userId = await getCurrentUserId();
  const organizationId = await getCurrentOrganizationId();

  const payload = {
    user_id: userId,
    organization_id: organizationId,
    name: formData.name.trim(),
    document: formData.document?.trim() || null,
    email: formData.email?.trim() || null,
    phone: formData.phone?.trim() || null,
    logo_url: formData.logo_url?.trim() || null,
    zip_code: formData.zip_code?.trim() || null,
    address: formData.address?.trim() || null,
    number: formData.number?.trim() || null,
    complement: formData.complement?.trim() || null,
    neighborhood: formData.neighborhood?.trim() || null,
    city: formData.city?.trim() || null,
    state: formData.state?.trim().toUpperCase() || null,
  };

  const { data, error } = await supabase
    .from("company_profiles")
    .upsert(payload, {
      onConflict: "user_id",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getCompanyPreferences(): Promise<CompanyPreferences | null> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("company_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function saveCompanyPreferences(
  formData: CompanyPreferencesSchema,
): Promise<CompanyPreferences> {
  const userId = await getCurrentUserId();
  const organizationId = await getCurrentOrganizationId();

  const payload: CompanyPreferencesFormData & {
    user_id: string;
    organization_id: string;
  } = {
    user_id: userId,
    organization_id: organizationId,
    currency: formData.currency,
    date_format: formData.date_format,
    timezone: formData.timezone,
    default_page: formData.default_page,
  };

  const { data, error } = await supabase
    .from("company_preferences")
    .upsert(payload, {
      onConflict: "user_id",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}