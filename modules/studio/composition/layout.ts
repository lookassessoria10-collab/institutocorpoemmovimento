import { OUTPUT_FORMATS, safeRect, type OutputFormatId, type Rect } from "./formats";

/**
 * Modos de apresentação:
 *  A — anatomia em destaque (só o modelo).
 *  B — Gilvan + anatomia (vídeo da webcam ao lado ou sobre a cena).
 *  C — anatomia + texto (título e frases curtas para motion/narração).
 */
export type PresentationMode = "anatomia" | "gilvan" | "texto";

export type WebcamLayout = "lado" | "janela-circular" | "janela-retangular";

export interface CompositionLayout {
  width: number;
  height: number;
  /** Onde o canvas 3D é desenhado (px de saída). */
  viewport: Rect;
  /** Onde o vídeo da webcam é desenhado, quando o modo B estiver ativo. */
  webcam: (Rect & { shape: "rect" | "circle" }) | null;
  /** Região onde títulos e legendas podem ser colocados. */
  text: Rect;
  safe: Rect;
}

export function computeLayout(
  formatId: OutputFormatId,
  mode: PresentationMode,
  webcamLayout: WebcamLayout,
  webcamActive: boolean
): CompositionLayout {
  const f = OUTPUT_FORMATS[formatId];
  const safe = safeRect(f);
  const full: Rect = { x: 0, y: 0, w: f.width, h: f.height };
  let viewport: Rect = full;
  let webcam: CompositionLayout["webcam"] = null;
  let text: Rect = safe;

  if (mode === "texto") {
    // Título e frases ganham espaço próprio; a anatomia ocupa o restante.
    // O canvas 3D é transparente: o fundo do quadro continua contínuo.
    if (formatId === "horizontal") {
      const split = Math.round(f.width * 0.4);
      viewport = { x: split, y: 0, w: f.width - split, h: f.height };
      text = { x: safe.x, y: safe.y, w: split - safe.x - 24, h: safe.h };
    } else {
      const band = Math.round(f.height * (formatId === "vertical" ? 0.2 : 0.24));
      viewport = { x: 0, y: f.safe.top + band, w: f.width, h: f.height - f.safe.top - band };
    }
  }

  if (mode === "gilvan" && webcamActive) {
    if (webcamLayout === "lado") {
      if (formatId === "horizontal") {
        // Anatomia ocupa ~62% à esquerda; Gilvan à direita.
        const split = Math.round(f.width * 0.62);
        viewport = { x: 0, y: 0, w: split, h: f.height };
        webcam = { x: split, y: 0, w: f.width - split, h: f.height, shape: "rect" };
        text = { x: safe.x, y: safe.y, w: split - safe.x - 32, h: safe.h };
      } else {
        // Vertical e quadrado: anatomia em cima, Gilvan embaixo (dentro da área segura).
        const camH = Math.round((formatId === "vertical" ? 0.3 : 0.36) * f.height);
        const camY = f.height - f.safe.bottom - camH;
        viewport = { x: 0, y: 0, w: f.width, h: camY };
        webcam = { x: safe.x, y: camY, w: safe.w, h: camH, shape: "rect" };
        text = { x: safe.x, y: safe.y, w: safe.w, h: camY - safe.y - 24 };
      }
    } else {
      const size = Math.round(Math.min(f.width, f.height) * (formatId === "vertical" ? 0.34 : 0.26));
      webcam = {
        x: f.width - f.safe.right - size,
        y: f.height - f.safe.bottom - size,
        w: size,
        h: size,
        shape: webcamLayout === "janela-circular" ? "circle" : "rect",
      };
    }
  }
  return { width: f.width, height: f.height, viewport, webcam, text, safe };
}
