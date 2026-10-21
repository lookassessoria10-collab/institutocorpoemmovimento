/**
 * Tipos centrais do sistema anatômico compartilhado pelo atlas público e
 * pelo Estúdio Gilvan. Um único conjunto de modelos, estruturas, camadas e
 * movimentos alimenta as duas experiências.
 */

/** Mesmos identificadores usados pelo Moveo (`stores/appStore.ts`), mais quadril e regiões futuras. */
export type RegionId =
  | "shoulder"
  | "knee"
  | "spine"
  | "hip"
  | "neck"
  | "elbow"
  | "wrist"
  | "hand"
  | "ankle"
  | "foot";

export const PRIORITY_REGIONS = ["shoulder", "knee", "spine", "hip"] as const;

/**
 * Camadas do corpo. Uma camada só aparece na interface quando o modelo da
 * região tem estruturas reais classificadas nela (ver `availableLayers`).
 */
export type LayerId = "skin" | "muscles" | "tendons" | "ligaments" | "joints" | "bones" | "other";

/** Ordem de fora para dentro, usada na transparência progressiva. */
export const LAYER_ORDER: LayerId[] = ["skin", "muscles", "tendons", "ligaments", "joints", "bones", "other"];

/** Estado de revisão clínica (Gilvan ou equipe habilitada do Instituto). */
export type ClinicalReviewStatus = "rascunho" | "aguardando-revisao" | "aprovado" | "reprovado";

export type Side = "right" | "left" | "midline";

/** Uma estrutura anatômica presente em um modelo (um nó do GLB). */
export interface AnatomicalStructure {
  /** Nome do nó no GLB — gerado pelo pipeline a partir dos identificadores da fonte. */
  id: string;
  /** Identificadores reais da fonte (ex.: FMA IDs do BodyParts3D) que compõem a malha. */
  sourceIds: string[];
  /** Nome técnico: inglês exatamente como na lista de partes da fonte; português pela Terminologia Anatômica. */
  technicalName: { en: string; pt: string };
  /** Nome exibido ao visitante (linguagem cotidiana, anatomicamente correta). */
  publicName: string;
  /** Explicação curta para o visitante. Vazia = sem texto aprovado ainda. */
  description: string;
  layer: LayerId;
  side: Side;
  /** Segmento rígido para os movimentos (ex.: "perna", "patela"). */
  segment?: string;
  /** Nome que aparece em buscas (sinônimos cotidianos). */
  keywords?: string[];
  reviewStatus: ClinicalReviewStatus;
}

export type V3 = [number, number, number];

/** Eixo articular calculado pelo pipeline a partir da geometria real. */
export interface JointAxis {
  id: string;
  /** Ponto do eixo (coordenadas do modelo, metros). */
  origin: V3;
  /** Direção unitária do eixo (coordenadas do modelo). */
  axis: V3;
  /** Como o eixo foi obtido (documentação da procedência). */
  method: string;
  /** Eixos anatômicos nomeados (flexão, abdução, rotação), quando aplicável. */
  axes?: Record<string, V3>;
  /** Contato patelofemoral pré-calculado (deslocamento radial por ângulo). */
  patellaContact?: { radial: V3; restGap: number; table: Array<{ deg: number; delta: number }> };
}

/** Manifesto de um modelo, gerado pelo pipeline junto com o GLB. */
export interface AnatomyModelManifest {
  id: string;
  region: RegionId | "body";
  title: string;
  file: string;
  bytes: number;
  sha256: string;
  sourceId: string;
  /** Sistema de coordenadas do GLB: metros, +Y superior, +Z anterior, +X à esquerda do corpo. */
  units: "m";
  bounds: { min: V3; max: V3 };
  /** Centro de interesse da região (articulação principal). */
  focus: V3;
  /** Raio que precisa caber no enquadramento geral. */
  focusRadius: number;
  triangles: number;
  structures: Array<{
    id: string;
    sourceIds: string[];
    nameEn: string;
    layer: LayerId;
    segment?: string;
    triangles: number;
    center: V3;
    /** Centro dentro do recorte de pele da região (oculta com a pele opaca). */
    coveredBySkin?: boolean;
  }>;
  joints: JointAxis[];
  limitations: string[];
  generatedAt: string;
}
