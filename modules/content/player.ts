"use client";

import { availableLayers, getModel } from "@/modules/anatomy/assets/registry";
import { LAYER_ORDER, type LayerId, type V3 } from "@/modules/anatomy/types";
import { useViewerStore, type Annotation, type PainArea } from "@/modules/anatomy/store";
import { viewerRuntime } from "@/modules/anatomy/viewer/runtime";
import type { RegionConfig } from "@/modules/anatomy/regions";
import type { Scene, SceneStep } from "./schema";
import { regionForModel } from "./validate";

/**
 * Aplica um passo de cena ao visualizador: camadas, isolamento, destaques,
 * área de desconforto, movimento, anotações e câmera — tudo de uma vez, a
 * partir de um estado limpo. Assim câmera, animação, destaque e legenda
 * ficam sincronizados e qualquer passo pode ser aberto diretamente.
 */
export function resolvePainArea(region: RegionConfig, id: string | null, modelId: string): PainArea | null {
  if (!id) return null;
  const preset = region.painAreas.find((p) => p.id === id);
  if (!preset) return null;
  let center: V3;
  if (Array.isArray(preset.center)) center = preset.center as V3;
  else {
    const c = preset.center as { structure: string; offset?: V3 };
    const s = getModel(modelId).structures.find((x) => x.id === c.structure);
    const base = s?.center ?? getModel(modelId).focus;
    const o = c.offset ?? [0, 0, 0];
    center = [base[0] + o[0], base[1] + o[1], base[2] + o[2]];
  }
  return { center, radius: preset.radius, label: `${preset.label} · representação educativa` };
}

let annotationSeq = 0;

export function applySceneStep(scene: Scene, stepIndex: number, opts: { transitionMs?: number } = {}) {
  const step: SceneStep | undefined = scene.steps[stepIndex];
  if (!step) return;
  const region = regionForModel(scene.modelId);
  const st = useViewerStore.getState();
  const model = getModel(scene.modelId);
  const avail = availableLayers(model);

  // Camadas: parte das camadas ativas da cena e aplica o ajuste do passo.
  const layers: Partial<Record<LayerId, { visible: boolean; opacity: number }>> = {};
  for (const l of LAYER_ORDER) layers[l] = { visible: avail.includes(l) && scene.activeLayers.includes(l), opacity: 1 };
  for (const [l, patch] of Object.entries(step.layers ?? {}) as [LayerId, { visible?: boolean; opacity?: number }][]) {
    layers[l] = { ...layers[l]!, ...patch, visible: patch.visible ?? (patch.opacity !== undefined ? true : layers[l]!.visible) };
  }
  st.setLayers(layers);
  st.showAll();
  st.isolate(step.isolate);
  st.select(null);
  st.setHighlights([
    ...step.highlights.map((id) => ({ structureId: id, style: "estrutura" as const })),
    ...step.outline.map((id) => ({ structureId: id, style: "contorno" as const })),
  ]);
  st.setPainArea(region ? resolvePainArea(region, step.painArea, scene.modelId) : null);

  const annotations: Annotation[] = step.annotations.map((a) => ({
    id: `cena-${++annotationSeq}`,
    type: a.type,
    anchor: { kind: "structure", structureId: a.structure, local: null },
    text: a.text,
    inRecording: a.inRecording,
  }));
  useViewerStore.setState({ annotations, tool: null });

  if (step.motion) {
    viewerRuntime.animationTime = step.motion.time;
    st.setAnimation({ id: step.motion.id, time: step.motion.time, playing: step.motion.play, speed: step.motion.speed, loop: step.motion.loop });
  } else {
    viewerRuntime.animationTime = 0;
    st.setAnimation({ id: scene.animationId, time: 0, playing: false, speed: scene.animationSpeed });
  }
  st.requestCamera(step.camera, opts.transitionMs);
}
