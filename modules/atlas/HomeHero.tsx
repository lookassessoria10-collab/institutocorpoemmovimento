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
    <section className="relative overflow-hidden bg-palco-fundo text-palco-texto lg:min-h-[100svh]">
      {/* Celular: esqueleto numa faixa própria no topo, texto abaixo (sem sobreposição).
          Desktop: esqueleto à direita, texto à esquerda. */}
      <SkeletonHero highlight={hover} className="relative h-[52svh] min-h-[340px] w-full lg:absolute lg:inset-0 lg:left-[38%] lg:h-auto lg:w-auto" />
      <div className="pointer-events-none absolute inset-x-0 top-[calc(52svh-90px)] hidden h-[90px] bg-gradient-to-b from-transparent to-palco-fundo max-lg:block" />
      <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-palco-fundo via-palco-fundo/40 to-transparent lg:block" />

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-palco-fundo/80 to-transparent px-4 pb-6 pt-4 sm:px-10 sm:pt-7 lg:bg-none">
        <LandimLogo tone="dark" className="h-5 w-auto sm:h-7" />
        <nav className="-mr-2 flex items-center text-sm" aria-label="Navegação principal">
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

      <div className="relative z-10 -mt-6 flex flex-col px-5 pb-12 sm:px-10 lg:mt-0 lg:min-h-[100svh] lg:max-w-[46%] lg:justify-center lg:pb-16 lg:pt-24">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-landim-ouro sm:mb-5 sm:text-[11px] sm:tracking-[0.3em]">Histórias de Volta · Instituto Landim</p>
        <Wordmark tone="dark" size="lg" />
        <h1 className="mt-5 max-w-xl font-serif text-[1.75rem] leading-tight text-white sm:mt-6 sm:text-[2.6rem]">Conheça o corpo por dentro.</h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-palco-texto/85 sm:mt-4 sm:text-base">
          Explore as estruturas envolvidas nos movimentos do dia a dia e entenda, de forma visual, como diferentes regiões do corpo participam das suas
          atividades.
        </p>

        <p className="mt-7 text-sm font-medium text-palco-texto sm:mt-8">Qual parte do corpo você gostaria de conhecer melhor?</p>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {AVAILABLE_REGIONS.map((r) => (
            <li key={r.id}>
              <Link
                href={`/atlas/${r.slug}`}
                onMouseEnter={() => setHover(r.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(r.id)}
                onBlur={() => setHover(null)}
                className="flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-[15px] font-medium text-white backdrop-blur transition-colors hover:border-landim-ouro hover:bg-landim-ouro hover:text-landim-roxo950 sm:inline-flex sm:py-2.5"
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
