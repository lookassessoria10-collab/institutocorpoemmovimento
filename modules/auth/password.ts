import "server-only";
import { scrypt as scryptCb, timingSafeEqual } from "node:crypto";

/**
 * Verificação da senha do estúdio contra STUDIO_PASSWORD_HASH.
 * Formato do hash (gerado por `npm run studio:hash-password`):
 *   scrypt$<N>$<r>$<p>$<saltBase64>$<hashBase64>
 * Só roda no servidor (runtime Node).
 */
export function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return Promise.resolve(false);
  const [, nStr, rStr, pStr, saltB64, hashB64] = parts;
  const N = Number(nStr);
  const r = Number(rStr);
  const p = Number(pStr);
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");
  if (!N || !r || !p || expected.length < 16) return Promise.resolve(false);
  return new Promise((resolve) => {
    scryptCb(password, salt, expected.length, { N, r, p, maxmem: 256 * N * r }, (err, derived) => {
      if (err) return resolve(false);
      resolve(derived.length === expected.length && timingSafeEqual(derived, expected));
    });
  });
}
