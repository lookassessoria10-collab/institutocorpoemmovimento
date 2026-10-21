import type { Metadata } from "next";
import Link from "next/link";
import { MODELS, sourceOf } from "@/modules/anatomy/assets/registry";
import { MOTIONS } from "@/modules/anatomy/kinematics/motions";
import { LandimLogo } from "@/modules/brand/LandimLogo";
import { SiteFooter } from "@/modules/atlas/SiteFooter";

export const metadata: Metadata = { title: "Créditos e licenças dos modelos" };

/**
 * Atribuição exigida pela licença CC BY 4.0 do BodyParts3D, indicação das
 * modificações e procedência de cada modelo publicado.
 */
export default function CreditsPage() {
  const models = Object.values(MODELS);
  const source = sourceOf(models[0]);
  return (
    <>
      <main className="min-h-dvh bg-landim-creme text-landim-texto">
        <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 sm:px-10">
          <Link href="/" aria-label="Início">
            <LandimLogo className="h-7 w-auto" />
          </Link>
          <Link href="/atlas" className="text-sm font-medium text-landim-roxo700 hover:underline">
            Regiões do corpo
          </Link>
        </header>
        <article className="mx-auto max-w-5xl space-y-10 break-words px-4 pb-20 [overflow-wrap:anywhere] sm:px-10">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-landim-ouroTitulo">Corpo em Movimento</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-landim-roxo700 sm:text-4xl">Créditos e licenças</h1>
            <p className="mt-4 max-w-3xl text-landim-suave">
              Todos os modelos anatômicos deste atlas vêm de uma única fonte científica, com licença que permite uso institucional e adaptação, mediante
              atribuição.
            </p>
          </header>

          <section className="rounded-landim border border-landim-linha bg-white p-4 sm:p-6">
            <h2 className="text-xl font-bold text-landim-roxo700">{source.name}</h2>
            <p className="mt-3 rounded-xl bg-landim-creme2 px-4 py-3 font-medium">{source.attribution}</p>
            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-y-3">
              <dt className="mt-2 font-semibold sm:mt-0">Autor</dt>
              <dd>{source.author}</dd>
              <dt className="mt-2 font-semibold sm:mt-0">Origem</dt>
              <dd>{source.origin}</dd>
              <dt className="mt-2 font-semibold sm:mt-0">Licença da fonte</dt>
              <dd>
                {source.license} —{" "}
                <a href={source.licenseUrl} className="text-landim-roxo700 underline">
                  página oficial da licença
                </a>{" "}
                ·{" "}
                <a href="https://creativecommons.org/licenses/by/4.0/deed.pt_BR" className="text-landim-roxo700 underline">
                  CC BY 4.0
                </a>
              </dd>
              <dt className="mt-2 font-semibold sm:mt-0">Download</dt>
              <dd>
                <a href={source.url} className="text-landim-roxo700 underline">
                  {source.url}
                </a>
              </dd>
              <dt className="mt-2 font-semibold sm:mt-0">Modelos derivados</dt>
              <dd>
                Os arquivos 3D publicados por este atlas são distribuídos sob{" "}
                <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.pt_BR" className="text-landim-roxo700 underline">
                  CC BY-SA 4.0
                </a>
                . {source.shareAlike}
              </dd>
              <dt className="mt-2 font-semibold sm:mt-0">Modificações feitas</dt>
              <dd>
                <ul className="list-disc space-y-1 pl-5">
                  {source.modifications.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </dd>
              <dt className="mt-2 font-semibold sm:mt-0">Verificado em</dt>
              <dd>{new Date(source.verifiedAt + "T12:00:00").toLocaleDateString("pt-BR")}</dd>
            </dl>
          </section>

          <section>
            <h2 className="text-xl font-bold text-landim-roxo700">Modelos publicados</h2>
            <div className="mt-4 overflow-x-auto rounded-landim border border-landim-linha bg-white">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-landim-creme2 text-xs uppercase tracking-wider text-landim-suave">
                  <tr>
                    <th className="px-4 py-3">Modelo</th>
                    <th className="px-4 py-3">Estruturas</th>
                    <th className="px-4 py-3">Triângulos</th>
                    <th className="px-4 py-3">Arquivo</th>
                    <th className="px-4 py-3">SHA-256</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m) => (
                    <tr key={m.id} className="border-t border-landim-linha align-top">
                      <td className="px-4 py-3 font-medium">{m.title}</td>
                      <td className="px-4 py-3">{m.structures.length}</td>
                      <td className="px-4 py-3">{m.triangles.toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3">
                        <a href={m.file} className="text-landim-roxo700 underline">
                          {(m.bytes / 1024 / 1024).toFixed(2)} MB
                        </a>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-landim-suave">{m.sha256.slice(0, 16)}…</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-landim-roxo700">Limitações conhecidas</h2>
            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-landim-suave">
              {[...new Set(models.flatMap((m) => m.limitations))].map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-landim-roxo700">Movimentos e referências</h2>
            <p className="mt-2 text-sm text-landim-suave">
              Os movimentos são demonstrações com amplitudes de referência citadas abaixo; não representam medidas de pacientes e aguardam revisão clínica.
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {MOTIONS.map((m) => (
                <li key={m.id} className="rounded-xl border border-landim-linha bg-white p-4">
                  <p className="font-semibold">{m.title}</p>
                  <p className="mt-1 text-landim-suave">{m.rangeNote}</p>
                  <ul className="mt-2 list-disc pl-5 text-xs text-landim-suave">
                    {m.references.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          <section className="text-sm text-landim-suave">
            <h2 className="text-xl font-bold text-landim-roxo700">Marca e tipografia</h2>
            <p className="mt-2">
              Marca Instituto Landim e campanha Histórias de Volta: arquivos oficiais do Instituto. Fontes Outfit, Fraunces e Great Vibes (SIL Open Font
              License), carregadas pelo Google Fonts.
            </p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
