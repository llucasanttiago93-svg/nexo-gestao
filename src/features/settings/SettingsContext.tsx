import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";

import { useCompanyPreferencesQuery } from "./settings.queries";
import type { CompanyPreferences } from "./settings.types";

interface SettingsContextValue {
  preferences: CompanyPreferences | null;
  isLoading: boolean;
  isError: boolean;

  currency: CompanyPreferences["currency"];
  dateFormat: CompanyPreferences["date_format"];
  timezone: string;
  defaultPage: CompanyPreferences["default_page"];

  formatCurrency: (value: number) => string;
  formatDate: (value: string | Date) => string;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

const defaultPreferences: Pick<
  SettingsContextValue,
  "currency" | "dateFormat" | "timezone" | "defaultPage"
> = {
  currency: "BRL",
  dateFormat: "DD/MM/YYYY",
  timezone: "America/Sao_Paulo",
  defaultPage: "/dashboard",
};

function getCurrencyLocale(currency: CompanyPreferences["currency"]) {
  switch (currency) {
    case "USD":
      return "en-US";

    case "EUR":
      return "de-DE";

    case "BRL":
    default:
      return "pt-BR";
  }
}

function getCurrencyCode(currency: CompanyPreferences["currency"]) {
  switch (currency) {
    case "USD":
      return "USD";

    case "EUR":
      return "EUR";

    case "BRL":
    default:
      return "BRL";
  }
}

function formatDateParts(
  value: string | Date,
  timezone: string,
) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return null;
  }

  return {
    year,
    month,
    day,
  };
}

export function SettingsProvider({
  children,
}: PropsWithChildren) {
  const preferencesQuery = useCompanyPreferencesQuery();

  const preferences = preferencesQuery.data ?? null;

  const currency =
    preferences?.currency ?? defaultPreferences.currency;

  const dateFormat =
    preferences?.date_format ?? defaultPreferences.dateFormat;

  const timezone =
    preferences?.timezone ?? defaultPreferences.timezone;

  const defaultPage =
    preferences?.default_page ?? defaultPreferences.defaultPage;

  const value = useMemo<SettingsContextValue>(() => {
    return {
      preferences,

      isLoading: preferencesQuery.isLoading,
      isError: preferencesQuery.isError,

      currency,
      dateFormat,
      timezone,
      defaultPage,

      formatCurrency: (value: number) => {
        return new Intl.NumberFormat(
          getCurrencyLocale(currency),
          {
            style: "currency",
            currency: getCurrencyCode(currency),
          },
        ).format(value);
      },

      formatDate: (value: string | Date) => {
        const parts = formatDateParts(value, timezone);

        if (!parts) {
          return "-";
        }

        switch (dateFormat) {
          case "MM/DD/YYYY":
            return `${parts.month}/${parts.day}/${parts.year}`;

          case "YYYY-MM-DD":
            return `${parts.year}-${parts.month}-${parts.day}`;

          case "DD/MM/YYYY":
          default:
            return `${parts.day}/${parts.month}/${parts.year}`;
        }
      },
    };
  }, [
    preferences,
    preferencesQuery.isLoading,
    preferencesQuery.isError,
    currency,
    dateFormat,
    timezone,
    defaultPage,
  ]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings deve ser utilizado dentro de SettingsProvider.",
    );
  }

  return context;
}