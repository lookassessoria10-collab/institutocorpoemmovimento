"use client";

import { getMotion, motionsForModel, PENDING_MOTIONS, type MotionDefinition } from "../kinematics/motions";
import { trackAngles } from "../kinematics/solve";
import { LAYER_LABELS } from "../structures/catalog";
import { useViewerStore } from "../store";
import type { RegionId } from "../types";
import { viewerRuntime } from "../viewer/runtime";
import { ReviewBadge } from "@/modules/brand/ReviewBadge";
import { Icon } from "@/modules/ui/Icon";
import { Notice, PanelSection, Segmented, Slider, StageButton, Toggle } from "@/modules/ui/controls";
import { canShowPublic } from "@/config/app";

export const SPEEDS = [
  { value: 0.25, label: "0,25×" },
  { value: 0.5, label: "0,5×" },
  { value: 1, label: "1×" },
];

export function selectMotion(m: MotionDefinition | null, cameraPreset?: string) {
  const st = useViewerStore.getState();
  viewerRuntime.animationTime = 0;
  st.setAnimation({ id: m?.id ?? null, time: 0, playing: false });
  if (m && cameraPreset) st.requestCamera(cameraPreset);
}

/** Linha do tempo do movimento: reproduzir, pausar, reiniciar, velocidade, ciclo e avanço manual. */
export function MotionTimeline({ dense = false }: { dense?: boolean }) {
  const anim = useViewerStore((s) => s.animation);
  const setAnimation = useViewerStore((s) => s.setAnimation);
  const motion = getMotion(anim.id);
  if (!motion) return null;
  const angles = trackAngles(motion, anim.time);

  const toggle = () => {
    if (anim.playing) setAnimation({ playing: false });
    else {
      if (!anim.loop && anim.time >= 1) {
        viewerRuntime.animationTime = 0;
        setAnimation({ time: 0 });
      } else viewerRuntime.animationTime = anim.time;
      setAnimation({ playing: true });
    }
  };
  const seek = (t: number) => {
    viewerRuntime.animationTime = t;
    setAnimation({ playing: false, time: t });
  };

  return (
    <div className={`flex ${dense ? "flex-row flex-wrap items-center gap-3" : "flex-col gap-3"}`}>
      <div className="flex items-center gap-2">
        <StageButton compact icon={anim.playing ? "pause" : "play"} aria-label={anim.playing ? "Pausar" : "Reproduzir"} title={anim.playing ? "Pausar" : "Reproduzir"} onClick={toggle} active={anim.playing} />
        <StageButton compact icon="restart" aria-label="Reiniciar" title="Reiniciar" onClick={() => seek(0)} />
        <Segmented label="Velocidade" options={SPEEDS} value={anim.speed} onChange={(v) => setAnimation({ speed: v })} />
        <span className="ml-1 inline-flex items-center gap-1.5 text-xs text-palco-suave">
          <Toggle checked={anim.loop} label="Repetir em ciclo" onChange={(v) => setAnimation({ loop: v })} />
          Ciclo
        </span>
      </div>
      <div className={`flex items-center gap-3 ${dense ? "min-w-[240px] flex-1" : ""}`}>
        <Slider label="Posição do movimento" value={anim.time} min={0} max={1} step={0.001} onChange={seek} />
        <span className="w-12 text-right text-xs tabular-nums text-palco-suave">{Math.round(anim.time * 100)}%</span>
      </div>
      <p className="text-[11px] text-palco-suave">
        {angles.map((a) => `${a.label}: ${Math.round(a.deg)}°`).join(" · ")}
        <span className="ml-1 opacity-70">(ângulo demonstrativo)</span>
      </p>
    </div>
  );
}

/** Escolha do movimento + linha do tempo + informações e limites. */
export function MotionPanel({
  modelId,
  region,
  cameraPreset,
  publicMode = false,
}: {
  modelId: string;
  region: RegionId;
  cameraPreset?: string;
  publicMode?: boolean;
}) {
  const animId = useViewerStore((s) => s.animation.id);
  const motions = motionsForModel(modelId).filter((m) => !publicMode || canShowPublic(m.reviewStatus));
  const pending = PENDING_MOTIONS.filter((p) => p.region === region);
  const current = getMotion(animId);

  return (
    <div className="space-y-5">
      <PanelSection title="Movimentos disponíveis">
        {motions.length ? (
          <ul className="space-y-1.5">
            {motions.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => selectMotion(animId === m.id ? null : m, cameraPreset)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    animId === m.id ? "border-landim-ouro/60 bg-landim-ouro/10" : "border-white/5 bg-white/[0.03] hover:border-white/15"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2 text-sm font-medium text-palco-texto">
                    {m.title}
                    <Icon name={animId === m.id ? "close" : "play"} className="h-3.5 w-3.5 text-palco-suave" />
                  </span>
                  <span className="mt-0.5 block text-xs text-palco-suave">{m.publicDescription}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-palco-suave">Nenhum movimento validado para este modelo ainda.</p>
        )}
      </PanelSection>

      {current && (
        <PanelSection title="Linha do tempo">
          <MotionTimeline />
          <Notice>
            Durante o movimento, {current.hiddenLayersWhileMoving.map((l) => LAYER_LABELS[l].label.toLowerCase()).join(", ")} ficam ocultos: neste acervo
            essas camadas não se deformam.
          </Notice>
          <details className="group rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-palco-suave">
            <summary className="cursor-pointer select-none text-palco-texto">Sobre este movimento</summary>
            <p className="mt-2">{current.rangeNote}</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {current.limitations.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <p className="mt-2 font-medium text-palco-texto">Referências</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {current.references.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </details>
          <ReviewBadge status={current.reviewStatus} />
        </PanelSection>
      )}

      {pending.length > 0 && (
        <PanelSection title="Em preparação">
          <ul className="space-y-1.5">
            {pending.map((p) => (
              <li key={p.id}>
                <Notice tone="pending">
                  <span className="font-medium">{p.title}.</span> {p.reason}
                </Notice>
              </li>
            ))}
          </ul>
        </PanelSection>
      )}
    </div>
  );
}
