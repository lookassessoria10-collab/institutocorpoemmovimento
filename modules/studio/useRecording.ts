"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OUTPUT_FORMATS } from "./composition/formats";
import { requestMicrophone, requestWebcam, stopStream } from "./recording/media";
import { supportedRecordingFormats, type RecordingFormat } from "./recording/mime";
import { CompositionRecorder } from "./recording/recorder";
import { compositionTarget } from "./StudioStage";
import { useStudioStore } from "./store";

const FPS = 30;

/** Formatos que este navegador realmente grava (lista vazia = sem gravação interna). */
export function useSupportedFormats(): RecordingFormat[] | null {
  const [formats, setFormats] = useState<RecordingFormat[] | null>(null);
  useEffect(() => {
    if (typeof MediaRecorder === "undefined" || typeof HTMLCanvasElement.prototype.captureStream !== "function") {
      setFormats([]);
      return;
    }
    const list = supportedRecordingFormats((t) => MediaRecorder.isTypeSupported(t));
    setFormats(list);
    const st = useStudioStore.getState();
    if (!st.recordingFormat && list[0]) st.set({ recordingFormat: list[0] });
  }, []);
  return formats;
}

export function useMediaToggles() {
  const toggleMic = useCallback(async (on: boolean) => {
    const st = useStudioStore.getState();
    if (!on) {
      stopStream(st.micStream);
      st.set({ micEnabled: false, micStream: null });
      return;
    }
    try {
      const stream = await requestMicrophone();
      useStudioStore.getState().set({ micEnabled: true, micStream: stream, mediaError: null });
    } catch (e) {
      useStudioStore.getState().set({ micEnabled: false, micStream: null, mediaError: (e as Error).message });
    }
  }, []);

  const toggleWebcam = useCallback(async (on: boolean) => {
    const st = useStudioStore.getState();
    if (!on) {
      stopStream(st.webcamStream);
      st.set({ webcamEnabled: false, webcamStream: null });
      return;
    }
    try {
      const stream = await requestWebcam();
      const s = useStudioStore.getState();
      s.set({ webcamEnabled: true, webcamStream: stream, mediaError: null });
      if (s.mode !== "gilvan") s.setMode("gilvan");
    } catch (e) {
      useStudioStore.getState().set({ webcamEnabled: false, webcamStream: null, mediaError: (e as Error).message });
    }
  }, []);

  return { toggleMic, toggleWebcam };
}

/** Fluxo de gravação: contagem regressiva → grava → encerra → prévia → download local. */
export function useRecordingController(sceneSlug: string) {
  const recorder = useRef<CompositionRecorder | null>(null);
  const countdownTimer = useRef<number | null>(null);

  const cleanupCanvas = () => {
    compositionTarget.canvas = null;
  };

  const begin = useCallback(() => {
    const st = useStudioStore.getState();
    const format = st.recordingFormat;
    const canvas = compositionTarget.canvas;
    if (!format || !canvas) {
      st.set({ phase: "idle", recordError: "Gravação indisponível neste navegador." });
      cleanupCanvas();
      return;
    }
    try {
      const out = OUTPUT_FORMATS[st.format];
      const rec = new CompositionRecorder({
        canvas,
        fps: FPS,
        format,
        audio: st.micEnabled ? st.micStream : null,
        // ~8 Mb/s para 1080p (qualidade adequada para redes sociais).
        videoBitsPerSecond: Math.round((out.width * out.height * FPS * 0.13) / 1000) * 1000,
        sceneSlug,
      });
      rec.onError = (msg) => useStudioStore.getState().set({ recordError: msg });
      rec.start();
      recorder.current = rec;
      st.set({ phase: "recording", recordingStartedAt: performance.now(), recordError: null });
    } catch (e) {
      cleanupCanvas();
      st.set({ phase: "idle", recordError: (e as Error).message || "Não foi possível iniciar a gravação." });
    }
  }, [sceneSlug]);

  const start = useCallback(() => {
    const st = useStudioStore.getState();
    if (st.phase !== "idle") return;
    const out = OUTPUT_FORMATS[st.format];
    const canvas = document.createElement("canvas");
    canvas.width = out.width;
    canvas.height = out.height;
    compositionTarget.canvas = canvas;
    if (st.countdownSec <= 0) return begin();
    st.set({ phase: "countdown", countdownLeft: st.countdownSec, recordError: null, result: null });
    const tick = () => {
      const left = useStudioStore.getState().countdownLeft - 1;
      if (left <= 0) {
        countdownTimer.current = null;
        useStudioStore.getState().set({ countdownLeft: 0 });
        begin();
      } else {
        useStudioStore.getState().set({ countdownLeft: left });
        countdownTimer.current = window.setTimeout(tick, 1000);
      }
    };
    countdownTimer.current = window.setTimeout(tick, 1000);
  }, [begin]);

  const stop = useCallback(async () => {
    const st = useStudioStore.getState();
    if (st.phase === "countdown") {
      if (countdownTimer.current) window.clearTimeout(countdownTimer.current);
      cleanupCanvas();
      st.set({ phase: "idle", countdownLeft: 0 });
      return;
    }
    if (st.phase !== "recording" || !recorder.current) return;
    st.set({ phase: "stopping" });
    try {
      const result = await recorder.current.stop();
      useStudioStore.getState().set({ phase: "preview", result, recordingStartedAt: null });
    } catch (e) {
      useStudioStore.getState().set({ phase: "idle", recordError: (e as Error).message, recordingStartedAt: null });
    } finally {
      recorder.current = null;
      cleanupCanvas();
    }
  }, []);

  const discard = useCallback(() => {
    const st = useStudioStore.getState();
    if (st.result) URL.revokeObjectURL(st.result.url);
    st.set({ phase: "idle", result: null });
  }, []);

  const download = useCallback(() => {
    const r = useStudioStore.getState().result;
    if (!r) return;
    const a = document.createElement("a");
    a.href = r.url;
    a.download = r.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  // Ao sair do estúdio: encerra gravação, libera câmera e microfone.
  useEffect(
    () => () => {
      if (countdownTimer.current) window.clearTimeout(countdownTimer.current);
      recorder.current?.abort();
      cleanupCanvas();
      const st = useStudioStore.getState();
      stopStream(st.micStream);
      stopStream(st.webcamStream);
      if (st.result) URL.revokeObjectURL(st.result.url);
      st.set({ micStream: null, webcamStream: null, micEnabled: false, webcamEnabled: false, phase: "idle", result: null });
    },
    []
  );

  return { start, stop, discard, download };
}
