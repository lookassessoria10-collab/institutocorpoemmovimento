// Gera o valor de STUDIO_PASSWORD_HASH a partir de uma senha.
// Uso: npm run studio:hash-password -- "sua-senha-forte"
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error("Informe uma senha com pelo menos 12 caracteres.");
  process.exit(1);
}
const N = 16384, r = 8, p = 1;
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 32, { N, r, p });
console.log(`STUDIO_PASSWORD_HASH=scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${hash.toString("base64")}`);
console.log(`STUDIO_SESSION_SECRET=${randomBytes(48).toString("base64url")}`);
