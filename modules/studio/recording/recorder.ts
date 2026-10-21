import { formatFromActualMime, recordingFileName, type RecordingFormat } from "./mime";

export interface RecordingResult {
  blob: Blob;
  url: string;
  format: RecordingFormat;
  durationMs: number;
  bytes: number;
  fileName: string;
}

export interface RecorderOptions {
  /** Canvas de composição (já na resolução de saída). */
  canvas: HTMLCanvasElement;
  fps: number;
  format: RecordingFormat;
  audio: MediaStream | null;
  videoBitsPerSecond: number;
  sceneSlug: string;
}

/**
 * Grava o canvas de composição (3D + anotações + títulos + webcam) com o
 * áudio do microfone. O arquivo fica só no navegador: nada é enviado a
 * servidores.
 */
export class CompositionRecorder {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private canvasStream: MediaStream | null = null;
  private startedAt = 0;
  private stopped: Promise<RecordingResult> | null = null;
  onError: ((message: string) => void) | null = null;

  constructor(private opts: RecorderOptions) {}

  start() {
    if (typeof MediaRecorder === "undefined") throw new Error("Este navegador não oferece gravação de vídeo (MediaRecorder).");
    const canvasStream = this.opts.canvas.captureStream(this.opts.fps);
    this.canvasStream = canvasStream;
    const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
    if (this.opts.audio) tracks.push(...this.opts.audio.getAudioTracks());
    const stream = new MediaStream(tracks);

    const rec = new MediaRecorder(stream, {
      mimeType: this.opts.format.mimeType,
      videoBitsPerSecond: this.opts.videoBitsPerSecond,
      audioBitsPerSecond: 128_000,
    });
    this.recorder = rec;
    this.chunks = [];
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.chunks.push(e.data);
    };
    rec.onerror = (e) => {
      const msg = (e as unknown as { error?: { message?: string } }).error?.message || "Falha durante a gravação.";
      this.onError?.(msg);
    };
    this.stopped = new Promise((resolve, reject) => {
      rec.onstop = () => {
        const durationMs = performance.now() - this.startedAt;
        const actualType = this.chunks[0]?.type || rec.mimeType || this.opts.format.mimeType;
        const format = formatFromActualMime(actualType, this.opts.format);
        const blob = new Blob(this.chunks, { type: format.mimeType.split(";")[0] });
        this.releaseCanvasStream();
        if (blob.size === 0) return reject(new Error("A gravação terminou sem dados de vídeo."));
        resolve({
          blob,
          url: URL.createObjectURL(blob),
          format,
          durationMs,
          bytes: blob.size,
          fileName: recordingFileName(this.opts.sceneSlug, format),
        });
      };
    });
    // Fatias de 1 s: limitam a perda de dados se a aba travar.
    rec.start(1000);
    this.startedAt = performance.now();
  }

  get state(): RecordingState | "inactive" {
    return (this.recorder?.state as RecordingState) ?? "inactive";
  }

  pause() {
    if (this.recorder?.state === "recording") this.recorder.pause();
  }

  resume() {
    if (this.recorder?.state === "paused") this.recorder.resume();
  }

  stop(): Promise<RecordingResult> {
    if (!this.recorder || !this.stopped) return Promise.reject(new Error("Nenhuma gravação em andamento."));
    if (this.recorder.state !== "inactive") this.recorder.stop();
    return this.stopped;
  }

  /** Encerra tudo sem gerar arquivo (ex.: usuário saiu do estúdio). */
  abort() {
    try {
      if (this.recorder && this.recorder.state !== "inactive") {
        this.recorder.ondataavailable = null;
        this.recorder.onstop = null;
        this.recorder.stop();
      }
    } finally {
      this.releaseCanvasStream();
      this.chunks = [];
    }
  }

  private releaseCanvasStream() {
    this.canvasStream?.getTracks().forEach((t) => t.stop());
    this.canvasStream = null;
  }
}
