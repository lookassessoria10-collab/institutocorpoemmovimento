/**
 * Fundo do palco anatômico: roxo profundo da marca, com luz central suave.
 * O mesmo gradiente é usado na tela (CSS) e no vídeo gravado (canvas 2D),
 * para que a gravação reflita exatamente a prévia.
 */
export const STAGE_BG = {
  center: "#2B1739",
  mid: "#1A0E24",
  edge: "#0E0714",
};

export const STAGE_BG_CSS = `radial-gradient(120% 90% at 50% 42%, ${STAGE_BG.center} 0%, ${STAGE_BG.mid} 48%, ${STAGE_BG.edge} 100%)`;

export function paintStageBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w / 2;
  const cy = h * 0.42;
  const r = Math.hypot(w * 0.6, h * 0.9);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, STAGE_BG.center);
  g.addColorStop(0.48, STAGE_BG.mid);
  g.addColorStop(1, STAGE_BG.edge);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}
