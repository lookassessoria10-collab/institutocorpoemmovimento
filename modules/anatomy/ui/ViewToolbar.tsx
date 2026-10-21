"use client";

import type { CameraPreset } from "../camera/framing";
import { useViewerStore } from "../store";
import { zoomBy } from "../viewer/CameraDirector";
import { StageButton } from "@/modules/ui/controls";

const PRIMARY = ["frente", "lateral", "posterior", "medial", "superior"];

/** Vistas anatômicas, zoom, centralizar e restaurar. */
export function ViewToolbar({ presets, orientation = "vertical", extraPresets = false }: { presets: CameraPreset[]; orientation?: "vertical" | "horizontal"; extraPresets?: boolean }) {
  const requestCamera = useViewerStore((s) => s.requestCamera);
  const camera = useViewerStore((s) => s.camera.presetId);
  const resetView = useViewerStore((s) => s.resetView);
  const undo = useViewerStore((s) => s.undo);
  const canUndo = useViewerStore((s) => s.history.length > 0);
  const views = presets.filter((p) => PRIMARY.includes(p.id) || (extraPresets && p.id !== "geral"));
  const hasGeneral = presets.some((p) => p.id === "geral");
  const dir = orientation === "vertical" ? "flex-col" : "flex-row flex-wrap";

  return (
    <div className={`flex ${dir} gap-1.5`} role="toolbar" aria-label="Vistas e câmera">
      {views.map((p) => (
        <StageButton key={p.id} label={p.label} active={camera === p.id} onClick={() => requestCamera(p.id)} className="justify-start" />
      ))}
      <div className={`flex ${orientation === "vertical" ? "flex-row" : "flex-row"} gap-1.5`}>
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
