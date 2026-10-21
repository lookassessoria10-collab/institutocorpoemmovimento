"use client";

import { create } from "zustand";
import type { RegionId } from "@/modules/anatomy/types";
import type { OutputFormatId } from "./composition/formats";
import type { PresentationMode, WebcamLayout } from "./composition/layout";
import type { RecordingFormat } from "./recording/mime";
import type { RecordingResult } from "./recording/recorder";

export type RecordingPhase = "idle" | "countdown" | "recording" | "stopping" | "preview";

export interface TextToggles {
  title: boolean;
  caption: boolean;
  signature: boolean;
  notice: boolean;
}

const MODE_DEFAULTS: Record<PresentationMode, TextToggles> = {
  anatomia: { title: false, caption: false, signature: true, notice: true },
  gilvan: { title: false, caption: true, signature: true, notice: true },
  texto: { title: true, caption: true, signature: true, notice: true },
};

export interface StudioState {
  regionId: RegionId;
  sceneId: string | null;
  stepIndex: number;
  /** Avanço automático pelos passos da cena, usando a duração de cada passo. */
  autoplay: boolean;
  format: OutputFormatId;
  mode: PresentationMode;
  webcamLayout: WebcamLayout;
  webcamMirror: boolean;
  texts: TextToggles;
  /** Textos editados na sessão (sobrepõem os da cena, sem alterar o catálogo). */
  titleOverride: string | null;
  captionOverride: string | null;
  showSafeGuides: boolean;
  leftOpen: boolean;
  rightOpen: boolean;
  presentation: boolean;

  micEnabled: boolean;
  webcamEnabled: boolean;
  micStream: MediaStream | null;
  webcamStream: MediaStream | null;
  mediaError: string | null;

  countdownSec: number;
  recordingFormat: RecordingFormat | null;
  phase: RecordingPhase;
  countdownLeft: number;
  recordingStartedAt: number | null;
  result: RecordingResult | null;
  recordError: string | null;

  set: (patch: Partial<StudioState>) => void;
  setMode: (mode: PresentationMode) => void;
  setScene: (sceneId: string | null, stepIndex?: number) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  regionId: "knee",
  sceneId: "cena-04",
  stepIndex: 0,
  autoplay: false,
  format: "vertical",
  mode: "anatomia",
  webcamLayout: "janela-circular",
  webcamMirror: true,
  texts: MODE_DEFAULTS.anatomia,
  titleOverride: null,
  captionOverride: null,
  showSafeGuides: true,
  leftOpen: true,
  rightOpen: true,
  presentation: false,

  micEnabled: false,
  webcamEnabled: false,
  micStream: null,
  webcamStream: null,
  mediaError: null,

  countdownSec: 3,
  recordingFormat: null,
  phase: "idle",
  countdownLeft: 0,
  recordingStartedAt: null,
  result: null,
  recordError: null,

  set: (patch) => set(patch),
  setMode: (mode) => set({ mode, texts: MODE_DEFAULTS[mode] }),
  setScene: (sceneId, stepIndex = 0) => set({ sceneId, stepIndex, titleOverride: null, captionOverride: null, autoplay: false }),
}));
