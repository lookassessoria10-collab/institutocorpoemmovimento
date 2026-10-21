import type { Metadata } from "next";
import Link from "next/link";
import { AVAILABLE_REGIONS, REGIONS } from "@/modules/anatomy/regions";
import { getModel } from "@/modules/anatomy/assets/registry";
import { LandimLogo } from "@/modules/brand/LandimLogo";
import { Wordmark } from "@/modules/brand/Wordmark";
import { SiteFooter } from "@/modules/atlas/SiteFooter";

export const metadata: Metadata = { title: "Regiões do corpo" };

export default function AtlasIndexPage() {
  const planned = REGIONS.filter((r) => r.status === "planejada");
  return (
    <>
      <main className="min-h-dvh bg-palco-fundo text-palco-texto">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-10 sm:py-6">
          <Link href="/" aria-label="Início">
            <LandimLogo tone="dark" className="h-6 w-auto" />
          </Link>
          <Link href="/perguntas" className="text-sm text-palco-suave hover:text-palco-texto">
            Perguntas
          </Link>
        </header>
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-4 sm:px-10">
          <Wordmark tone="dark" size="md" />
          <h1 className="mt-6 text-[1.6rem] font-bold leading-tight sm:text-4xl">Qual parte do corpo você gostaria de conhecer melhor?</h1>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 lg:grid-cols-4">
            {AVAILABLE_REGIONS.map((r) => {
              const m = getModel(r.modelId!);
              return (
                <Link key={r.id} href={`/atlas/${r.slug}`} className="group overflow-hidden rounded-landim border border-white/10 bg-palco-painel transition-colors hover:border-landim-ouro/60">
                  <div className="aspect-[4/5] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/anatomy/previews/${r.slug}-capa.webp`} alt={`Modelo anatômico da região: ${r.label}`} className="h-full w-full object-cover transition-transform duration-700 ease-suave group-hover:scale-[1.03]" />
                  </div>
                  <div className="p-3.5 sm:p-5">
                    <h2 className="text-lg font-semibold sm:text-xl">{r.label}</h2>
                    <p className="mt-1 text-xs leading-snug text-palco-suave sm:text-sm">{r.tagline}</p>
                    <p className="mt-3 text-[11px] text-palco-suave/80">
                      {m.structures.length} estruturas · {(m.bytes / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          <h2 className="mt-14 text-sm font-semibold uppercase tracking-[0.2em] text-palco-suave">Em preparação</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {planned.map((r) => (
              <li key={r.id} className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-palco-suave">
                {r.label}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
