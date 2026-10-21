import type { CameraPreset } from "./camera/framing";
import type { RegionId, V3 } from "./types";

/**
 * Regiões do atlas. Acrescentar uma região = registrar o modelo no pipeline,
 * gerar o GLB e adicionar uma entrada aqui (docs/01-inserir-modelo.md).
 */

export interface PainAreaPreset {
  id: string;
  label: string;
  /** Ponto (coordenadas do modelo) ou centro de uma estrutura. */
  center: V3 | { structure: string; offset?: V3 };
  radius: number;
}

export interface RegionConfig {
  id: RegionId;
  slug: string;
  label: string;
  status: "disponivel" | "planejada";
  modelId?: string;
  side: "right" | "left" | "midline";
  tagline: string;
  intro: string;
  observe: string[];
  cameraPresets: CameraPreset[];
  painAreas: PainAreaPreset[];
  /** Rota da mesma região no Movimentos de Volta (Moveo), quando existir. */
  movimentosPath?: string;
  keywords: string[];
}

export const REGIONS: RegionConfig[] = [
  {
    id: "shoulder",
    slug: "ombro",
    label: "Ombro",
    status: "disponivel",
    modelId: "shoulder-right",
    side: "right",
    tagline: "A articulação com mais amplitude de movimento do corpo.",
    intro:
      "O ombro reúne três ossos — úmero, escápula e clavícula — e um conjunto de músculos que trabalham juntos para levantar, girar e posicionar o braço.",
    observe: [
      "A cabeça arredondada do úmero e a escápula, nas costas.",
      "Os músculos do manguito rotador ao redor da articulação.",
      "O deltoide, que dá o contorno do ombro.",
    ],
    cameraPresets: [
      { id: "geral", label: "Visão geral", view: "oblique", target: "focus", radius: 0.24 },
      { id: "frente", label: "Frente", view: "anterior", target: "focus", radius: 0.14 },
      { id: "lateral", label: "Lateral", view: "lateral", target: "focus", radius: 0.14 },
      { id: "posterior", label: "Posterior", view: "posterior", target: "focus", radius: 0.16 },
      { id: "superior", label: "Superior", view: "superior", target: "focus", radius: 0.15 },
      { id: "close", label: "Close na articulação", view: "oblique", target: "focus", radius: 0.075, azimuthDeg: 10 },
    ],
    painAreas: [
      { id: "ombro-lateral", label: "Região lateral do ombro", center: { structure: "acromial_part_of_right_deltoid", offset: [0, 0.02, 0] }, radius: 0.05 },
      { id: "ombro-frente", label: "Região da frente do ombro", center: { structure: "long_head_of_right_biceps_brachii", offset: [0, 0.09, 0.01] }, radius: 0.045 },
    ],
    movimentosPath: "/assessment/shoulder",
    keywords: ["ombro", "braço", "manguito", "escápula"],
  },
  {
    id: "knee",
    slug: "joelho",
    label: "Joelho",
    status: "disponivel",
    modelId: "knee-right",
    side: "right",
    tagline: "Liga a coxa à perna e participa de quase todo deslocamento.",
    intro:
      "No joelho, o fêmur se apoia sobre a tíbia e a patela desliza na frente da articulação. Músculos da coxa e da perna controlam o movimento de dobrar e esticar.",
    observe: [
      "O encontro entre o fêmur (coxa) e a tíbia (perna).",
      "A patela, na frente do joelho.",
      "O quadríceps na frente da coxa e os músculos de trás da coxa.",
    ],
    cameraPresets: [
      { id: "geral", label: "Perna inteira", view: "oblique", target: { point: [-0.075, 0.45, 0.08] }, radius: 0.5, extent: [0.2, 0.52] },
      { id: "frente", label: "Frente", view: "anterior", target: "focus", radius: 0.16 },
      { id: "lateral", label: "Lateral", view: "lateral", target: "focus", radius: 0.16 },
      { id: "posterior", label: "Posterior", view: "posterior", target: "focus", radius: 0.16 },
      { id: "medial", label: "Medial", view: "medial", target: "focus", radius: 0.16 },
      { id: "close", label: "Close na articulação", view: "oblique", target: "focus", radius: 0.085, azimuthDeg: -15 },
      { id: "movimento", label: "Lateral ampla (movimento)", view: "lateral", target: { point: [-0.075, 0.34, -0.07] }, radius: 0.4, extent: [0.3, 0.42] },
      { id: "cadeia", label: "Quadril e joelho (lateral)", view: "lateral", target: { point: [-0.08, 0.5, 0.25] }, radius: 0.55, extent: [0.45, 0.48] },
    ],
    painAreas: [
      { id: "joelho-frente", label: "Região da frente do joelho", center: { structure: "right_patella" }, radius: 0.045 },
      { id: "joelho-interno", label: "Região interna do joelho", center: [-0.035, 0.385, 0.075], radius: 0.035 },
    ],
    movimentosPath: "/assessment/knee",
    keywords: ["joelho", "patela", "rótula", "menisco", "escada"],
  },
  {
    id: "spine",
    slug: "coluna",
    label: "Coluna",
    status: "disponivel",
    modelId: "spine",
    side: "midline",
    tagline: "Sustenta o tronco com movimentos distribuídos entre muitas vértebras.",
    intro:
      "A coluna é formada por vértebras empilhadas, separadas por discos. Do pescoço à parte de baixo das costas, cada trecho tem formato e funções próprios, e os músculos ao longo dela ajudam a manter a postura e a mover o tronco.",
    observe: [
      "As curvaturas naturais da coluna vistas de lado.",
      "Os discos entre as vértebras.",
      "Os músculos que acompanham a coluna, nas costas.",
    ],
    cameraPresets: [
      { id: "geral", label: "Visão geral", view: "oblique", target: "focus", radius: 0.42, extent: [0.22, 0.42], azimuthDeg: 180 },
      { id: "lateral", label: "Lateral", view: "lateral", target: "focus", radius: 0.42, extent: [0.18, 0.42] },
      { id: "posterior", label: "Posterior", view: "posterior", target: "focus", radius: 0.42, extent: [0.22, 0.42] },
      { id: "frente", label: "Frente", view: "anterior", target: "focus", radius: 0.42, extent: [0.22, 0.42] },
      { id: "lombar", label: "Parte de baixo das costas", view: "oblique", target: { structure: "fourth_lumbar_vertebra" }, radius: 0.12, azimuthDeg: 160, elevationDeg: 8 },
      { id: "lombar-lateral", label: "Lombar · lateral", view: "lateral", target: { structure: "fourth_lumbar_vertebra" }, radius: 0.12 },
      { id: "cervical", label: "Pescoço", view: "oblique", target: { structure: "fifth_cervical_vertebra" }, radius: 0.1, azimuthDeg: 150 },
    ],
    painAreas: [
      { id: "lombar", label: "Parte de baixo das costas", center: { structure: "fourth_lumbar_vertebra", offset: [0, 0, -0.04] }, radius: 0.07 },
      { id: "cervical", label: "Região do pescoço", center: { structure: "fifth_cervical_vertebra", offset: [0, 0, -0.03] }, radius: 0.05 },
    ],
    movimentosPath: "/assessment/spine",
    keywords: ["coluna", "costas", "lombar", "vértebra", "disco", "hérnia", "pescoço"],
  },
  {
    id: "hip",
    slug: "quadril",
    label: "Quadril",
    status: "disponivel",
    modelId: "hip-right",
    side: "right",
    tagline: "Encaixa a coxa na bacia e transmite o peso do tronco para as pernas.",
    intro:
      "No quadril, a cabeça arredondada do fêmur se encaixa em uma cavidade da bacia. Músculos fortes — como os glúteos e os da frente e de dentro da coxa — controlam a caminhada, o sentar e o levantar.",
    observe: [
      "O encaixe da cabeça do fêmur na bacia.",
      "Os glúteos, atrás e na lateral do quadril.",
      "O psoas e o ilíaco, na parte de dentro da bacia.",
    ],
    cameraPresets: [
      { id: "geral", label: "Visão geral", view: "oblique", target: { point: [-0.05, 0.76, 0.07] }, radius: 0.34, azimuthDeg: 15 },
      { id: "frente", label: "Frente", view: "anterior", target: "focus", radius: 0.16 },
      { id: "lateral", label: "Lateral", view: "lateral", target: "focus", radius: 0.17 },
      { id: "posterior", label: "Posterior", view: "posterior", target: "focus", radius: 0.17 },
      { id: "superior", label: "Superior", view: "superior", target: { point: [-0.03, 0.82, 0.06] }, radius: 0.22 },
      { id: "close", label: "Close na articulação", view: "oblique", target: "focus", radius: 0.08, azimuthDeg: -10 },
      { id: "movimento", label: "Lateral ampla (movimento)", view: "lateral", target: { point: [-0.087, 0.68, 0.12] }, radius: 0.38 },
    ],
    painAreas: [
      { id: "quadril-lateral", label: "Região lateral do quadril", center: [-0.16, 0.77, 0.07], radius: 0.05 },
      { id: "virilha", label: "Região da virilha", center: [-0.07, 0.78, 0.13], radius: 0.045 },
      { id: "nadega", label: "Região da nádega", center: { structure: "right_gluteus_maximus" }, radius: 0.06 },
    ],
    keywords: ["quadril", "bacia", "glúteo", "virilha", "caminhada"],
  },
  // Regiões futuras: aparecem como "em preparação", sem modelo e sem links.
  ...(["neck", "elbow", "wrist", "hand", "ankle", "foot"] as const).map(
    (id): RegionConfig => ({
      id,
      slug: { neck: "pescoco", elbow: "cotovelo", wrist: "punho", hand: "maos", ankle: "tornozelo", foot: "pes" }[id],
      label: { neck: "Pescoço", elbow: "Cotovelo", wrist: "Punho", hand: "Mãos", ankle: "Tornozelo", foot: "Pés" }[id],
      status: "planejada",
      side: "right",
      tagline: "Em preparação.",
      intro: "",
      observe: [],
      cameraPresets: [],
      painAreas: [],
      keywords: [],
    })
  ),
];

export const AVAILABLE_REGIONS = REGIONS.filter((r) => r.status === "disponivel");

export function regionBySlug(slug: string) {
  return REGIONS.find((r) => r.slug === slug && r.status === "disponivel") ?? null;
}

export function regionById(id: RegionId) {
  return REGIONS.find((r) => r.id === id) ?? null;
}
