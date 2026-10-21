import Link from "next/link";
import { canShowPublic } from "@/config/app";
import { regionById } from "@/modules/anatomy/regions";
import { QUESTIONS } from "@/modules/content/questions";
import { getScene } from "@/modules/content/scenes";
import { regionForModel } from "@/modules/content/validate";

/**
 * Perguntas cotidianas → região + cena. O link abre o modelo da cena (que
 * pode ser de outra região temática, ex.: sentar e levantar usa o membro
 * inferior). Só aparecem perguntas cujas cenas podem ser exibidas.
 */
export function QuestionList({ className = "", showAnswers = false }: { className?: string; showAnswers?: boolean }) {
  const items = QUESTIONS.map((q) => {
    const scene = getScene(q.sceneId);
    const region = scene ? regionForModel(scene.modelId) : null;
    return { q, scene, region };
  }).filter((i) => i.scene && i.region && canShowPublic(i.scene.clinicalReviewStatus));

  return (
    <ul className={`grid gap-4 md:grid-cols-2 ${className}`}>
      {items.map(({ q, scene, region }) => (
        <li key={q.id}>
          <Link
            href={`/atlas/${region!.slug}?cena=${scene!.id}`}
            className="group flex h-full flex-col rounded-landim border border-landim-linha bg-white p-5 transition-shadow hover:shadow-landim sm:p-6"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-landim-ouroTitulo">{regionById(q.region)?.label}</span>
            <span className="mt-2 text-lg font-bold leading-snug text-landim-roxo700">{q.text}</span>
            {showAnswers && <span className="mt-3 text-sm leading-relaxed text-landim-suave">{q.shortAnswer}</span>}
            <span className="mt-auto pt-4 text-sm font-semibold text-landim-ouroTexto group-hover:underline">Ver no modelo 3D →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
