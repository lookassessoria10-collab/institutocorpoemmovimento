import type { V3 } from "../types";

/**
 * Enquadramento anatômico. Convenção dos modelos (gerados pelo pipeline):
 * metros, +Y superior, +Z anterior, +X à esquerda do corpo.
 * Para estruturas do lado direito, a face lateral fica em −X.
 */
export type AnatomicalView = "anterior" | "posterior" | "lateral" | "medial" | "superior" | "inferior" | "oblique";

export const VIEW_LABELS: Record<AnatomicalView, string> = {
  anterior: "Frente",
  posterior: "Posterior",
  lateral: "Lateral",
  medial: "Medial",
  superior: "Superior",
  inferior: "Inferior",
  oblique: "Oblíqua",
};

export interface CameraPreset {
  id: string;
  label: string;
  view: AnatomicalView;
  /** "focus" = centro de interesse do modelo; ou id de estrutura; ou ponto. */
  target: "focus" | { structure: string } | { point: V3 };
  /** Raio (m) que deve caber no quadro. */
  radius: number;
  /**
   * Meia-largura e meia-altura (m) do que precisa caber no quadro. Quando
   * definido, substitui o raio: estruturas altas (perna, coluna) aproveitam
   * melhor o formato vertical sem cortar nada no horizontal.
   */
  extent?: [number, number];
  /** Ajustes finos em graus (azimute em torno de +Y, elevação acima do horizonte). */
  azimuthDeg?: number;
  elevationDeg?: number;
}

function normalize(v: V3): V3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

/** Direção do alvo para a câmera, conforme a vista e o lado da região. */
export function viewDirection(view: AnatomicalView, side: "right" | "left" | "midline", azimuthDeg = 0, elevationDeg = 0): V3 {
  // Lado direito do corpo = −X; lado esquerdo = +X.
  const lateralSign = side === "left" ? 1 : -1;
  let base: V3;
  switch (view) {
    case "anterior":
      base = [0, 0, 1];
      break;
    case "posterior":
      base = [0, 0, -1];
      break;
    case "lateral":
      base = [lateralSign, 0, 0];
      break;
    case "medial":
      base = [-lateralSign, 0, 0];
      break;
    case "superior":
      // Levemente anterior: evita a singularidade da câmera olhando exatamente para baixo.
      base = normalize([0, 1, 0.12]);
      break;
    case "inferior":
      base = normalize([0, -1, 0.12]);
      break;
    case "oblique":
      base = normalize([lateralSign * 0.7, 0.25, 0.7]);
      break;
  }
  if (!azimuthDeg && !elevationDeg) return base;
  const az = (azimuthDeg * Math.PI) / 180;
  const el = (elevationDeg * Math.PI) / 180;
  // Rotação em torno de +Y (azimute)…
  const x1 = base[0] * Math.cos(az) + base[2] * Math.sin(az);
  const z1 = -base[0] * Math.sin(az) + base[2] * Math.cos(az);
  // …e elevação ao longo do plano vertical da direção.
  const horiz = Math.hypot(x1, z1);
  const y = base[1] * Math.cos(el) + horiz * Math.sin(el);
  const h = horiz * Math.cos(el) - base[1] * Math.sin(el);
  const k = horiz > 1e-6 ? h / horiz : 0;
  return normalize([x1 * k, y, z1 * k]);
}

/**
 * Distância para que uma esfera de raio `radius` caiba no quadro com
 * margem, considerando o FOV vertical e a proporção do viewport (o quadro
 * vertical 9:16 é limitado pela largura; o 16:9, pela altura).
 */
export function fitDistance(radius: number, fovYDeg: number, aspect: number, margin = 1.12): number {
  const fovY = (fovYDeg * Math.PI) / 180;
  const fovX = 2 * Math.atan(Math.tan(fovY / 2) * aspect);
  const limiting = Math.min(fovY, fovX);
  return (radius * margin) / Math.sin(limiting / 2);
}

/** Distância para caber um retângulo (meia-largura × meia-altura) no quadro. */
export function fitDistanceBox(halfW: number, halfH: number, fovYDeg: number, aspect: number, margin = 1.1): number {
  const ty = Math.tan(((fovYDeg * Math.PI) / 180) / 2);
  const tx = ty * aspect;
  return Math.max(halfW / tx, halfH / ty) * margin;
}

export function cameraPositionFor(target: V3, dir: V3, distance: number): V3 {
  return [target[0] + dir[0] * distance, target[1] + dir[1] * distance, target[2] + dir[2] * distance];
}
