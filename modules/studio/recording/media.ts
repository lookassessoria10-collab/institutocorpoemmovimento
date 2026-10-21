/**
 * Acesso explícito a microfone e webcam. Nada é solicitado sem uma ação do
 * usuário, e toda stream aberta precisa ser encerrada com `stopStream`.
 */

export type MediaErrorKind = "negado" | "nao-encontrado" | "em-uso" | "inseguro" | "nao-suportado" | "desconhecido";

export class MediaAccessError extends Error {
  constructor(public kind: MediaErrorKind, message: string) {
    super(message);
  }
}

export function describeMediaError(err: unknown, device: "microfone" | "câmera"): MediaAccessError {
  const name = (err as { name?: string })?.name || "";
  const o = device === "câmera" ? "a" : "o";
  const nenhum = device === "câmera" ? "Nenhuma câmera disponível foi encontrada" : "Nenhum microfone disponível foi encontrado";
  if (name === "NotAllowedError" || name === "PermissionDeniedError")
    return new MediaAccessError("negado", `Permissão para usar ${o} ${device} foi negada. Libere o acesso nas configurações do navegador e tente de novo.`);
  if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "OverconstrainedError")
    return new MediaAccessError("nao-encontrado", `${nenhum} neste dispositivo.`);
  if (name === "NotReadableError" || name === "TrackStartError")
    return new MediaAccessError("em-uso", `${o === "a" ? "A" : "O"} ${device} parece estar em uso por outro aplicativo. Feche esse aplicativo e tente de novo.`);
  if (name === "SecurityError")
    return new MediaAccessError("inseguro", `O navegador só libera ${o} ${device} em conexões seguras (HTTPS ou localhost).`);
  return new MediaAccessError("desconhecido", `Não foi possível acessar ${o} ${device}.`);
}

function ensureSupport() {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new MediaAccessError("nao-suportado", "Este navegador não oferece acesso a câmera e microfone.");
  }
  if (typeof window !== "undefined" && !window.isSecureContext) {
    throw new MediaAccessError("inseguro", "Câmera e microfone exigem HTTPS ou localhost.");
  }
}

export async function requestMicrophone(deviceId?: string): Promise<MediaStream> {
  ensureSupport();
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
  } catch (e) {
    throw describeMediaError(e, "microfone");
  }
}

export async function requestWebcam(deviceId?: string): Promise<MediaStream> {
  ensureSupport();
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      },
      audio: false,
    });
  } catch (e) {
    throw describeMediaError(e, "câmera");
  }
}

export function stopStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((t) => t.stop());
}
