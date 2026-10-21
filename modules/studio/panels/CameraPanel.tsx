"use client";

import { VIEW_LABELS } from "@/modules/anatomy/camera/framing";
import type { RegionConfig } from "@/modules/anatomy/regions";
import { useViewerStore } from "@/modules/anatomy/store";
import { zoomBy } from "@/modules/anatomy/viewer/CameraDirector";
import type { Scene } from "@/modules/content/schema";
import { PanelSection, Slider, StageButton } from "@/modules/ui/controls";

/** Presets de enquadramento (os da cena primeiro), duração da transição e zoom. */
export function CameraPanel({ region, scene }: { region: RegionConfig; scene: Scene | null }) {
  const current = useViewerStore((s) => s.camera.presetId);
  const transitionMs = useViewerStore((s) => s.transitionMs);
  const setTransitionMs = useViewerStore((s) => s.setTransitionMs);
  const requestCamera = useViewerStore((s) => s.requestCamera);
  const sceneIds = new Set(scene?.cameraPresets ?? []);
  const scenePresets = region.cameraPresets.filter((p) => sceneIds.has(p.id));
  const others = region.cameraPresets.filter((p) => !sceneIds.has(p.id));

  const list = (items: typeof region.cameraPresets, numbered: boolean) => (
    <div className="grid grid-cols-1 gap-1.5">
      {items.map((p, i) => (
        <button
          key={p.id}
          type="button"
          onClick={() => requestCamera(p.id)}
          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-[13px] transition-colors ${
            current === p.id ? "border-landim-ouro/60 bg-landim-ouro/10 text-landim-ouroClaro" : "border-white/5 bg-white/[0.03] text-palco-texto hover:border-white/15"
          }`}
        >
          <span>
            {numbered && <span className="mr-2 font-serif text-landim-ouro">{i + 1}</span>}
            {p.label}
          </span>
          <span className="text-[10px] text-palco-suave">{VIEW_LABELS[p.view]}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      {scenePresets.length > 0 && <PanelSection title="Enquadramentos da cena">{list(scenePresets, true)}</PanelSection>}
      <PanelSection title={scenePresets.length ? "Outras vistas" : "Vistas"}>{list(others, false)}</PanelSection>
      <PanelSection title="Transição">
        <div className="flex items-center gap-3">
          <Slider label="Duração da transição" value={transitionMs} min={0} max={3000} step={100} onChange={setTransitionMs} />
          <span className="w-12 text-right text-xs tabular-nums text-palco-suave">{(transitionMs / 1000).toFixed(1)} s</span>
        </div>
        <div className="flex gap-1.5">
          <StageButton icon="plus" label="Aproximar" onClick={() => zoomBy(0.8)} />
          <StageButton icon="minus" label="Afastar" onClick={() => zoomBy(1.25)} />
        </div>
        <p className="text-[11px] leading-relaxed text-palco-suave">
          Arraste para girar · botão direito ou dois dedos para mover · roda ou pinça para aproximar. A câmera respeita a configuração de movimento
          reduzido do sistema.
        </p>
      </PanelSection>
    </div>
  );
}
