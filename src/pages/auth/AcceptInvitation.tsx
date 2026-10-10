
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  CheckCircle2,
  LoaderCircle,
  XCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthContext";

type PageStatus = "loading" | "success" | "error";

export function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [status, setStatus] = useState<PageStatus>("loading");
  const [message, setMessage] = useState(
    "Validando seu convite...",
  );

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function acceptInvitation() {
      try {
        const invitationId = searchParams.get("invitation");
        const tokenHash = searchParams.get("token_hash");
        const tokenType = searchParams.get("type");
        const authCode = searchParams.get("code");

        if (!invitationId) {
          throw new Error(
            "O link não contém um identificador de convite válido.",
          );
        }

        // Fluxo de confirmação por token_hash.
        if (tokenHash && tokenType === "invite") {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "invite",
          });

          if (error) throw error;
        } else if (authCode) {
          // Fluxo PKCE: troca o código pela sessão autenticada.
          const { error } =
            await supabase.auth.exchangeCodeForSession(authCode);

          if (error) throw error;
        }

        // Busca a sessão atualizada após processar o retorno.
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const authenticatedUser = session?.user ?? user;

        if (!authenticatedUser) {
          const returnTo =
            `/accept-invitation?invitation=${encodeURIComponent(invitationId)}`;

          navigate(
            `/login?returnTo=${encodeURIComponent(returnTo)}`,
            { replace: true },
          );

          return;
        }

        const { data, error } = await supabase.rpc(
          "accept_organization_invitation",
          { p_invitation_id: invitationId },
        );

        if (error) throw error;

        if (!data?.success) {
          throw new Error(
            "O convite não pôde ser aceito.",
          );
        }

        if (cancelled) return;

        setStatus("success");
        setMessage(
          "Convite aceito! Seu acesso à organização foi liberado.",
        );

        window.setTimeout(() => {
          if (!cancelled) {
            navigate("/dashboard", { replace: true });
          }
        }, 1800);
      } catch (error) {
        if (cancelled) return;

        setStatus("error");

        setMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível validar o convite.",
        );
      }
    }

    void acceptInvitation();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, searchParams, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        {status === "loading" && (
          <LoaderCircle
            className="mx-auto mb-4 animate-spin text-blue-600"
            size={36}
          />
        )}

        {status === "success" && (
          <CheckCircle2
            className="mx-auto mb-4 text-green-600"
            size={36}
          />
        )}

        {status === "error" && (
          <XCircle
            className="mx-auto mb-4 text-red-600"
            size={36}
          />
        )}

        <h1 className="text-xl font-bold text-slate-900">
          {status === "success"
            ? "Convite aceito"
            : status === "error"
              ? "Não foi possível aceitar"
              : "Aceitando convite"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {message}
        </p>

        {status === "error" && (
          <Link
            to="/login"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Ir para o login
          </Link>
        )}
      </section>
    </main>
  );
}
