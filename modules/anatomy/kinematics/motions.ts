import type { ClinicalReviewStatus, LayerId, RegionId } from "../types";

/**
 * Movimentos articulares demonstrativos.
 *
 * Cada movimento é uma cadeia de rotações rígidas de segmentos ósseos em
 * torno de eixos calculados na própria malha (ver scripts/anatomy/joints.mjs
 * e docs/04-animacoes.md). Não há deformação de músculos ou pele: por isso
 * essas camadas são ocultadas automaticamente enquanto o movimento é exibido.
 *
 * Amplitudes: valores DEMONSTRATIVOS, menores ou iguais às amplitudes
 * normais de referência citadas em `references`. Não representam a medida de
 * nenhum paciente. Todos aguardam revisão clínica/anatômica.
 */

export interface MotionTrack {
  /** Id do eixo no manifesto do modelo (ex.: "knee-tea"). */
  joint: string;
  /** Qual eixo do manifesto usar: o principal ou um eixo anatômico nomeado. */
  axis: "primary" | "flexion" | "abduction" | "rotation";
  /** +1 / −1 para que ângulos positivos correspondam ao movimento nomeado. */
  direction: 1 | -1;
  /** Segmentos movidos por esta articulação (inclui os distais). */
  segments: string[];
  /**
   * Fração do ângulo aplicada a segmentos específicos (ex.: patela). Valores
   * diferentes de 1 são aproximações visuais e precisam de validação.
   */
  segmentFactor?: Record<string, number>;
  /**
   * Segmento que mantém contato com o fêmur usando a tabela patelofemoral do
   * manifesto (deslocamento radial calculado na malha).
   */
  contactSegment?: string;
  /** Pontos-chave do ângulo (graus) ao longo do tempo normalizado (0–1). */
  keyframes: Array<{ t: number; deg: number }>;
  label: string;
}

export interface MotionDefinition {
  id: string;
  region: RegionId;
  modelId: string;
  title: string;
  /** Texto curto para o visitante (o que observar). */
  publicDescription: string;
  durationSec: number;
  /** Ordem proximal → distal: as matrizes são compostas nessa ordem. */
  tracks: MotionTrack[];
  /** Camadas que não acompanham o movimento e são ocultadas durante a exibição. */
  hiddenLayersWhileMoving: LayerId[];
  rangeNote: string;
  references: string[];
  limitations: string[];
  reviewStatus: ClinicalReviewStatus;
}

const STATIC_LAYERS: LayerId[] = ["skin", "muscles", "tendons", "ligaments"];

export const MOTIONS: MotionDefinition[] = [
  {
    id: "joelho-flexao-extensao",
    region: "knee",
    modelId: "knee-right",
    title: "Dobrar e esticar o joelho",
    publicDescription:
      "A tíbia gira em relação ao fêmur e a patela acompanha o movimento na frente do joelho. Use a linha do tempo para parar em qualquer posição.",
    durationSec: 4,
    tracks: [
      {
        joint: "knee-tea",
        axis: "primary",
        direction: 1,
        segments: ["perna", "patela"],
        segmentFactor: { patela: 0.7 },
        contactSegment: "patela",
        keyframes: [
          { t: 0, deg: 0 },
          { t: 0.5, deg: 90 },
          { t: 1, deg: 0 },
        ],
        label: "Flexão do joelho",
      },
    ],
    hiddenLayersWhileMoving: STATIC_LAYERS,
    rangeNote:
      "Amplitude demonstrativa de 0° a 90°, menor que a amplitude normal de referência da flexão do joelho (0°–135°, AAOS).",
    references: [
      "American Academy of Orthopaedic Surgeons. Joint Motion: Method of Measuring and Recording. Chicago: AAOS; 1965 (amplitudes de referência).",
      "Churchill DL et al. The transepicondylar axis approximates the optimal flexion axis of the knee. Clin Orthop Relat Res. 1998;356:111–8.",
    ],
    limitations: [
      "Eixo único (transepicondilar): não reproduz o rolamento e deslizamento do fêmur sobre a tíbia nem a rotação automática final do joelho.",
      "A patela gira 70% do ângulo da tíbia em torno do mesmo eixo (proporção provisória, a ser validada) e se aproxima do eixo o necessário para manter a mesma folga com o fêmur medida em repouso (tabela calculada na malha).",
      "Músculos, pele e trato iliotibial não se deformam e ficam ocultos durante o movimento.",
    ],
    reviewStatus: "aguardando-revisao",
  },
  {
    id: "sentar-levantar",
    region: "knee",
    modelId: "knee-right",
    title: "Da posição sentada para em pé",
    publicDescription:
      "Quadril e joelho estendem juntos ao levantar da cadeira. A pelve fica fixa na tela para facilitar a observação do quadril e do joelho.",
    durationSec: 5,
    tracks: [
      {
        joint: "hip-center",
        axis: "flexion",
        direction: -1,
        segments: ["coxa", "perna", "patela"],
        keyframes: [
          { t: 0, deg: 90 },
          { t: 0.15, deg: 90 },
          { t: 0.75, deg: 0 },
          { t: 1, deg: 0 },
        ],
        label: "Flexão do quadril",
      },
      {
        joint: "knee-tea",
        axis: "primary",
        direction: 1,
        segments: ["perna", "patela"],
        segmentFactor: { patela: 0.7 },
        contactSegment: "patela",
        keyframes: [
          { t: 0, deg: 90 },
          { t: 0.15, deg: 90 },
          { t: 0.75, deg: 0 },
          { t: 1, deg: 0 },
        ],
        label: "Flexão do joelho",
      },
    ],
    hiddenLayersWhileMoving: STATIC_LAYERS,
    rangeNote:
      "Posição sentada representada com quadril e joelho a 90°, dentro das amplitudes normais de referência (quadril 0°–120°, joelho 0°–135°, AAOS). A movimentação do tronco, do tornozelo e da pelve não é representada.",
    references: [
      "American Academy of Orthopaedic Surgeons. Joint Motion: Method of Measuring and Recording. Chicago: AAOS; 1965 (amplitudes de referência).",
    ],
    limitations: [
      "Referencial fixo na pelve: o tronco e os pés não aparecem; no movimento real, o tronco inclina e a pelve se desloca.",
      "Quadril e joelho estendem em sincronia (simplificação); a patela usa a mesma aproximação provisória do movimento de flexão.",
      "Músculos, pele e trato iliotibial ficam ocultos durante o movimento.",
    ],
    reviewStatus: "aguardando-revisao",
  },
  {
    id: "quadril-flexao",
    region: "hip",
    modelId: "hip-right",
    title: "Levantar a coxa (flexão do quadril)",
    publicDescription:
      "A cabeça do fêmur gira dentro do encaixe da bacia, como uma esfera em uma cavidade. Observe o movimento por diferentes ângulos.",
    durationSec: 4,
    tracks: [
      {
        joint: "hip-center",
        axis: "flexion",
        direction: -1,
        segments: ["coxa"],
        keyframes: [
          { t: 0, deg: 0 },
          { t: 0.5, deg: 90 },
          { t: 1, deg: 0 },
        ],
        label: "Flexão do quadril",
      },
    ],
    hiddenLayersWhileMoving: STATIC_LAYERS,
    rangeNote: "Amplitude demonstrativa de 0° a 90°, menor que a amplitude normal de referência da flexão do quadril (0°–120°, AAOS).",
    references: ["American Academy of Orthopaedic Surgeons. Joint Motion: Method of Measuring and Recording. Chicago: AAOS; 1965."],
    limitations: [
      "Rotação pura em torno do centro da cabeça femoral (ajuste de esfera na malha), sem movimento da pelve.",
      "Músculos e pele ficam ocultos durante o movimento.",
    ],
    reviewStatus: "aguardando-revisao",
  },
  {
    id: "quadril-caminhada",
    region: "hip",
    modelId: "hip-right",
    title: "O quadril durante a caminhada (plano lateral)",
    publicDescription:
      "Na caminhada, a coxa vai para a frente e para trás a cada passo. Aqui só o movimento do quadril visto de lado é representado.",
    durationSec: 2.4,
    tracks: [
      {
        joint: "hip-center",
        axis: "flexion",
        direction: -1,
        segments: ["coxa"],
        keyframes: [
          { t: 0, deg: 30 },
          { t: 0.5, deg: -10 },
          { t: 1, deg: 30 },
        ],
        label: "Flexão/extensão do quadril",
      },
    ],
    hiddenLayersWhileMoving: STATIC_LAYERS,
    rangeNote:
      "Ciclo demonstrativo de cerca de 30° de flexão a 10° de extensão, compatível com descrições clássicas da marcha normal no plano sagital (Perry & Burnfield).",
    references: ["Perry J, Burnfield JM. Gait Analysis: Normal and Pathological Function. 2ª ed. Thorofare: SLACK; 2010."],
    limitations: [
      "Apenas o plano sagital: as rotações e inclinações da pelve e do quadril na marcha não são representadas.",
      "Curva simplificada (ida e volta suave), sem as fases detalhadas do ciclo da marcha.",
    ],
    reviewStatus: "aguardando-revisao",
  },
  {
    id: "quadril-sentar-levantar",
    region: "hip",
    modelId: "hip-right",
    title: "O quadril ao levantar da cadeira",
    publicDescription: "Ao levantar, o quadril sai de uma posição dobrada para a posição em pé. A pelve fica fixa na tela.",
    durationSec: 4,
    tracks: [
      {
        joint: "hip-center",
        axis: "flexion",
        direction: -1,
        segments: ["coxa"],
        keyframes: [
          { t: 0, deg: 90 },
          { t: 0.15, deg: 90 },
          { t: 0.8, deg: 0 },
          { t: 1, deg: 0 },
        ],
        label: "Flexão do quadril",
      },
    ],
    hiddenLayersWhileMoving: STATIC_LAYERS,
    rangeNote: "Posição sentada representada com o quadril a 90° (amplitude normal de referência 0°–120°, AAOS).",
    references: ["American Academy of Orthopaedic Surgeons. Joint Motion: Method of Measuring and Recording. Chicago: AAOS; 1965."],
    limitations: ["Referencial fixo na pelve; tronco e joelho não são representados neste modelo."],
    reviewStatus: "aguardando-revisao",
  },
];

/** Movimentos que dependem de ativos ainda não disponíveis (não aparecem como prontos). */
export const PENDING_MOTIONS: Array<{ id: string; region: RegionId; title: string; reason: string }> = [
  {
    id: "ombro-elevacao",
    region: "shoulder",
    title: "Elevação do braço",
    reason:
      "Requer cadeia escapulotorácica (clavícula, escápula e úmero com ritmo escapuloumeral) validada. Os eixos do ombro já foram calculados (centro da cabeça do úmero), mas o movimento combinado ainda não foi validado.",
  },
  {
    id: "ombro-rotacao",
    region: "shoulder",
    title: "Rotação do ombro",
    reason: "Requer validação clínica do eixo longitudinal do úmero e da posição do cotovelo; não implementado.",
  },
  {
    id: "coluna-flexao-extensao",
    region: "spine",
    title: "Flexão e extensão da coluna",
    reason:
      "Requer distribuição segmentar do movimento entre as vértebras e deformação dos discos, sem ativo confiável no acervo atual.",
  },
];

export function motionsForModel(modelId: string) {
  return MOTIONS.filter((m) => m.modelId === modelId);
}

export function getMotion(id: string | null | undefined) {
  return id ? MOTIONS.find((m) => m.id === id) ?? null : null;
}
