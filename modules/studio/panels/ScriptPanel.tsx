"use client";

import { ReviewBadge } from "@/modules/brand/ReviewBadge";
import type { Scene } from "@/modules/content/schema";
import { VIDEO_FORMAT_LABELS } from "@/modules/content/schema";
import { getScript } from "@/modules/content/scripts";
import { Notice, PanelSection } from "@/modules/ui/controls";

const EDITORIAL: Record<string, string> = {
  rascunho: "Rascunho",
  "aguardando-revisao-clinica": "Aguardando revisão clínica",
  aprovado: "Aprovado",
  gravado: "Gravado",
  publicado: "Publicado",
};

/** Roteiro da cena e pontos de fala do passo atual (apoio para Gilvan; nada disto vai para o vídeo). */
export function ScriptPanel({ scene, stepIndex }: { scene: Scene | null; stepIndex: number }) {
  if (!scene) return <p className="text-sm text-palco-suave">Escolha uma cena para ver o roteiro.</p>;
  const script = getScript(scene.scriptId);
  const step = scene.steps[stepIndex];
  return (
    <div className="space-y-5 text-sm">
      <PanelSection title={`Agora · ${step.label}`}>
        {step.pending && <Notice tone="pending">{step.pending}</Notice>}
        {step.talkingPoints.length ? (
          <ul className="space-y-2">
            {step.talkingPoints.map((t) => (
              <li key={t} className="rounded-xl border border-landim-ouro/20 bg-landim-ouro/5 px-3 py-2 leading-relaxed text-palco-texto">
                {t}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-palco-suave">{step.publicText ?? "Sem pontos de fala para este passo."}</p>
        )}
      </PanelSection>
      {script && (
        <PanelSection title="Roteiro">
          <dl className="space-y-3">
            <div>
              <dt className="text-[11px] text-palco-suave">Formato</dt>
              <dd>{VIDEO_FORMAT_LABELS[script.videoFormat].label}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-palco-suave">Gancho inicial</dt>
              <dd className="font-medium text-landim-ouroClaro">{script.hook}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-palco-suave">Contexto cotidiano</dt>
              <dd>{script.everydayContext}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-palco-suave">Estruturas a mostrar</dt>
              <dd>{script.structuresToShow.join(" · ")}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-palco-suave">Movimento sugerido</dt>
              <dd>{script.suggestedMovement}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-palco-suave">Texto de apoio</dt>
              <dd>
                <ol className="list-decimal space-y-1 pl-4">
                  {script.supportText.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-palco-suave">Orientação visual</dt>
              <dd>
                <ul className="list-disc space-y-1 pl-4">
                  {script.visualGuidance.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-palco-suave">Encerramento</dt>
              <dd>{script.closing}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-palco-suave">Duração sugerida</dt>
              <dd>
                {script.durationSec[0]}–{script.durationSec[1]} s
              </dd>
            </div>
          </dl>
          {script.notes.length > 0 && (
            <Notice tone="pending">
              {script.notes.map((n) => (
                <span key={n} className="block">
                  {n}
                </span>
              ))}
            </Notice>
          )}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-palco-suave">
            <span className="rounded-full border border-white/10 px-2 py-0.5">Status editorial: {EDITORIAL[script.editorialStatus]}</span>
            <ReviewBadge status={script.clinicalReviewStatus} />
          </div>
        </PanelSection>
      )}
      {scene.coverageNote && <Notice>{scene.coverageNote}</Notice>}
    </div>
  );
}
