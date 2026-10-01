import { supabase } from "@/lib/supabase";

import type {
  Organization,
  OrganizationMember,
} from "../organization.types";

export async function getCurrentOrganization(): Promise<Organization> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Nenhuma organização foi encontrada para o usuário autenticado.",
    );
  }

  return data as Organization;
}

export async function getCurrentOrganizationId(): Promise<string> {
  const organization = await getCurrentOrganization();

  return organization.id;
}

export async function getCurrentOrganizationMember(): Promise<OrganizationMember> {
  const { data, error } = await supabase
    .from("organization_members")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "O usuário autenticado não possui vínculo com uma organização.",
    );
  }

  return data as OrganizationMember;
}