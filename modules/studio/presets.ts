"use client";

import { z } from "zod";
import { useViewerStore } from "@/modules/anatomy/store";
import { viewerRuntime } from "@/modules/anatomy/viewer/runtime";
import { currentCameraPose, setCameraPose } from "@/modules/anatomy/viewer/focus";
import type { ViewPreset } from "@/modules/content/schema";
import { useStudioStore } from "./store";

/**
 * Presets do estúdio salvos neste navegador (localStorage). Servem para
 * guardar e restaurar configurações durante a produção; para virar conteúdo
 * oficial, exporte o JSON e inclua em modules/content/presets.ts.
 */

const KEY = "cem:estudio:presets:v1";
const v3 = z.tuple([z.number(), z.number(), z.number()]);

export const savedPreset = z.object({
  id: z.string(),
  name: z.string().min(1).max(80),
  modelId: z.string(),
  createdAt: z.string(),
  camera: z.object({ position: v3, target: v3 }).nullable(),
  layers: z.record(z.object({ visible: z.boolean(), opacity: z.number() })),
  hidden: z.array(z.string()),
  isolated: z.array(z.string()).nullable(),
  highlights: z.array(z.object({ structureId: z.string(), style: z.enum(["estrutura", "contorno"]) })),
  annotations: z.array(z.any()),
  motion: z.object({ id: z.string(), time: z.number() }).nullable(),
  format: z.enum(["vertical", "horizontal", "square"]),
  mode: z.enum(["anatomia", "gilvan", "texto"]),
});

export type SavedPreset = z.infer<typeof savedPreset>;

export function loadSaved(): SavedPreset[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = z.array(savedPreset).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

function persist(list: SavedPreset[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* armazenamento indisponível (aba privada): o preset fica só na sessão */
  }
}

export function captureCurrent(name: string): SavedPreset {
  const v = useViewerStore.getState();
  const s = useStudioStore.getState();
  return {
    id: `p-${Date.now().toString(36)}`,
    name,
    modelId: v.modelId ?? "",
    createdAt: new Date().toISOString(),
    camera: currentCameraPose(),
    layers: structuredClone(v.layers),
    hidden: [...v.hidden],
    isolated: v.isolated ? [...v.isolated] : null,
    highlights: v.highlights.map((h) => ({ ...h })),
    annotations: structuredClone(v.annotations),
    motion: v.animation.id ? { id: v.animation.id, time: viewerRuntime.animationTime } : null,
    format: s.format,
    mode: s.mode,
  };
}

export function saveCurrent(name: string): SavedPreset[] {
  const list = [...loadSaved(), captureCurrent(name)];
  persist(list);
  return list;
}

export function deleteSaved(id: string): SavedPreset[] {
  const list = loadSaved().filter((p) => p.id !== id);
  persist(list);
  return list;
}

export function importPresets(json: string): SavedPreset[] {
  const parsed = z.array(savedPreset).parse(JSON.parse(json));
  const ids = new Set(loadSaved().map((p) => p.id));
  const list = [...loadSaved(), ...parsed.filter((p) => !ids.has(p.id))];
  persist(list);
  return list;
}

export function applySaved(p: SavedPreset) {
  const v = useViewerStore.getState();
  v.pushHistory();
  v.setLayers(p.layers);
  useViewerStore.setState({ hidden: p.hidden, isolated: p.isolated, highlights: p.highlights, annotations: p.annotations, selected: null });
  if (p.motion) {
    viewerRuntime.animationTime = p.motion.time;
    v.setAnimation({ id: p.motion.id, time: p.motion.time, playing: false });
  } else v.setAnimation({ id: null, time: 0, playing: false });
  useStudioStore.getState().set({ format: p.format });
  useStudioStore.getState().setMode(p.mode);
  if (p.camera) setCameraPose(p.camera);
}

export function applyViewPreset(p: ViewPreset) {
  const v = useViewerStore.getState();
  v.pushHistory();
  const base = Object.fromEntries(v.availableLayers.map((l) => [l, { visible: true, opacity: 1 }]));
  v.setLayers({ ...base, ...p.layers } as never);
  v.showAll();
  v.setHighlights(p.highlights.map((id) => ({ structureId: id, style: "estrutura" as const })));
  if (p.motion) {
    viewerRuntime.animationTime = p.motion.time;
    v.setAnimation({ id: p.motion.id, time: p.motion.time, playing: false });
  } else v.setAnimation({ id: null, time: 0, playing: false });
  v.requestCamera(p.camera);
}

export function downloadJson(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
