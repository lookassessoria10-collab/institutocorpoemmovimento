import { NextResponse, type NextRequest } from "next/server";
import { verifyPassword } from "@/modules/auth/password";
import { STUDIO_COOKIE, createSessionToken, isSecretUsable, sessionTtlMs } from "@/modules/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Limite simples de tentativas por IP nesta instância. Em produção,
// complemente com as regras de rate limit do Vercel Firewall (ver
// docs/12-publicacao.md).
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 6;
const WINDOW_MS = 15 * 60_000;

function safeRedirectPath(value: FormDataEntryValue | null): string {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/estudio") && !v.startsWith("//") ? v : "/estudio";
}

export async function POST(req: NextRequest) {
  const hash = process.env.STUDIO_PASSWORD_HASH;
  const secret = process.env.STUDIO_SESSION_SECRET;
  const back = new URL("/estudio/entrar", req.url);

  if (!hash || !isSecretUsable(secret)) {
    back.searchParams.set("estado", "nao-configurado");
    return NextResponse.redirect(back, 303);
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.until > now && entry.count >= MAX_ATTEMPTS) {
    back.searchParams.set("erro", "bloqueado");
    return NextResponse.redirect(back, 303);
  }

  const form = await req.formData();
  const password = String(form.get("senha") || "");
  const target = safeRedirectPath(form.get("voltar"));

  // Atraso fixo: reduz o ritmo de tentativas automatizadas.
  await new Promise((r) => setTimeout(r, 400));
  const ok = password.length > 0 && (await verifyPassword(password, hash));

  if (!ok) {
    const fresh = !entry || entry.until <= now;
    attempts.set(ip, { count: fresh ? 1 : entry!.count + 1, until: fresh ? now + WINDOW_MS : entry!.until });
    back.searchParams.set("erro", "senha");
    back.searchParams.set("voltar", target);
    return NextResponse.redirect(back, 303);
  }

  attempts.delete(ip);
  const ttl = sessionTtlMs();
  const res = NextResponse.redirect(new URL(target, req.url), 303);
  res.cookies.set(STUDIO_COOKIE, await createSessionToken(secret, ttl), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: Math.floor(ttl / 1000),
  });
  return res;
}
