"use client";

import type { CameraPreset } from "../camera/framing";
import { useViewerStore } from "../store";
import { zoomBy } from "../viewer/CameraDirector";
import { Icon, type IconName } from "@/modules/ui/Icon";
import { StageButton } from "@/modules/ui/controls";

const PRIMARY = ["frente", "lateral", "posterior", "medial", "superior"];
const MOBILE = ["frente", "lateral", "posterior"];

function MiniButton({ label, icon, active, onClick, disabled }: { label: string; icon?: IconName; active?: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors disabled:opacity-40 ${
        icon ? "w-8" : "px-2.5"
      } ${active ? "border-landim-ouro/70 bg-landim-ouro/15 text-landim-ouroClaro" : "border-white/10 bg-palco-painel/80 text-palco-texto"}`}
    >
      {icon ? <Icon name={icon} className="h-3.5 w-3.5" /> : label}
    </button>
  );
}

/** Vistas anatômicas, zoom, centralizar e restaurar. `compact`: uma linha só, para celular. */
export function ViewToolbar({
  presets,
  orientation = "vertical",
  extraPresets = false,
  compact = false,
}: {
  presets: CameraPreset[];
  orientation?: "vertical" | "horizontal";
  extraPresets?: boolean;
  compact?: boolean;
}) {
  const requestCamera = useViewerStore((s) => s.requestCamera);
  const camera = useViewerStore((s) => s.camera.presetId);
  const resetView = useViewerStore((s) => s.resetView);
  const undo = useViewerStore((s) => s.undo);
  const canUndo = useViewerStore((s) => s.history.length > 0);
  const hasGeneral = presets.some((p) => p.id === "geral");

  if (compact) {
    const views = presets.filter((p) => MOBILE.includes(p.id));
    return (
      <div className="flex flex-nowrap items-center gap-1" role="toolbar" aria-label="Vistas e câmera">
        {views.map((p) => (
          <MiniButton key={p.id} label={p.label} active={camera === p.id} onClick={() => requestCamera(p.id)} />
        ))}
        <span className="mx-0.5 h-5 w-px shrink-0 bg-white/10" aria-hidden />
        <MiniButton label="Afastar" icon="minus" onClick={() => zoomBy(1.33)} />
        <MiniButton label="Aproximar" icon="plus" onClick={() => zoomBy(0.75)} />
        {hasGeneral && <MiniButton label="Centralizar" icon="target" active={camera === "geral"} onClick={() => requestCamera("geral")} />}
        <MiniButton label="Restaurar visualização inicial" icon="home" onClick={resetView} />
      </div>
    );
  }

  const views = presets.filter((p) => PRIMARY.includes(p.id) || (extraPresets && p.id !== "geral"));
  const dir = orientation === "vertical" ? "flex-col" : "flex-row flex-wrap";

  return (
    <div className={`flex ${dir} gap-1.5`} role="toolbar" aria-label="Vistas e câmera">
      {views.map((p) => (
        <StageButton key={p.id} label={p.label} active={camera === p.id} onClick={() => requestCamera(p.id)} className="justify-start" />
      ))}
      <div className="flex flex-row gap-1.5">
        <StageButton compact icon="plus" aria-label="Aproximar" title="Aproximar" onClick={() => zoomBy(0.75)} />
        <StageButton compact icon="minus" aria-label="Afastar" title="Afastar" onClick={() => zoomBy(1.33)} />
        {hasGeneral && <StageButton compact icon="target" aria-label="Centralizar" title="Centralizar" onClick={() => requestCamera("geral")} />}
      </div>
      <div className="flex flex-row gap-1.5">
        <StageButton compact icon="undo" aria-label="Desfazer" title="Voltar ao estado anterior" disabled={!canUndo} onClick={undo} />
        <StageButton compact icon="home" aria-label="Restaurar visualização inicial" title="Restaurar" onClick={resetView} />
      </div>
    </div>
  );
}
