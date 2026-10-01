import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

import {
  getCompanyPreferences,
  getCompanyProfile,
  saveCompanyPreferences,
  saveCompanyProfile,
} from "./services/settings.service";

import type {
  CompanyPreferencesFormData,
  CompanyProfileFormData,
} from "./settings.types";

export const settingsQueryKeys = {
  all: ["settings"] as const,

  companyProfile: () =>
    [...settingsQueryKeys.all, "company-profile"] as const,

  companyPreferences: () =>
    [...settingsQueryKeys.all, "company-preferences"] as const,
};

export function useCompanyProfileQuery() {
  return useQuery({
    queryKey: settingsQueryKeys.companyProfile(),
    queryFn: getCompanyProfile,
  });
}

export function useSaveCompanyProfileMutation() {
  return useMutation({
    mutationFn: (data: CompanyProfileFormData) =>
      saveCompanyProfile(data),

    onSuccess: async (data) => {
      queryClient.setQueryData(
        settingsQueryKeys.companyProfile(),
        data,
      );

      await queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.companyProfile(),
      });
    },
  });
}

export function useCompanyPreferencesQuery() {
  return useQuery({
    queryKey: settingsQueryKeys.companyPreferences(),
    queryFn: getCompanyPreferences,
  });
}

export function useSaveCompanyPreferencesMutation() {
  return useMutation({
    mutationFn: (data: CompanyPreferencesFormData) =>
      saveCompanyPreferences(data),

    onSuccess: async (data) => {
      queryClient.setQueryData(
        settingsQueryKeys.companyPreferences(),
        data,
      );

      await queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.companyPreferences(),
      });
    },
  });
}