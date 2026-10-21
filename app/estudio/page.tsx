import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { STUDIO_COOKIE, studioAuthState, verifySessionToken } from "@/modules/auth/session";
import { StudioApp } from "@/modules/studio/StudioApp";

export const metadata: Metadata = {
  title: "Estúdio Gilvan",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  // Segunda verificação no servidor (além do middleware): a página do estúdio
  // nunca é entregue sem sessão válida ou fora do modo local de desenvolvimento.
  const state = studioAuthState(process.env, headers().get("host"));
  if (state === "not-configured") redirect("/estudio/entrar?estado=nao-configurado");
  if (state === "configured") {
    const ok = await verifySessionToken(cookies().get(STUDIO_COOKIE)?.value, process.env.STUDIO_SESSION_SECRET!);
    if (!ok) redirect("/estudio/entrar?voltar=/estudio");
  }
  return <StudioApp authMode={state} />;
}
