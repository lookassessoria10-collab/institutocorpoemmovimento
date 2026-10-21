"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/modules/ui/Icon";
import { Segmented, StageButton, Toggle } from "@/modules/ui/controls";
import type { RecordingFormat } from "./recording/mime";
import { useStudioStore } from "./store";
import { useMediaToggles } from "./useRecording";

export function formatClock(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function RecordingTimer() {
  const startedAt = useStudioStore((s) => s.recordingStartedAt);
  const phase = useStudioStore((s) => s.phase);
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (phase !== "recording") return;
    const id = window.setInterval(() => setNow(performance.now()), 250);
    return () => window.clearInterval(id);
  }, [phase]);
  if (phase !== "recording" || startedAt == null) return null;
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1 text-xs font-semibold text-white" role="status" aria-live="polite">
      <span className="h-2 w-2 animate-pulse rounded-full bg-white motion-reduce:animate-none" />
      GRAVANDO {formatClock(Math.max(0, now - startedAt))}
    </span>
  );
}

/** Configurações e botão de gravação (barra inferior). */
export function RecordingBar({ formats, onStart, onStop }: { formats: RecordingFormat[] | null; onStart: () => void; onStop: () => void }) {
  const s = useStudioStore();
  const { toggleMic, toggleWebcam } = useMediaToggles();
  const busy = s.phase === "recording" || s.phase === "countdown" || s.phase === "stopping";
  const unsupported = formats !== null && formats.length === 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="inline-flex items-center gap-2 text-xs text-palco-suave">
        <Icon name="mic" />
        Microfone
        <Toggle checked={s.micEnabled} disabled={busy} label="Gravar com microfone" onChange={(v) => void toggleMic(v)} />
      </label>
      <label className="inline-flex items-center gap-2 text-xs text-palco-suave">
        <Icon name="camera" />
        Webcam
        <Toggle checked={s.webcamEnabled} disabled={busy} label="Usar webcam" onChange={(v) => void toggleWebcam(v)} />
      </label>
      <Segmented<number>
        label="Contagem regressiva"
        value={s.countdownSec}
        onChange={(v) => s.set({ countdownSec: v })}
        options={[
          { value: 0, label: "0s" },
          { value: 3, label: "3s" },
          { value: 5, label: "5s" },
        ]}
      />
      {formats && formats.length > 0 && (
        <select
          aria-label="Formato do arquivo"
          disabled={busy}
          value={s.recordingFormat?.mimeType ?? ""}
          onChange={(e) => s.set({ recordingFormat: formats.find((f) => f.mimeType === e.target.value) ?? null })}
          className="max-w-[170px] rounded-full border border-white/10 bg-palco-painel px-3 py-1.5 text-xs text-palco-texto"
        >
          {formats.map((f) => (
            <option key={f.mimeType} value={f.mimeType}>
              {f.label}
            </option>
          ))}
        </select>
      )}
      {unsupported ? (
        <span className="text-xs text-clinico-pendente">Este navegador não grava internamente · use o modo apresentação + OBS</span>
      ) : busy ? (
        <StageButton icon="stop" label={s.phase === "countdown" ? "Cancelar" : "Encerrar gravação"} onClick={onStop} className="border-red-500/60 bg-red-600/90 text-white hover:bg-red-600" disabled={s.phase === "stopping"} />
      ) : (
        <StageButton icon="record" label="Gravar" onClick={onStart} disabled={!formats || !s.recordingFormat} className="border-red-500/50 text-red-200 hover:bg-red-600/20" />
      )}
      <RecordingTimer />
      {s.mediaError && <span className="text-xs text-red-300">{s.mediaError}</span>}
      {s.recordError && <span className="text-xs text-red-300">{s.recordError}</span>}
    </div>
  );
}
