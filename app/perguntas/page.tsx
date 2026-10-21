import type { Metadata } from "next";
import Link from "next/link";
import { APP_CONFIG } from "@/config/app";
import { LandimLogo } from "@/modules/brand/LandimLogo";
import { QuestionList } from "@/modules/atlas/QuestionList";
import { SiteFooter } from "@/modules/atlas/SiteFooter";

export const metadata: Metadata = { title: "O que você quer entender melhor?" };

export default function QuestionsPage() {
  return (
    <>
      <main className="min-h-dvh bg-landim-creme text-landim-texto">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-10">
          <Link href="/" aria-label="Início">
            <LandimLogo className="h-7 w-auto" />
          </Link>
          <Link href="/atlas" className="text-sm font-medium text-landim-roxo700 hover:underline">
            Regiões do corpo
          </Link>
        </header>
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-4 sm:px-10 sm:pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-landim-ouroTitulo">Corpo em Movimento</p>
          <h1 className="mt-3 text-[1.7rem] font-bold leading-tight tracking-tight text-landim-roxo700 sm:text-4xl">O que você quer entender melhor?</h1>
          <p className="mt-4 max-w-2xl text-landim-suave">
            Escolha uma pergunta: o modelo abre na região certa, com uma demonstração passo a passo. Depois, você pode explorar livremente.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-landim-suave">{APP_CONFIG.copy.disclaimer}</p>
          <QuestionList className="mt-10" showAnswers />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
