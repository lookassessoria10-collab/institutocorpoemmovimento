import type { CompositionLayout, PresentationMode } from "./layout";
import type { AnnotationType } from "@/modules/anatomy/store";

/**
 * Desenho da composição do vídeo (tudo o que não é o canvas 3D).
 *
 * A MESMA função desenha a camada de sobreposição da prévia na tela e o
 * canvas de gravação. Assim, o vídeo gravado reflete exatamente a
 * composição apresentada. Controles de edição (guias de área segura,
 * anotações marcadas como "só edição") são desenhados apenas na prévia.
 */

export interface ProjectedAnnotation {
  id: string;
  type: AnnotationType;
  /** Posição em px de saída. */
  x: number;
  y: number;
  text: string;
  inRecording: boolean;
  /** false quando o ponto está atrás da câmera ou fora do quadro. */
  onScreen: boolean;
}

export interface CompositionTexts {
  kicker?: string;
  title?: string;
  caption?: string;
  /** Aviso obrigatório (ex.: região de desconforto / exemplo educativo). */
  notice?: string;
}

export interface DrawParams {
  layout: CompositionLayout;
  mode: PresentationMode;
  texts: CompositionTexts;
  annotations: ProjectedAnnotation[];
  painLabel?: { x: number; y: number; text: string; onScreen: boolean } | null;
  webcam?: { video: HTMLVideoElement; mirror: boolean } | null;
  signature?: HTMLImageElement | null;
  showSignature: boolean;
  fontFamily: string;
  scriptFamily: string;
  /** true no canvas de gravação. */
  forRecording: boolean;
  showSafeGuides: boolean;
}

const GOLD = "#D6B469";
const GOLD_LIGHT = "#ECD9AD";
const PAIN = "#E07A5F";
const INK = "#140A1C";

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawWebcam(ctx: CanvasRenderingContext2D, p: DrawParams) {
  const cam = p.layout.webcam;
  const v = p.webcam?.video;
  if (!cam || !v || v.readyState < 2 || !v.videoWidth) return;
  ctx.save();
  if (cam.shape === "circle") {
    ctx.beginPath();
    ctx.arc(cam.x + cam.w / 2, cam.y + cam.h / 2, Math.min(cam.w, cam.h) / 2, 0, Math.PI * 2);
    ctx.clip();
  } else {
    roundRect(ctx, cam.x, cam.y, cam.w, cam.h, p.layout.webcam && cam.w < p.layout.width * 0.5 ? 28 : 0);
    ctx.clip();
  }
  // Preenchimento tipo "cover", sem distorcer a imagem.
  const s = Math.max(cam.w / v.videoWidth, cam.h / v.videoHeight);
  const dw = v.videoWidth * s;
  const dh = v.videoHeight * s;
  const dx = cam.x + (cam.w - dw) / 2;
  const dy = cam.y + (cam.h - dh) / 2;
  if (p.webcam?.mirror) {
    ctx.translate(cam.x * 2 + cam.w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(v, dx, dy, dw, dh);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  if (cam.shape === "circle") {
    ctx.beginPath();
    ctx.arc(cam.x + cam.w / 2, cam.y + cam.h / 2, Math.min(cam.w, cam.h) / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
  } else if (cam.w < p.layout.width * 0.5) {
    roundRect(ctx, cam.x + 2, cam.y + 2, cam.w - 4, cam.h - 4, 26);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTitle(ctx: CanvasRenderingContext2D, p: DrawParams, unit: number) {
  const { kicker, title } = p.texts;
  if (!kicker && !title) return;
  const area = p.layout.text;
  let y = area.y;
  ctx.save();
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(10,4,16,.55)";
  ctx.shadowBlur = unit * 0.6;
  if (kicker) {
    ctx.font = `600 ${Math.round(unit * 0.62)}px ${p.fontFamily}`;
    ctx.fillStyle = GOLD;
    const spaced = kicker.toUpperCase().split("").join(String.fromCharCode(8202));
    ctx.fillText(spaced, area.x, y);
    y += unit * 1.15;
  }
  if (title) {
    const size = Math.round(unit * (p.mode === "texto" ? 1.55 : 1.3));
    ctx.font = `700 ${size}px ${p.fontFamily}`;
    ctx.fillStyle = "#FFFFFF";
    const lines = wrap(ctx, title, area.w * (p.mode === "texto" ? 0.95 : 0.85)).slice(0, 3);
    for (const l of lines) {
      ctx.fillText(l, area.x, y);
      y += size * 1.12;
    }
  }
  ctx.restore();
}

/** Altura reservada na base para a assinatura (a legenda fica acima dela). */
function signatureBand(p: DrawParams, unit: number) {
  return p.showSignature && p.signature?.complete && p.signature.naturalWidth ? unit * 1.25 + unit * 0.6 : 0;
}

function drawCaption(ctx: CanvasRenderingContext2D, p: DrawParams, unit: number) {
  const caption = p.texts.caption;
  if (!caption) return;
  const area = { ...p.layout.text, h: p.layout.text.h - signatureBand(p, unit) };
  const size = Math.round(unit * 0.9);
  ctx.save();
  ctx.font = `500 ${size}px ${p.fontFamily}`;
  const lines = wrap(ctx, caption, area.w * 0.9 - unit * 1.6).slice(0, 3);
  const lh = size * 1.25;
  const boxH = lines.length * lh + unit * 1.1;
  const boxW = Math.min(area.w, Math.max(...lines.map((l) => ctx.measureText(l).width)) + unit * 1.6);
  const x = area.x;
  const y = area.y + area.h - boxH;
  ctx.fillStyle = "rgba(29, 6, 39, 0.78)";
  roundRect(ctx, x, y, boxW, boxH, unit * 0.6);
  ctx.fill();
  ctx.fillStyle = GOLD;
  ctx.fillRect(x, y + unit * 0.45, unit * 0.14, boxH - unit * 0.9);
  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "top";
  lines.forEach((l, i) => ctx.fillText(l, x + unit * 0.8, y + unit * 0.55 + i * lh));
  ctx.restore();
}

function drawNotice(ctx: CanvasRenderingContext2D, p: DrawParams, unit: number) {
  if (!p.texts.notice) return;
  const area = p.layout.text;
  const size = Math.round(unit * 0.5);
  ctx.save();
  ctx.font = `500 ${size}px ${p.fontFamily}`;
  ctx.textBaseline = "top";
  const lines = wrap(ctx, p.texts.notice, area.w * 0.7).slice(0, 2);
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + unit * 0.9;
  const h = lines.length * size * 1.3 + unit * 0.5;
  const x = area.x + area.w - w;
  const y = area.y;
  ctx.fillStyle = "rgba(20,10,28,.72)";
  roundRect(ctx, x, y, w, h, unit * 0.3);
  ctx.fill();
  ctx.fillStyle = GOLD_LIGHT;
  lines.forEach((l, i) => ctx.fillText(l, x + unit * 0.45, y + unit * 0.25 + i * size * 1.3));
  ctx.restore();
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, unit: number, font: string, color = "#FFFFFF") {
  if (!text) return;
  const size = Math.round(unit * 0.66);
  ctx.font = `600 ${size}px ${font}`;
  const w = ctx.measureText(text).width + unit * 0.9;
  const h = size + unit * 0.5;
  ctx.fillStyle = "rgba(20,10,28,.86)";
  roundRect(ctx, x, y - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(214,180,105,.6)";
  ctx.lineWidth = Math.max(1, unit * 0.05);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + unit * 0.45, y + 1);
}

function drawAnnotation(ctx: CanvasRenderingContext2D, a: ProjectedAnnotation, p: DrawParams, unit: number) {
  if (!a.onScreen) return;
  ctx.save();
  const vp = p.layout.viewport;
  // Rótulo vai para o lado com mais espaço dentro do viewport.
  const toRight = a.x < vp.x + vp.w * 0.6;
  const dx = (toRight ? 1 : -1) * unit * 2.6;
  const dy = -unit * 1.6;
  const lx = a.x + dx;
  const ly = a.y + dy;
  ctx.lineCap = "round";
  if (a.type === "marcador") {
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = unit * 0.08;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(lx, ly);
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(a.x, a.y, unit * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(214,180,105,.45)";
    ctx.lineWidth = unit * 0.12;
    ctx.beginPath();
    ctx.arc(a.x, a.y, unit * 0.62, 0, Math.PI * 2);
    ctx.stroke();
  } else if (a.type === "seta") {
    const tx = a.x + (toRight ? 1 : -1) * unit * 3.4;
    const ty = a.y - unit * 2.4;
    const ang = Math.atan2(a.y - ty, a.x - tx);
    const tipBack = unit * 0.45;
    const ex = a.x - Math.cos(ang) * tipBack;
    const ey = a.y - Math.sin(ang) * tipBack;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = unit * 0.14;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(a.x - Math.cos(ang - 0.45) * unit * 0.9, a.y - Math.sin(ang - 0.45) * unit * 0.9);
    ctx.lineTo(a.x - Math.cos(ang + 0.45) * unit * 0.9, a.y - Math.sin(ang + 0.45) * unit * 0.9);
    ctx.closePath();
    ctx.fill();
    if (a.text) label(ctx, a.text, toRight ? tx + unit * 0.2 : tx - unit * 0.2 - measure(ctx, a.text, unit, p.fontFamily), ty, unit, p.fontFamily);
    ctx.restore();
    return;
  } else if (a.type === "area") {
    ctx.strokeStyle = GOLD;
    ctx.setLineDash([unit * 0.35, unit * 0.25]);
    ctx.lineWidth = unit * 0.1;
    ctx.beginPath();
    ctx.arc(a.x, a.y, unit * 2.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    if (a.text) label(ctx, a.text, a.x + unit * 2.4, a.y - unit * 2, unit, p.fontFamily);
    ctx.restore();
    return;
  } else if (a.type === "legenda") {
    if (a.text) label(ctx, a.text, a.x, a.y, unit, p.fontFamily);
    ctx.restore();
    return;
  }
  if (a.text) label(ctx, a.text, toRight ? lx : lx - measure(ctx, a.text, unit, p.fontFamily), ly, unit, p.fontFamily);
  ctx.restore();
}

function measure(ctx: CanvasRenderingContext2D, text: string, unit: number, font: string) {
  ctx.save();
  ctx.font = `600 ${Math.round(unit * 0.66)}px ${font}`;
  const w = ctx.measureText(text).width + unit * 0.9;
  ctx.restore();
  return w;
}

function drawPainLabel(ctx: CanvasRenderingContext2D, p: DrawParams, unit: number) {
  const pl = p.painLabel;
  if (!pl || !pl.onScreen) return;
  ctx.save();
  label(ctx, pl.text, pl.x + unit * 1.2, pl.y - unit * 1.8, unit, p.fontFamily, "#FBE3DA");
  ctx.strokeStyle = PAIN;
  ctx.lineWidth = unit * 0.07;
  ctx.beginPath();
  ctx.moveTo(pl.x, pl.y);
  ctx.lineTo(pl.x + unit * 1.2, pl.y - unit * 1.8);
  ctx.stroke();
  ctx.restore();
}

function drawSignature(ctx: CanvasRenderingContext2D, p: DrawParams, unit: number) {
  const img = p.signature;
  if (!p.showSignature || !img || !img.complete || !img.naturalWidth) return;
  const t = p.layout.text;
  const h = unit * 1.25;
  const w = (img.naturalWidth / img.naturalHeight) * h;
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.drawImage(img, t.x, t.y + t.h - h, w, h);
  ctx.restore();
}

function drawSafeGuides(ctx: CanvasRenderingContext2D, p: DrawParams, unit: number) {
  const s = p.layout.safe;
  ctx.save();
  ctx.strokeStyle = "rgba(214,180,105,.35)";
  ctx.setLineDash([unit * 0.3, unit * 0.3]);
  ctx.lineWidth = Math.max(1, unit * 0.05);
  ctx.strokeRect(s.x, s.y, s.w, s.h);
  ctx.restore();
}

/**
 * Desenha a composição no contexto já escalado para "px de saída".
 * O chamador aplica `ctx.setTransform(scale, …)` antes.
 */
export function drawComposition(ctx: CanvasRenderingContext2D, p: DrawParams) {
  const unit = Math.min(p.layout.width, p.layout.height) / 27; // ~40 px em 1080
  if (p.mode === "gilvan") drawWebcam(ctx, p);
  for (const a of p.annotations) {
    if (p.forRecording && !a.inRecording) continue;
    drawAnnotation(ctx, a, p, unit);
  }
  drawPainLabel(ctx, p, unit);
  if (p.mode !== "anatomia" || p.texts.title) drawTitle(ctx, p, unit);
  drawCaption(ctx, p, unit);
  drawNotice(ctx, p, unit);
  drawSignature(ctx, p, unit);
  if (!p.forRecording && p.showSafeGuides) drawSafeGuides(ctx, p, unit);
}

/** Fundo do quadro de gravação (por trás do canvas 3D, quando ele não cobre tudo). */
export function drawBackground(ctx: CanvasRenderingContext2D, layout: CompositionLayout, color = INK) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, layout.width, layout.height);
}
