import Link from "next/link";
import type { RegionConfig } from "@/modules/anatomy/regions";

/**
 * Alternativa para aparelhos sem WebGL: imagens estáticas renderizadas a
 * partir dos mesmos modelos BodyParts3D (mesma licença e atribuição), com o
 * texto da região. Não simula interatividade 3D.
 */
export function StageFallback({ region }: { region: RegionConfig }) {
  const views = [
    { id: "frente", label: "Vista frontal" },
    { id: "lateral", label: "Vista lateral" },
  ];
  return (
    <div className="flex h-full w-full items-center justify-center overflow-y-auto bg-palco-fundo p-6 pt-24 text-palco-texto">
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.2em] text-landim-ouro">Visualização estática</p>
        <h2 className="mt-2 text-2xl font-semibold">{region.label}</h2>
        <p className="mt-2 text-sm text-palco-suave">
          Este aparelho ou navegador não oferece o recurso 3D (WebGL). Abaixo, imagens estáticas do mesmo modelo anatômico. Para girar e explorar as
          camadas, abra esta página em um computador ou em um celular mais recente.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {views.map((v) => (
            <figure key={v.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/anatomy/previews/${region.slug}-${v.id}.webp`} alt={`${region.label}: ${v.label.toLowerCase()} do modelo anatômico`} className="aspect-square w-full object-cover" />
              <figcaption className="px-3 py-2 text-xs text-palco-suave">{v.label}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed">{region.intro}</p>
        <p className="mt-4 text-[11px] text-palco-suave">
          Imagens geradas a partir de BodyParts3D, © The Database Center for Life Science, CC BY 4.0 (modificado). <Link href="/creditos" className="underline">Créditos</Link>
        </p>
      </div>
    </div>
  );
}
