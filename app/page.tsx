import Link from "next/link";
import { APP_CONFIG } from "@/config/app";
import { AVAILABLE_REGIONS, REGIONS } from "@/modules/anatomy/regions";
import { HomeHero } from "@/modules/atlas/HomeHero";
import { SiteFooter } from "@/modules/atlas/SiteFooter";
import { QuestionList } from "@/modules/atlas/QuestionList";

export default function HomePage() {
  const planned = REGIONS.filter((r) => r.status === "planejada");
  return (
    <>
      <HomeHero />

      <main className="bg-landim-creme text-landim-texto">
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-10 sm:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-landim-ouroTitulo">Atlas por regiões</p>
          <h2 className="mt-3 max-w-2xl text-[1.7rem] font-bold leading-tight tracking-tight text-landim-roxo700 sm:text-4xl">Escolha uma região e explore em camadas.</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 lg:grid-cols-4">
            {AVAILABLE_REGIONS.map((r) => (
              <Link
                key={r.id}
                href={`/atlas/${r.slug}`}
                className="group overflow-hidden rounded-landim border border-landim-linha bg-white shadow-suave transition-shadow hover:shadow-landim"
              >
                <div className="aspect-[4/5] overflow-hidden bg-palco-fundo">
                  {/* Imagem renderizada do próprio modelo anatômico da região */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/anatomy/previews/${r.slug}-capa.webp`}
                    alt={`Modelo anatômico da região: ${r.label}`}
                    className="h-full w-full object-cover transition-transform duration-700 ease-suave group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
                <div className="p-3.5 sm:p-5">
                  <h3 className="text-lg font-bold text-landim-roxo700 sm:text-xl">{r.label}</h3>
                  <p className="mt-1 text-xs leading-snug text-landim-suave sm:text-sm">{r.tagline}</p>
                  <span className="mt-3 inline-block text-sm font-semibold text-landim-ouroTexto group-hover:underline sm:mt-4">Explorar →</span>
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-sm text-landim-suave">
            Em preparação: {planned.map((r) => r.label).join(", ")}.
          </p>
        </section>

        <section className="bg-landim-creme2">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-10 sm:py-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-landim-ouroTitulo">Dúvidas do dia a dia</p>
            <h2 className="mt-3 text-[1.7rem] font-bold leading-tight tracking-tight text-landim-roxo700 sm:text-4xl">O que você quer entender melhor?</h2>
            <p className="mt-3 max-w-2xl text-landim-suave">
              Cada pergunta abre a região do corpo, posiciona o modelo e apresenta uma explicação geral. As explicações não são diagnóstico: sintomas
              parecidos podem ter causas diferentes.
            </p>
            <QuestionList className="mt-10" />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-10 sm:py-24">
          <h2 className="text-3xl font-bold tracking-tight text-landim-roxo700">Como funciona</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ["Escolha uma região", "Ombro, joelho, coluna ou quadril: cada região tem seu próprio modelo anatômico."],
              ["Gire, aproxime e atravesse as camadas", "Pele, músculos e ossos aparecem conforme o que o modelo realmente possui. Toque em uma estrutura para saber o que ela faz."],
              ["Veja movimentos e explicações", "Movimentos demonstrativos mostram como as articulações participam de gestos do dia a dia."],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-landim border border-landim-linha bg-white p-6">
                <span className="font-serif text-3xl text-landim-ouroTitulo">{i + 1}</span>
                <h3 className="mt-3 text-lg font-bold text-landim-roxo700">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-landim-suave">{d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 rounded-landim border border-landim-linha bg-white p-6 text-sm leading-relaxed text-landim-suave">
            <p>
              <strong className="text-landim-texto">Sobre os modelos.</strong> As estruturas vêm do BodyParts3D, um acervo científico de anatomia 3D
              baseado em um corpo de referência adulto. Algumas estruturas (como ligamentos e meniscos) ainda não fazem parte do acervo e aparecem como
              indisponíveis. Os textos estão em revisão pela equipe clínica do Instituto Landim.{" "}
              <Link href="/creditos" className="font-medium text-landim-roxo700 underline">
                Créditos e licenças
              </Link>
            </p>
          </div>
        </section>

        <section className="bg-landim-roxo700 text-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 sm:px-10 md:grid-cols-2">
            <a href={APP_CONFIG.links.historias} className="rounded-landim border border-white/15 p-6 transition-colors hover:border-landim-ouro">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-landim-ouro">Campanha</p>
              <h3 className="mt-2 text-2xl font-bold">
                Histórias <span className="font-script text-3xl font-normal text-landim-ouro">de Volta</span>
              </h3>
              <p className="mt-2 text-white/75">Experiências reais de pacientes que voltaram às suas atividades.</p>
            </a>
            <div className="rounded-landim border border-white/15 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-landim-ouro">Movimentos</p>
              <h3 className="mt-2 text-2xl font-bold">Movimentos de Volta</h3>
              <p className="mt-2 text-white/75">Biblioteca de movimentos cotidianos, com observação opcional pela câmera.</p>
              {APP_CONFIG.links.movimentos ? (
                <a href={APP_CONFIG.links.movimentos} className="mt-4 inline-block font-semibold text-landim-ouro hover:underline">
                  Acessar →
                </a>
              ) : (
                <p className="mt-4 text-sm text-white/55">Em breve.</p>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
