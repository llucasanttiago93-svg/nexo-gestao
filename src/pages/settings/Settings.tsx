import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  MapPin,
  Save,
  Settings2,
  UsersRound,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

import {
  companyPreferencesSchema,
  companyProfileSchema,
  type CompanyPreferencesSchema,
  type CompanyProfileSchema,
} from "@/features/settings/settings.schema";

import {
  useCompanyPreferencesQuery,
  useCompanyProfileQuery,
  useSaveCompanyPreferencesMutation,
  useSaveCompanyProfileMutation,
} from "@/features/settings/settings.queries";

const profileDefaultValues: CompanyProfileSchema = {
  name: "",
  document: "",
  email: "",
  phone: "",
  logo_url: "",
  zip_code: "",
  address: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

const preferencesDefaultValues: CompanyPreferencesSchema = {
  currency: "BRL",
  date_format: "DD/MM/YYYY",
  timezone: "America/Sao_Paulo",
  default_page: "/dashboard",
};

const Settings = () => {
  const navigate = useNavigate();

  const companyProfileQuery = useCompanyProfileQuery();
  const companyPreferencesQuery = useCompanyPreferencesQuery();

  const saveProfileMutation =
    useSaveCompanyProfileMutation();

  const savePreferencesMutation =
    useSaveCompanyPreferencesMutation();

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: {
      errors: profileErrors,
      isDirty: profileIsDirty,
    },
  } = useForm<CompanyProfileSchema>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: profileDefaultValues,
  });

  const {
    register: registerPreferences,
    handleSubmit: handleSubmitPreferences,
    reset: resetPreferences,
    formState: {
      errors: preferenceErrors,
      isDirty: preferencesIsDirty,
    },
  } = useForm<CompanyPreferencesSchema>({
    resolver: zodResolver(companyPreferencesSchema),
    defaultValues: preferencesDefaultValues,
  });

  useEffect(() => {
    const profile = companyProfileQuery.data;

    if (!profile) {
      return;
    }

    resetProfile({
      name: profile.name ?? "",
      document: profile.document ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      logo_url: profile.logo_url ?? "",
      zip_code: profile.zip_code ?? "",
      address: profile.address ?? "",
      number: profile.number ?? "",
      complement: profile.complement ?? "",
      neighborhood: profile.neighborhood ?? "",
      city: profile.city ?? "",
      state: profile.state ?? "",
    });
  }, [companyProfileQuery.data, resetProfile]);

  useEffect(() => {
    const preferences = companyPreferencesQuery.data;

    if (!preferences) {
      return;
    }

    resetPreferences({
      currency: preferences.currency,
      date_format: preferences.date_format,
      timezone: preferences.timezone,
      default_page: preferences.default_page,
    });
  }, [companyPreferencesQuery.data, resetPreferences]);

  const onSubmitProfile = async (
    data: CompanyProfileSchema,
  ) => {
    await saveProfileMutation.mutateAsync(data);

    resetProfile(data);
  };

  const onSubmitPreferences = async (
    data: CompanyPreferencesSchema,
  ) => {
    await savePreferencesMutation.mutateAsync(data);

    resetPreferences(data);
  };

  const isLoading =
    companyProfileQuery.isLoading ||
    companyPreferencesQuery.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />

          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="h-80 animate-pulse rounded-xl border border-gray-200 bg-white" />

        <div className="h-72 animate-pulse rounded-xl border border-gray-200 bg-white" />
      </div>
    );
  }

  if (
    companyProfileQuery.isError ||
    companyPreferencesQuery.isError
  ) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <h2 className="font-semibold text-red-800">
          Não foi possível carregar as configurações
        </h2>

        <p className="mt-1 text-sm text-red-700">
          Tente atualizar a página ou acessar novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Configurações
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Gerencie as informações e preferências do sistema.
        </p>
      </div>

      {/* Perfil da empresa */}
      <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
        <Card
          title="Perfil da empresa"
          description="Informações utilizadas nos dados cadastrais da empresa."
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Building2
                  size={20}
                  className="text-gray-700"
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Dados cadastrais
                </h3>

                <p className="text-xs text-gray-500">
                  Informações básicas da empresa.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                id="name"
                label="Nome da empresa *"
                placeholder="Ex.: Nexo Gestão"
                {...registerProfile("name")}
                error={profileErrors.name?.message}
              />

              <Input
                id="document"
                label="CNPJ / CPF"
                placeholder="00.000.000/0000-00"
                {...registerProfile("document")}
                error={profileErrors.document?.message}
              />

              <Input
                id="email"
                type="email"
                label="E-mail"
                placeholder="contato@empresa.com.br"
                {...registerProfile("email")}
                error={profileErrors.email?.message}
              />

              <Input
                id="phone"
                label="Telefone"
                placeholder="(11) 99999-9999"
                {...registerProfile("phone")}
                error={profileErrors.phone?.message}
              />

              <Input
                id="logo_url"
                label="URL da logo"
                placeholder="https://..."
                {...registerProfile("logo_url")}
                error={profileErrors.logo_url?.message}
                helperText="Opcional. Informe uma URL pública."
              />
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <MapPin
                    size={20}
                    className="text-gray-700"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Endereço
                  </h3>

                  <p className="text-xs text-gray-500">
                    Endereço comercial ou fiscal da empresa.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <Input
                  id="zip_code"
                  label="CEP"
                  placeholder="00000-000"
                  {...registerProfile("zip_code")}
                  error={profileErrors.zip_code?.message}
                />

                <div className="md:col-span-2">
                  <Input
                    id="address"
                    label="Endereço"
                    placeholder="Rua, avenida..."
                    {...registerProfile("address")}
                    error={profileErrors.address?.message}
                  />
                </div>

                <Input
                  id="number"
                  label="Número"
                  placeholder="123"
                  {...registerProfile("number")}
                  error={profileErrors.number?.message}
                />

                <Input
                  id="complement"
                  label="Complemento"
                  placeholder="Sala, conjunto..."
                  {...registerProfile("complement")}
                  error={profileErrors.complement?.message}
                />

                <Input
                  id="neighborhood"
                  label="Bairro"
                  placeholder="Centro"
                  {...registerProfile("neighborhood")}
                  error={profileErrors.neighborhood?.message}
                />

                <Input
                  id="city"
                  label="Cidade"
                  placeholder="São Paulo"
                  {...registerProfile("city")}
                  error={profileErrors.city?.message}
                />

                <Input
                  id="state"
                  label="Estado"
                  placeholder="SP"
                  maxLength={2}
                  {...registerProfile("state")}
                  error={profileErrors.state?.message}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
              {saveProfileMutation.isError && (
                <p className="mr-auto text-sm text-red-600">
                  Não foi possível salvar os dados da empresa.
                </p>
              )}

              {saveProfileMutation.isSuccess &&
                !profileIsDirty && (
                  <p className="mr-auto text-sm text-green-600">
                    Dados da empresa salvos com sucesso.
                  </p>
                )}

              <Button
                type="submit"
                loading={saveProfileMutation.isPending}
                disabled={
                  !profileIsDirty ||
                  saveProfileMutation.isPending
                }
                className="w-full sm:w-auto"
              >
                <Save size={16} />
                Salvar perfil
              </Button>
            </div>
          </div>
        </Card>
      </form>

      {/* Preferências */}
      <form
        onSubmit={handleSubmitPreferences(
          onSubmitPreferences,
        )}
      >
        <Card
          title="Preferências"
          description="Defina como o Nexo Gestão deve apresentar e operar algumas informações."
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Settings2
                  size={20}
                  className="text-gray-700"
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Preferências do sistema
                </h3>

                <p className="text-xs text-gray-500">
                  Essas configurações ficam salvas para sua empresa.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Moeda */}
              <div>
                <label
                  htmlFor="currency"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Moeda
                </label>

                <select
                  id="currency"
                  {...registerPreferences("currency")}
                  className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100 ${preferenceErrors.currency
                      ? "border-red-500"
                      : "border-gray-300"
                    }`}
                >
                  <option value="BRL">
                    Real brasileiro (R$)
                  </option>

                  <option value="USD">
                    Dólar americano (US$)
                  </option>

                  <option value="EUR">
                    Euro (€)
                  </option>
                </select>

                {preferenceErrors.currency && (
                  <p className="mt-1 text-xs text-red-600">
                    {preferenceErrors.currency.message}
                  </p>
                )}
              </div>

              {/* Formato de data */}
              <div>
                <label
                  htmlFor="date_format"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Formato de data
                </label>

                <select
                  id="date_format"
                  {...registerPreferences("date_format")}
                  className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100 ${preferenceErrors.date_format
                      ? "border-red-500"
                      : "border-gray-300"
                    }`}
                >
                  <option value="DD/MM/YYYY">
                    DD/MM/AAAA
                  </option>

                  <option value="MM/DD/YYYY">
                    MM/DD/AAAA
                  </option>

                  <option value="YYYY-MM-DD">
                    AAAA-MM-DD
                  </option>
                </select>

                {preferenceErrors.date_format && (
                  <p className="mt-1 text-xs text-red-600">
                    {preferenceErrors.date_format.message}
                  </p>
                )}
              </div>

              {/* Fuso horário */}
              <div>
                <label
                  htmlFor="timezone"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Fuso horário
                </label>

                <select
                  id="timezone"
                  {...registerPreferences("timezone")}
                  className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100 ${preferenceErrors.timezone
                      ? "border-red-500"
                      : "border-gray-300"
                    }`}
                >
                  <option value="America/Sao_Paulo">
                    São Paulo (GMT-3)
                  </option>

                  <option value="America/New_York">
                    Nova York (GMT-4/-5)
                  </option>

                  <option value="America/Los_Angeles">
                    Los Angeles (GMT-7/-8)
                  </option>

                  <option value="Europe/London">
                    Londres (GMT+0/+1)
                  </option>

                  <option value="Europe/Lisbon">
                    Lisboa (GMT+0/+1)
                  </option>
                </select>

                {preferenceErrors.timezone && (
                  <p className="mt-1 text-xs text-red-600">
                    {preferenceErrors.timezone.message}
                  </p>
                )}
              </div>

              {/* Página inicial */}
              <div>
                <label
                  htmlFor="default_page"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Página inicial
                </label>

                <select
                  id="default_page"
                  {...registerPreferences("default_page")}
                  className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100 ${preferenceErrors.default_page
                      ? "border-red-500"
                      : "border-gray-300"
                    }`}
                >
                  <option value="/dashboard">
                    Dashboard
                  </option>

                  <option value="/products">
                    Produtos
                  </option>

                  <option value="/customers">
                    Clientes
                  </option>

                  <option value="/orders">
                    Pedidos
                  </option>

                  <option value="/finance">
                    Financeiro
                  </option>
                </select>

                {preferenceErrors.default_page && (
                  <p className="mt-1 text-xs text-red-600">
                    {preferenceErrors.default_page.message}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs leading-5 text-gray-600">
                Essas preferências serão utilizadas pelos módulos do sistema.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
              {savePreferencesMutation.isError && (
                <p className="mr-auto text-sm text-red-600">
                  Não foi possível salvar as preferências.
                </p>
              )}

              {savePreferencesMutation.isSuccess &&
                !preferencesIsDirty && (
                  <p className="mr-auto text-sm text-green-600">
                    Preferências salvas com sucesso.
                  </p>
                )}

              <Button
                type="submit"
                loading={savePreferencesMutation.isPending}
                disabled={
                  !preferencesIsDirty ||
                  savePreferencesMutation.isPending
                }
                className="w-full sm:w-auto"
              >
                <Save size={16} />
                Salvar preferências
              </Button>
            </div>
          </div>
        </Card>
      </form>


      {/* Usuários e permissões */}
      <Card
        title="Usuários e permissões"
        description="Gerencie quem tem acesso à sua organização e quais ações cada pessoa pode realizar."
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <UsersRound
                size={20}
                className="text-gray-700"
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Acesso à organização
              </h3>

              <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
                Convide colaboradores, consulte os usuários da empresa
                e gerencie seus perfis de acesso.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/users")}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
          >
            Gerenciar usuários
            <ArrowRight size={16} />
          </button>
        </div>
      </Card>

    </div>
  );
};

export default Settings;