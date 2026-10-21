import { NextResponse, type NextRequest } from "next/server";
import { STUDIO_COOKIE, studioAuthState, verifySessionToken } from "@/modules/auth/session";

/**
 * Proteção real do Estúdio Gilvan (executa no servidor, antes de qualquer
 * página do estúdio ser entregue). Ocultar links não é proteção: toda rota
 * /estudio/* passa por aqui.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/estudio/entrar")) return NextResponse.next();

  const state = studioAuthState(process.env, req.headers.get("host"));
  if (state === "dev-local") return NextResponse.next();

  if (state === "configured") {
    const ok = await verifySessionToken(req.cookies.get(STUDIO_COOKIE)?.value, process.env.STUDIO_SESSION_SECRET!);
    if (ok) return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/estudio/entrar";
  url.search = state === "not-configured" ? "?estado=nao-configurado" : `?voltar=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/estudio", "/estudio/:path*"],
};
