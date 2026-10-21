import { NextResponse, type NextRequest } from "next/server";
import { REGIONS } from "@/modules/anatomy/regions";

/**
 * Atalho para integração com o Movimentos de Volta (Moveo): aceita os ids de
 * região usados lá (shoulder, knee, spine…) ou os nomes em português e
 * redireciona para a página da região, preservando os parâmetros
 * (?cena=, ?estrutura=, ?vista=, ?camada=). Regiões sem modelo voltam para a
 * lista de regiões — nunca para uma página inexistente.
 */
export function GET(req: NextRequest, { params }: { params: { regiao: string } }) {
  const key = params.regiao.toLowerCase();
  const region = REGIONS.find((r) => r.id === key || r.slug === key);
  const url = req.nextUrl.clone();
  url.pathname = region && region.status === "disponivel" ? `/atlas/${region.slug}` : "/atlas";
  return NextResponse.redirect(url, 307);
}
