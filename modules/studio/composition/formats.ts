/**
 * Formatos de saída do Estúdio Gilvan e áreas seguras.
 *
 * As dimensões são as de saída do vídeo. A prévia na tela mantém a mesma
 * proporção; a gravação renderiza na resolução de saída.
 */

export type OutputFormatId = "vertical" | "horizontal" | "square";

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface OutputFormat {
  id: OutputFormatId;
  label: string;
  ratioLabel: string;
  width: number;
  height: number;
  /** Margens (px na resolução de saída) onde não devem ficar textos importantes. */
  safe: Insets;
  note: string;
}

export const OUTPUT_FORMATS: Record<OutputFormatId, OutputFormat> = {
  vertical: {
    id: "vertical",
    label: "Vertical",
    ratioLabel: "9:16",
    width: 1080,
    height: 1920,
    // Reels/Stories: topo (nome do perfil, áudio), base (legenda, botões) e
    // coluna direita (curtir, comentar, compartilhar) ficam cobertos pela
    // interface do Instagram.
    safe: { top: 220, right: 150, bottom: 430, left: 64 },
    note: "Reels e Stories. Margens reservadas para a interface do Instagram.",
  },
  horizontal: {
    id: "horizontal",
    label: "Horizontal",
    ratioLabel: "16:9",
    width: 1920,
    height: 1080,
    safe: { top: 64, right: 96, bottom: 72, left: 96 },
    note: "YouTube, site e apresentações.",
  },
  square: {
    id: "square",
    label: "Quadrado",
    ratioLabel: "1:1",
    width: 1080,
    height: 1080,
    safe: { top: 72, right: 72, bottom: 96, left: 72 },
    note: "Feed do Instagram.",
  },
};

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function safeRect(f: OutputFormat): Rect {
  return {
    x: f.safe.left,
    y: f.safe.top,
    w: f.width - f.safe.left - f.safe.right,
    h: f.height - f.safe.top - f.safe.bottom,
  };
}

/** Maior retângulo com a proporção do formato que cabe em (maxW × maxH). */
export function fitFormat(f: OutputFormat, maxW: number, maxH: number): { w: number; h: number; scale: number } {
  const scale = Math.min(maxW / f.width, maxH / f.height);
  return { w: Math.floor(f.width * scale), h: Math.floor(f.height * scale), scale };
}
