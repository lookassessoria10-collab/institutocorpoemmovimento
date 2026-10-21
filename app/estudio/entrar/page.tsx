import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { LandimLogo } from "@/modules/brand/LandimLogo";
import { Wordmark } from "@/modules/brand/Wordmark";
import { studioAuthState } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Estúdio Gilvan · acesso",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  senha: "Senha incorreta.",
  bloqueado: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
};

export default function StudioLoginPage({
  searchParams,
}: {
  searchParams: { erro?: string; voltar?: string; estado?: string; saiu?: string };
}) {
  const state = studioAuthState(process.env, headers().get("host"));
  const notConfigured = state === "not-configured" || searchParams.estado === "nao-configurado";
  const voltar = searchParams.voltar?.startsWith("/estudio") ? searchParams.voltar : "/estudio";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-palco-fundo px-4 py-10 text-palco-texto">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-start gap-6">
          <LandimLogo tone="dark" className="h-6 w-auto" />
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-landim-ouro">Estúdio Gilvan</p>
            <Wordmark tone="dark" size="md" />
          </div>
        </div>

        {notConfigured && state !== "dev-local" ? (
          <div className="rounded-2xl border border-palco-borda bg-palco-painel p-5 text-sm leading-relaxed text-palco-suave">
            <p className="mb-2 font-semibold text-palco-texto">Acesso ao estúdio ainda não configurado.</p>
            <p>
              Defina <code className="text-landim-ouroClaro">STUDIO_PASSWORD_HASH</code> e{" "}
              <code className="text-landim-ouroClaro">STUDIO_SESSION_SECRET</code> nas variáveis de ambiente do servidor
              (ver <code>docs/12-publicacao.md</code>). Até lá, o estúdio permanece bloqueado nesta publicação.
            </p>
          </div>
        ) : state === "dev-local" ? (
          <div className="rounded-2xl border border-palco-borda bg-palco-painel p-5 text-sm text-palco-suave">
            <p className="mb-3">
              Ambiente local de desenvolvimento sem senha configurada: o acesso está liberado apenas nesta máquina
              (localhost).
            </p>
            <Link href="/estudio" className="inline-flex rounded-full bg-landim-ouro px-5 py-2.5 font-semibold text-landim-roxo950">
              Abrir o estúdio
            </Link>
          </div>
        ) : (
          <form method="post" action="/api/estudio/login" className="space-y-4">
            <input type="hidden" name="voltar" value={voltar} />
            <label className="block">
              <span className="mb-1.5 block text-sm text-palco-suave">Senha de acesso</span>
              <input
                type="password"
                name="senha"
                required
                autoComplete="current-password"
                autoFocus
                className="w-full rounded-xl border border-palco-borda bg-palco-painel px-4 py-3 text-palco-texto outline-none focus:border-landim-ouro"
              />
            </label>
            {searchParams.erro && ERRORS[searchParams.erro] && (
              <p role="alert" className="text-sm text-red-300">
                {ERRORS[searchParams.erro]}
              </p>
            )}
            {searchParams.saiu && <p className="text-sm text-palco-suave">Sessão encerrada.</p>}
            <button
              type="submit"
              className="w-full rounded-full bg-landim-ouro px-6 py-3 font-semibold text-landim-roxo950 transition-colors hover:bg-landim-ouroClaro"
            >
              Entrar
            </button>
            <p className="text-xs leading-relaxed text-palco-suave">
              Área restrita à produção de conteúdos do Instituto Landim. Gravações ficam apenas neste computador.
            </p>
          </form>
        )}

        <Link href="/" className="mt-10 inline-block text-sm text-palco-suave underline-offset-4 hover:underline">
          ← Voltar ao atlas público
        </Link>
      </div>
    </main>
  );
}
