"use client";

import Link from "next/link";
import { useState } from "react";
import { AVAILABLE_REGIONS } from "@/modules/anatomy/regions";
import type { RegionId } from "@/modules/anatomy/types";
import { LandimLogo } from "@/modules/brand/LandimLogo";
import { Wordmark } from "@/modules/brand/Wordmark";
import { SkeletonHero } from "./SkeletonHero";

export function HomeHero() {
  const [hover, setHover] = useState<RegionId | null>(null);
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-palco-fundo text-palco-texto">
      <SkeletonHero highlight={hover} className="absolute inset-0 lg:left-[38%]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-palco-fundo via-palco-fundo/70 to-transparent lg:via-palco-fundo/40" />

      <header className="relative z-10 flex items-center justify-between px-5 pt-5 sm:px-10 sm:pt-7">
        <LandimLogo tone="dark" className="h-6 w-auto sm:h-7" />
        <nav className="flex items-center gap-1 text-sm" aria-label="Navegação principal">
          <Link href="/atlas" className="rounded-full px-3 py-1.5 text-palco-suave hover:text-palco-texto">
            Regiões
          </Link>
          <Link href="/perguntas" className="rounded-full px-3 py-1.5 text-palco-suave hover:text-palco-texto">
            Perguntas
          </Link>
          <Link href="/creditos" className="hidden rounded-full px-3 py-1.5 text-palco-suave hover:text-palco-texto sm:inline-flex">
            Sobre os modelos
          </Link>
        </nav>
      </header>

      <div className="relative z-10 flex min-h-[calc(100svh-80px)] flex-col justify-end px-5 pb-10 pt-[38svh] sm:px-10 lg:max-w-[46%] lg:justify-center lg:pb-16 lg:pt-10">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-landim-ouro">Histórias de Volta · Instituto Landim</p>
        <Wordmark tone="dark" size="lg" />
        <h1 className="mt-6 max-w-xl font-serif text-3xl leading-tight text-white sm:text-[2.6rem]">Conheça o corpo por dentro.</h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-palco-texto/85">
          Explore as estruturas envolvidas nos movimentos do dia a dia e entenda, de forma visual, como diferentes regiões do corpo participam das suas
          atividades.
        </p>

        <p className="mt-8 text-sm font-medium text-palco-texto">Qual parte do corpo você gostaria de conhecer melhor?</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {AVAILABLE_REGIONS.map((r) => (
            <li key={r.id}>
              <Link
                href={`/atlas/${r.slug}`}
                onMouseEnter={() => setHover(r.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(r.id)}
                onBlur={() => setHover(null)}
                className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-[15px] font-medium text-white backdrop-blur transition-colors hover:border-landim-ouro hover:bg-landim-ouro hover:text-landim-roxo950"
              >
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/perguntas" className="text-landim-ouroClaro underline-offset-4 hover:underline">
            O que você quer entender melhor? →
          </Link>
          <Link href="/atlas" className="text-palco-suave underline-offset-4 hover:text-palco-texto hover:underline">
            Ver todas as regiões
          </Link>
        </div>
      </div>
      <p className="absolute bottom-3 right-4 z-10 hidden text-[10px] text-palco-suave/70 lg:block">
        Esqueleto de referência · BodyParts3D (DBCLS), CC BY 4.0, modificado
      </p>
    </section>
  );
}
