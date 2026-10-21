import { NextResponse, type NextRequest } from "next/server";
import { STUDIO_COOKIE } from "@/modules/auth/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/estudio/entrar?saiu=1", req.url), 303);
  res.cookies.set(STUDIO_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0, sameSite: "strict" });
  return res;
}
