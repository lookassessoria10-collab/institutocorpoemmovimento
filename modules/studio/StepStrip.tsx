"use client";

import type { Scene } from "@/modules/content/schema";
import { StageButton } from "@/modules/ui/controls";
import { useStudioStore } from "./store";

/** Passos da cena (linha do tempo editorial): clicar aplica o passo; "Roteiro automático" avança pelas durações. */
export function StepStrip({ scene, compact = false }: { scene: Scene | null; compact?: boolean }) {
  const stepIndex = useStudioStore((s) => s.stepIndex);
  const autoplay = useStudioStore((s) => s.autoplay);
  const set = useStudioStore((s) => s.set);
  if (!scene) return <p className="text-sm text-palco-suave">Exploração livre · escolha uma cena na biblioteca.</p>;
  const go = (i: number) => set({ stepIndex: Math.max(0, Math.min(scene.steps.length - 1, i)) });
  const total = scene.steps.reduce((a, s) => a + s.durationSec, 0);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <StageButton compact icon="chevronLeft" aria-label="Passo anterior" disabled={stepIndex === 0} onClick={() => go(stepIndex - 1)} />
      <ol className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {scene.steps.map((s, i) => (
          <li key={s.id} style={{ flexGrow: compact ? 1 : s.durationSec }} className="min-w-[72px]">
            <button
              type="button"
              onClick={() => go(i)}
              title={s.pending ?? s.caption ?? s.title ?? s.label}
              className={`w-full rounded-lg border px-2 py-1.5 text-left transition-colors ${
                i === stepIndex ? "border-landim-ouro/70 bg-landim-ouro/15" : "border-white/5 bg-white/[0.04] hover:border-white/20"
              }`}
            >
              <span className="block truncate text-[11px] font-medium text-palco-texto">
                {i + 1}. {s.label}
              </span>
              <span className={`block text-[10px] ${s.pending ? "text-clinico-pendente" : "text-palco-suave"}`}>{s.pending ? "pendente" : `${s.durationSec}s`}</span>
            </button>
          </li>
        ))}
      </ol>
      <StageButton compact icon="chevronRight" aria-label="Próximo passo" disabled={stepIndex === scene.steps.length - 1} onClick={() => go(stepIndex + 1)} />
      {!compact && (
        <StageButton
          icon={autoplay ? "pause" : "play"}
          label={autoplay ? "Pausar roteiro" : `Roteiro automático (${total}s)`}
          active={autoplay}
          onClick={() => {
            if (!autoplay && stepIndex === scene.steps.length - 1) set({ stepIndex: 0 });
            set({ autoplay: !autoplay });
          }}
        />
      )}
    </div>
  );
}
