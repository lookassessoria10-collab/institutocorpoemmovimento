"use client";

import { create } from "zustand";
import type { LayerId, RegionId, V3 } from "./types";

/**
 * Estado do visualizador anatômico, compartilhado pelo atlas público e pelo
 * Estúdio Gilvan. A cena (modules/content) apenas descreve estados; quem os
 * aplica é este store, o que mantém câmera, camadas, destaques, animação e
 * legendas sincronizados.
 */

export interface LayerState {
  visible: boolean;
  opacity: number; // 0–1
}

export type HighlightStyle = "estrutura" | "contorno";

export interface Highlight {
  structureId: string;
  style: HighlightStyle;
}

/**
 * Âncora 3D: ponto em uma estrutura, em coordenadas locais da malha (segue a
 * estrutura quando o modelo gira ou se move). local = null usa o centro da
 * estrutura.
 */
export interface StructureAnchor {
  kind: "structure";
  structureId: string;
  local: V3 | null;
}

/** Âncora fixa na composição do vídeo (0–1 em relação à área de texto segura). */
export interface ScreenAnchor {
  kind: "screen";
  x: number;
  y: number;
}

export type AnnotationType = "marcador" | "seta" | "legenda" | "area";

export interface Annotation {
  id: string;
  type: AnnotationType;
  anchor: StructureAnchor | ScreenAnchor;
  text: string;
  /** Entra no vídeo gravado (true) ou é só um apoio de edição (false). */
  inRecording: boolean;
}

/**
 * Região de desconforto: área onde a dor costuma ser percebida.
 * É uma representação educativa — não aponta causa nem lesão.
 */
export interface PainArea {
  center: V3;
  radius: number;
  label: string;
}

export interface AnimationState {
  id: string | null;
  playing: boolean;
  /** Posição normalizada na linha do tempo do movimento (0–1). */
  time: number;
  speed: number;
  loop: boolean;
}

export interface CameraRequest {
  presetId: string;
  /** Incrementa a cada pedido para que o mesmo preset possa ser reaplicado. */
  seq: number;
  durationMs: number;
}

interface Snapshot {
  layers: Record<LayerId, LayerState>;
  hidden: string[];
  isolated: string[] | null;
  highlights: Highlight[];
  annotations: Annotation[];
  painArea: PainArea | null;
}

export interface ViewerState {
  regionId: RegionId | null;
  modelId: string | null;
  availableLayers: LayerId[];
  layers: Record<LayerId, LayerState>;
  hidden: string[];
  isolated: string[] | null;
  selected: string | null;
  hovered: string | null;
  highlights: Highlight[];
  painArea: PainArea | null;
  annotations: Annotation[];
  animation: AnimationState;
  camera: CameraRequest;
  transitionMs: number;
  /** Ferramenta de anotação ativa no estúdio (clique no modelo cria a anotação). */
  tool: AnnotationType | null;
  history: Snapshot[];

  loadModel: (regionId: RegionId, modelId: string, availableLayers: LayerId[]) => void;
  setLayer: (layer: LayerId, patch: Partial<LayerState>) => void;
  setLayers: (layers: Partial<Record<LayerId, Partial<LayerState>>>) => void;
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  hideStructure: (id: string) => void;
  showAll: () => void;
  isolate: (ids: string[] | null) => void;
  setHighlights: (h: Highlight[]) => void;
  toggleHighlight: (id: string, style?: HighlightStyle) => void;
  setPainArea: (p: PainArea | null) => void;
  addAnnotation: (a: Annotation) => void;
  updateAnnotation: (id: string, patch: Partial<Annotation>) => void;
  removeAnnotation: (id: string) => void;
  clearAnnotations: () => void;
  setAnimation: (patch: Partial<AnimationState>) => void;
  requestCamera: (presetId: string, durationMs?: number) => void;
  setTransitionMs: (ms: number) => void;
  setTool: (t: AnnotationType | null) => void;
  pushHistory: () => void;
  undo: () => void;
  resetView: () => void;
}

export const DEFAULT_LAYER: LayerState = { visible: true, opacity: 1 };

function initialLayers(available: LayerId[]): Record<LayerId, LayerState> {
  const all: LayerId[] = ["skin", "muscles", "tendons", "ligaments", "joints", "bones", "other"];
  return Object.fromEntries(
    all.map((l) => [l, { visible: available.includes(l), opacity: 1 }])
  ) as Record<LayerId, LayerState>;
}

const initialAnimation: AnimationState = { id: null, playing: false, time: 0, speed: 1, loop: true };

function snapshot(s: ViewerState): Snapshot {
  return {
    layers: structuredClone(s.layers),
    hidden: [...s.hidden],
    isolated: s.isolated ? [...s.isolated] : null,
    highlights: s.highlights.map((h) => ({ ...h })),
    annotations: s.annotations.map((a) => ({ ...a, anchor: { ...a.anchor } as Annotation["anchor"] })),
    painArea: s.painArea ? { ...s.painArea } : null,
  };
}

const HISTORY_LIMIT = 40;

export const useViewerStore = create<ViewerState>((set, get) => ({
  regionId: null,
  modelId: null,
  availableLayers: [],
  layers: initialLayers([]),
  hidden: [],
  isolated: null,
  selected: null,
  hovered: null,
  highlights: [],
  painArea: null,
  annotations: [],
  animation: initialAnimation,
  camera: { presetId: "geral", seq: 0, durationMs: 1200 },
  transitionMs: 1200,
  tool: null,
  history: [],

  loadModel: (regionId, modelId, availableLayers) =>
    set((s) => ({
      regionId,
      modelId,
      availableLayers,
      layers: initialLayers(availableLayers),
      hidden: [],
      isolated: null,
      selected: null,
      hovered: null,
      highlights: [],
      painArea: null,
      annotations: [],
      animation: initialAnimation,
      tool: null,
      history: [],
      camera: { presetId: "geral", seq: s.camera.seq + 1, durationMs: 0 },
    })),

  setLayer: (layer, patch) => set((s) => ({ layers: { ...s.layers, [layer]: { ...s.layers[layer], ...patch } } })),
  setLayers: (patch) =>
    set((s) => {
      const next = { ...s.layers };
      for (const [k, v] of Object.entries(patch) as [LayerId, Partial<LayerState>][]) next[k] = { ...next[k], ...v };
      return { layers: next };
    }),
  select: (id) => set({ selected: id }),
  hover: (id) => (get().hovered === id ? undefined : set({ hovered: id })),
  hideStructure: (id) => set((s) => ({ hidden: s.hidden.includes(id) ? s.hidden : [...s.hidden, id], selected: s.selected === id ? null : s.selected })),
  showAll: () => set({ hidden: [], isolated: null }),
  isolate: (ids) => set({ isolated: ids && ids.length ? ids : null }),
  setHighlights: (highlights) => set({ highlights }),
  toggleHighlight: (id, style = "estrutura") =>
    set((s) => ({
      highlights: s.highlights.some((h) => h.structureId === id)
        ? s.highlights.filter((h) => h.structureId !== id)
        : [...s.highlights, { structureId: id, style }],
    })),
  setPainArea: (painArea) => set({ painArea }),
  addAnnotation: (a) => set((s) => ({ annotations: [...s.annotations, a] })),
  updateAnnotation: (id, patch) =>
    set((s) => ({ annotations: s.annotations.map((a) => (a.id === id ? ({ ...a, ...patch } as Annotation) : a)) })),
  removeAnnotation: (id) => set((s) => ({ annotations: s.annotations.filter((a) => a.id !== id) })),
  clearAnnotations: () => set({ annotations: [] }),
  setAnimation: (patch) => set((s) => ({ animation: { ...s.animation, ...patch } })),
  requestCamera: (presetId, durationMs) =>
    set((s) => ({ camera: { presetId, seq: s.camera.seq + 1, durationMs: durationMs ?? s.transitionMs } })),
  setTransitionMs: (transitionMs) => set({ transitionMs }),
  setTool: (tool) => set({ tool }),
  pushHistory: () => set((s) => ({ history: [...s.history, snapshot(s)].slice(-HISTORY_LIMIT) })),
  undo: () =>
    set((s) => {
      const prev = s.history[s.history.length - 1];
      if (!prev) return {};
      return { ...prev, history: s.history.slice(0, -1) };
    }),
  resetView: () =>
    set((s) => ({
      layers: initialLayers(s.availableLayers),
      hidden: [],
      isolated: null,
      selected: null,
      highlights: [],
      painArea: null,
      annotations: [],
      animation: { ...initialAnimation, id: s.animation.id },
      tool: null,
      camera: { presetId: "geral", seq: s.camera.seq + 1, durationMs: s.transitionMs },
    })),
}));

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as { __store: typeof useViewerStore }).__store = useViewerStore;
}
