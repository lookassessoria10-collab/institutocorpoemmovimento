import { Color, DoubleSide, FrontSide, MeshPhysicalMaterial } from "three";
import type { LayerId } from "../types";

/**
 * Aparência por camada. A fonte (BodyParts3D) não tem texturas: as cores são
 * convenções educativas, sóbrias, próximas das usadas em atlas impressos.
 */
const LOOK: Record<LayerId, { color: string; roughness: number; sheen?: number; sheenColor?: string; clearcoat?: number; double?: boolean }> = {
  bones: { color: "#E7DCC6", roughness: 0.62, clearcoat: 0.08 },
  muscles: { color: "#9E3530", roughness: 0.52, sheen: 0.55, sheenColor: "#D9877E" },
  tendons: { color: "#E4DED0", roughness: 0.32, clearcoat: 0.35 },
  ligaments: { color: "#DCD7C8", roughness: 0.34, clearcoat: 0.3 },
  joints: { color: "#9FC3D4", roughness: 0.3, clearcoat: 0.45 },
  skin: { color: "#D7A98F", roughness: 0.62, sheen: 0.3, sheenColor: "#F1C9B5", double: true },
  other: { color: "#B8B0A8", roughness: 0.6 },
};

/** Ordem de desenho de fora para dentro: camadas externas são desenhadas por último. */
export const LAYER_RENDER_ORDER: Record<LayerId, number> = {
  bones: 1,
  joints: 2,
  ligaments: 3,
  tendons: 4,
  muscles: 5,
  other: 6,
  skin: 7,
};

export const HIGHLIGHT_COLOR = new Color("#D6B469");
export const HOVER_COLOR = new Color("#ECD9AD");

export function createLayerMaterial(layer: LayerId): MeshPhysicalMaterial {
  const l = LOOK[layer];
  const m = new MeshPhysicalMaterial({
    color: new Color(l.color),
    roughness: l.roughness,
    metalness: 0,
    sheen: l.sheen ?? 0,
    sheenColor: new Color(l.sheenColor ?? "#ffffff"),
    sheenRoughness: 0.6,
    clearcoat: l.clearcoat ?? 0,
    clearcoatRoughness: 0.5,
    side: l.double ? DoubleSide : FrontSide,
    transparent: false,
    opacity: 1,
  });
  m.userData.baseColor = m.color.clone();
  return m;
}

export interface VisualState {
  opacity: number;
  emphasis: 0 | 1 | 2 | 3; // 0 nada · 1 hover · 2 destaque · 3 selecionada
  dim: boolean;
}

/** Aplica opacidade/ênfase sem recriar materiais (evita recompilar shaders). */
export function applyVisual(m: MeshPhysicalMaterial, v: VisualState, pulse: number) {
  const transparent = v.opacity < 0.999;
  if (m.transparent !== transparent) {
    m.transparent = transparent;
    m.needsUpdate = true;
  }
  m.opacity = v.opacity;
  // Estruturas translúcidas não escrevem profundidade: as camadas internas
  // continuam visíveis através delas.
  m.depthWrite = v.opacity > 0.65;
  const base = m.userData.baseColor as Color;
  m.color.copy(base);
  if (v.dim) m.color.multiplyScalar(0.55);
  if (v.emphasis >= 2) {
    m.emissive.copy(HIGHLIGHT_COLOR);
    m.emissiveIntensity = (v.emphasis === 3 ? 0.32 : 0.24) + pulse * 0.08;
  } else if (v.emphasis === 1) {
    m.emissive.copy(HOVER_COLOR);
    m.emissiveIntensity = 0.12;
  } else {
    m.emissiveIntensity = 0;
  }
}
