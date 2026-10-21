/**
 * Escolha do formato de gravação a partir do que o navegador em execução
 * realmente suporta (MediaRecorder.isTypeSupported). Nunca rotulamos um
 * WebM como MP4: a extensão do arquivo sai do tipo efetivamente gravado.
 */

export interface RecordingFormat {
  mimeType: string;
  container: "mp4" | "webm";
  extension: "mp4" | "webm";
  label: string;
}

/** Candidatos em ordem de preferência: MP4/H.264 (pronto para Instagram) e depois WebM. */
export const MIME_CANDIDATES: RecordingFormat[] = [
  { mimeType: "video/mp4;codecs=avc1.640028,mp4a.40.2", container: "mp4", extension: "mp4", label: "MP4 (H.264 + AAC)" },
  { mimeType: "video/mp4;codecs=avc1.42E01E,mp4a.40.2", container: "mp4", extension: "mp4", label: "MP4 (H.264 baseline + AAC)" },
  { mimeType: "video/mp4;codecs=avc1", container: "mp4", extension: "mp4", label: "MP4 (H.264)" },
  { mimeType: "video/mp4", container: "mp4", extension: "mp4", label: "MP4" },
  { mimeType: "video/webm;codecs=vp9,opus", container: "webm", extension: "webm", label: "WebM (VP9 + Opus)" },
  { mimeType: "video/webm;codecs=vp8,opus", container: "webm", extension: "webm", label: "WebM (VP8 + Opus)" },
  { mimeType: "video/webm", container: "webm", extension: "webm", label: "WebM" },
];

export function supportedRecordingFormats(isTypeSupported: (t: string) => boolean): RecordingFormat[] {
  return MIME_CANDIDATES.filter((c) => {
    try {
      return isTypeSupported(c.mimeType);
    } catch {
      return false;
    }
  });
}

/**
 * Deriva o contêiner do tipo informado pelo próprio MediaRecorder/Blob
 * depois da gravação (pode diferir do solicitado).
 */
export function formatFromActualMime(actual: string, requested: RecordingFormat): RecordingFormat {
  const a = (actual || "").toLowerCase();
  if (a.startsWith("video/mp4")) return { ...requested, container: "mp4", extension: "mp4", mimeType: actual };
  if (a.startsWith("video/webm")) return { ...requested, container: "webm", extension: "webm", mimeType: actual };
  return requested;
}

export function recordingFileName(sceneSlug: string, format: RecordingFormat, date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  const slug = sceneSlug.replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "estudio";
  return `corpo-em-movimento_${slug}_${stamp}.${format.extension}`;
}
