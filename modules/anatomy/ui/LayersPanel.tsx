"use client";

import { useRef, useState } from "react";
import { LAYER_LABELS } from "../structures/catalog";
import { useViewerStore } from "../store";
import { LAYER_ORDER, type LayerId } from "../types";
import { Icon } from "@/modules/ui/Icon";
import { PanelSection, Slider, StageButton, Toggle } from "@/modules/ui/controls";

/** Camadas desejadas pelo projeto; só as presentes no modelo ficam ativas. */
const WANTED: LayerId[] = ["skin", "muscles", "tendons", "ligaments", "joints", "bones"];

export function LayersPanel({ unavailableNote, compact = false }: { unavailableNote?: Partial<Record<LayerId, string>>; compact?: boolean }) {
  const available = useViewerStore((s) => s.availableLayers);
  const layers = useViewerStore((s) => s.layers);
  const setLayer = useViewerStore((s) => s.setLayer);
  const [peeling, setPeeling] = useState(false);
  const timer = useRef<number | null>(null);

  // Transparência progressiva: pele translúcida → sem pele → músculos
  // translúcidos → só estruturas profundas. Usa apenas camadas reais.
  const peel = () => {
    const st = useViewerStore.getState();
    st.pushHistory();
    const order = LAYER_ORDER.filter((l) => available.includes(l) && l !== "bones" && l !== "joints");
    const steps: Array<() => void> = [];
    for (const l of order) {
      steps.push(() => useViewerStore.getState().setLayer(l, { visible: true, opacity: 0.35 }));
      steps.push(() => useViewerStore.getState().setLayer(l, { visible: false, opacity: 1 }));
    }
    if (!steps.length) return;
    setPeeling(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let i = 0;
    const run = () => {
      steps[i++]();
      if (i < steps.length) timer.current = window.setTimeout(run, reduce ? 50 : 1100);
      else setPeeling(false);
    };
    run();
  };

  const resetLayers = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setPeeling(false);
    const st = useViewerStore.getState();
    st.pushHistory();
    for (const l of LAYER_ORDER) st.setLayer(l, { visible: available.includes(l), opacity: 1 });
    st.showAll();
  };

  return (
    <PanelSection
      title="Camadas"
      aside={
        <div className="flex gap-1.5">
          <StageButton compact icon="spark" title="Transparência progressiva (de fora para dentro)" aria-label="Transparência progressiva" onClick={peel} disabled={peeling} />
          <StageButton compact icon="restart" title="Restaurar camadas" aria-label="Restaurar camadas" onClick={resetLayers} />
        </div>
      }
    >
      <ul className="space-y-2.5">
        {WANTED.map((l) => {
          const ok = available.includes(l);
          const st = layers[l];
          return (
            <li key={l} className={`rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 ${ok ? "" : "opacity-60"}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-palco-texto">{LAYER_LABELS[l].label}</p>
                  {!compact && (
                    <p className="truncate text-[11px] text-palco-suave">
                      {ok ? LAYER_LABELS[l].hint : unavailableNote?.[l] ?? "Não disponível neste modelo"}
                    </p>
                  )}
                </div>
                <Toggle checked={ok && st.visible} disabled={!ok} label={`Mostrar ${LAYER_LABELS[l].label}`} onChange={(v) => setLayer(l, { visible: v })} />
              </div>
              {ok && st.visible && (
                <div className="mt-2 flex items-center gap-2">
                  <Icon name="eye" className="h-3.5 w-3.5 text-palco-suave" />
                  <Slider label={`Opacidade de ${LAYER_LABELS[l].label}`} value={st.opacity} min={0.05} max={1} onChange={(v) => setLayer(l, { opacity: v })} />
                  <span className="w-9 text-right text-[11px] tabular-nums text-palco-suave">{Math.round(st.opacity * 100)}%</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </PanelSection>
  );
}
