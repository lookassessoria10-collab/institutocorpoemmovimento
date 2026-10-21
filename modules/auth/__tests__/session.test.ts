import { randomBytes, scryptSync } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { createSessionToken, studioAuthState, verifySessionToken } from "../session";

vi.mock("server-only", () => ({}));

const SECRET = "x".repeat(40);

describe("sessão do estúdio", () => {
  it("token válido é aceito e alterado é recusado", async () => {
    const t = await createSessionToken(SECRET, 60_000);
    expect(await verifySessionToken(t, SECRET)).toBe(true);
    const tampered = t.slice(0, -2) + (t.endsWith("AA") ? "BB" : "AA");
    expect(await verifySessionToken(tampered, SECRET)).toBe(false);
    expect(await verifySessionToken(t, "y".repeat(40))).toBe(false);
  });

  it("token expirado é recusado", async () => {
    const t = await createSessionToken(SECRET, 1000, Date.now() - 5000);
    expect(await verifySessionToken(t, SECRET)).toBe(false);
  });

  it("sem configuração, o estúdio só abre em desenvolvimento e em localhost", () => {
    expect(studioAuthState({ NODE_ENV: "development" }, "localhost:3000")).toBe("dev-local");
    expect(studioAuthState({ NODE_ENV: "development" }, "192.168.0.10:3000")).toBe("not-configured");
    expect(studioAuthState({ NODE_ENV: "production" }, "localhost:3000")).toBe("not-configured");
    expect(studioAuthState({ NODE_ENV: "production", STUDIO_PASSWORD_HASH: "h", STUDIO_SESSION_SECRET: SECRET }, "x.vercel.app")).toBe("configured");
    expect(studioAuthState({ NODE_ENV: "production", STUDIO_PASSWORD_HASH: "h", STUDIO_SESSION_SECRET: "curto" }, "x.vercel.app")).toBe("not-configured");
  });

  it("verificação de senha com scrypt (formato gerado pelo script)", async () => {
    const { verifyPassword } = await import("../password");
    const salt = randomBytes(16);
    const hash = scryptSync("senha-forte-de-teste", salt, 32, { N: 16384, r: 8, p: 1 });
    const stored = `scrypt$16384$8$1$${salt.toString("base64")}$${hash.toString("base64")}`;
    expect(await verifyPassword("senha-forte-de-teste", stored)).toBe(true);
    expect(await verifyPassword("senha-errada", stored)).toBe(false);
    expect(await verifyPassword("x", "formato-invalido")).toBe(false);
  });
});
