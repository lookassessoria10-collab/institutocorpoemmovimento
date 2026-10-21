/**
 * Sessão do Estúdio Gilvan: token assinado com HMAC-SHA256.
 *
 * Usa apenas Web Crypto (`crypto.subtle`), disponível tanto no middleware
 * (Edge) quanto nas rotas Node, e no Vitest. O segredo vem de
 * STUDIO_SESSION_SECRET, lido somente no servidor — nunca use o prefixo
 * NEXT_PUBLIC_ para ele.
 *
 * Formato: v1.<expiraEmMs>.<nonce>.<assinatura>  (base64url)
 */

export const STUDIO_COOKIE = "cem_estudio";
const VERSION = "v1";

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

/** Comparação em tempo constante para strings de mesmo comprimento. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function isSecretUsable(secret: string | undefined): secret is string {
  return typeof secret === "string" && secret.length >= 32;
}

export async function createSessionToken(secret: string, ttlMs: number, now = Date.now()): Promise<string> {
  const nonce = b64url(crypto.getRandomValues(new Uint8Array(16)));
  const payload = `${VERSION}.${now + ttlMs}.${nonce}`;
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string,
  now = Date.now()
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== VERSION) return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires <= now) return false;
  const payload = parts.slice(0, 3).join(".");
  return safeEqual(parts[3], await hmac(secret, payload));
}

export function sessionTtlMs(): number {
  const hours = Number(process.env.STUDIO_SESSION_HOURS || 12);
  return (Number.isFinite(hours) && hours > 0 ? Math.min(hours, 72) : 12) * 3600_000;
}

export type StudioAuthState = "configured" | "dev-local" | "not-configured";

/**
 * Sem STUDIO_PASSWORD_HASH e STUDIO_SESSION_SECRET válidos, o estúdio só
 * abre em desenvolvimento e apenas para acessos a partir da própria máquina
 * (localhost). Em produção, fica bloqueado.
 */
export function studioAuthState(env: Record<string, string | undefined>, host: string | null): StudioAuthState {
  if (env.STUDIO_PASSWORD_HASH && isSecretUsable(env.STUDIO_SESSION_SECRET)) return "configured";
  const hostname = (host || "").split(":")[0];
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  if (env.NODE_ENV !== "production" && isLocal) return "dev-local";
  return "not-configured";
}
