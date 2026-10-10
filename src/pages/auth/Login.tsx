
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useAuth } from "@/features/auth/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signIn(email, password);

        const returnTo = searchParams.get("returnTo");

        // Aceita somente caminhos internos da aplicação.
        const safeReturnTo =
          returnTo?.startsWith("/") && !returnTo.startsWith("//")
            ? returnTo
            : null;

        navigate(safeReturnTo ?? "/dashboard", {
          replace: true,
        });
      } else {
        if (name.trim().length < 2) {
          throw new Error("Informe seu nome completo.");
        }

        if (password.length < 6) {
          throw new Error("A senha deve ter pelo menos 6 caracteres.");
        }

        await signUp(email, password, name.trim());

        setSuccessMessage(
          "Conta criada com sucesso. Você já pode entrar.",
        );

        setMode("login");
        setPassword("");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? translateAuthError(error.message)
          : "Não foi possível concluir a operação.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
            NX
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Nexo Gestão
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {mode === "login"
              ? "Entre para acessar sua gestão."
              : "Crie sua conta para começar."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Nome
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                  required
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                E-mail
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                Senha
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  required
                  className={`${inputClass} pl-10 pr-11`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {mode === "signup" && (
                <p className="mt-2 text-xs text-slate-500">
                  Use pelo menos 6 caracteres.
                </p>
              )}
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700"
              >
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm leading-5 text-green-700"
              >
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Aguarde..."
                : mode === "login"
                  ? "Entrar"
                  : "Criar conta"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-5 text-center">
            <p className="text-sm text-slate-500">
              {mode === "login"
                ? "Ainda não tem uma conta?"
                : "Já possui uma conta?"}
            </p>

            <button
              type="button"
              onClick={() => {
                setMode((current) =>
                  current === "login" ? "signup" : "login",
                );
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              {mode === "login"
                ? "Criar conta"
                : "Voltar para o login"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Nexo Gestão • Sistema demonstrativo
        </p>
      </div>
    </main>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function translateAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }

  if (normalized.includes("user already registered")) {
    return "Este e-mail já possui uma conta.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }

  return message;
}
