
import { useState } from "react";

interface InviteUserModalProps {
  roles: Array<{
    id: string;
    name: string;
    slug?: string;
  }>;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (input: {
    name: string;
    email: string;
    roleId: string;
  }) => void;
}

export function InviteUserModal({
  roles,
  isSubmitting,
  onClose,
  onSubmit,
}: InviteUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(
    roles.find((role) => role.slug !== "owner")?.id ?? "",
  );
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      setError("Informe o nome do usuário.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Informe um e-mail válido.");
      return;
    }

    if (!roleId) {
      setError("Selecione um perfil.");
      return;
    }

    if (roles.find((role) => role.id === roleId)?.slug === "owner") {
      setError("Não é permitido convidar outro proprietário.");
      return;
    }

    setError("");
    onSubmit({
      name: normalizedName,
      email: normalizedEmail,
      roleId,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-user-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="invite-user-title"
              className="text-xl font-semibold text-gray-900"
            >
              Convidar usuário
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enviaremos um convite por e-mail.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Fechar"
            className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="invite-name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Nome
            </label>
            <input
              id="invite-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
              disabled={isSubmitting}
              autoComplete="name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Nome do usuário"
            />
          </div>

          <div>
            <label
              htmlFor="invite-email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              E-mail
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={254}
              required
              disabled={isSubmitting}
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="usuario@empresa.com"
            />
          </div>

          <div>
            <label
              htmlFor="invite-role"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Perfil de acesso
            </label>
            <select
              id="invite-role"
              value={roleId}
              onChange={(event) => setRoleId(event.target.value)}
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="" disabled>
                Selecione um perfil
              </option>

              {roles
                .filter((role) => role.slug !== "owner")
                .map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
            </select>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || roles.length === 0}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Enviar convite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
