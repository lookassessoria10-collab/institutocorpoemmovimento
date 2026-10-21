import { z } from "zod";

/**
 * Esquemas das cenas, roteiros e presets. Todos os dados editoriais passam
 * por aqui (validação em tempo de teste e na carga do estúdio).
 */

export const layerId = z.enum(["skin", "muscles", "tendons", "ligaments", "joints", "bones", "other"]);
export const regionId = z.enum(["shoulder", "knee", "spine", "hip", "neck", "elbow", "wrist", "hand", "ankle", "foot"]);
export const reviewStatus = z.enum(["rascunho", "aguardando-revisao", "aprovado", "reprovado"]);
export const publicationStatus = z.enum(["proposta", "pendente-ativos", "pronta-para-demonstracao", "publicada"]);
export const outputFormat = z.enum(["vertical", "horizontal", "square"]);
export const videoFormat = z.enum([
  "o-que-acontece-aqui-dentro",
  "por-dentro-do-movimento",
  "a-dor-esta-aqui",
  "isso-e-normal",
  "voce-faz-todos-os-dias",
  "entenda-em-30-segundos",
]);

const layerPatch = z.record(layerId, z.object({ visible: z.boolean().optional(), opacity: z.number().min(0).max(1).optional() }));

export const annotationItem = z.object({
  type: z.enum(["marcador", "seta", "legenda", "area"]),
  structure: z.string(),
  text: z.string().max(60),
  inRecording: z.boolean().default(true),
});

export const sceneStep = z.object({
  id: z.string(),
  label: z.string(),
  camera: z.string(),
  layers: layerPatch.optional(),
  highlights: z.array(z.string()).default([]),
  outline: z.array(z.string()).default([]),
  isolate: z.array(z.string()).nullable().default(null),
  painArea: z.string().nullable().default(null),
  motion: z
    .object({
      id: z.string(),
      time: z.number().min(0).max(1).default(0),
      play: z.boolean().default(false),
      speed: z.number().positive().default(1),
      loop: z.boolean().default(true),
    })
    .nullable()
    .default(null),
  title: z.string().max(90).optional(),
  caption: z.string().max(120).optional(),
  /** Texto exibido no atlas público durante o passo. */
  publicText: z.string().optional(),
  /** Pontos de fala para Gilvan (não aparecem na tela). */
  talkingPoints: z.array(z.string()).default([]),
  annotations: z.array(annotationItem).default([]),
  durationSec: z.number().positive(),
  /** Quando o passo depende de ativo inexistente: motivo (o passo fica marcado como pendente). */
  pending: z.string().optional(),
});

export const scene = z.object({
  id: z.string(),
  number: z.number().int().min(1),
  slug: z.string(),
  title: z.string(),
  region: regionId,
  modelId: z.string(),
  videoFormat,
  summary: z.string(),
  initialCamera: z.string(),
  cameraPresets: z.array(z.string()).min(1),
  activeLayers: z.array(layerId),
  animationId: z.string().nullable(),
  animationSpeed: z.number().positive(),
  highlightTargets: z.array(z.string()),
  annotationItems: z.array(annotationItem),
  scriptId: z.string(),
  estimatedDuration: z.number().positive(),
  outputFormat,
  clinicalReviewStatus: reviewStatus,
  publicationStatus,
  /** Ativos de que a cena depende e ainda não existem (preenchido à mão e conferido pelo validador). */
  pendingAssets: z.array(z.string()).default([]),
  coverageNote: z.string().optional(),
  institutionalClosing: z.string(),
  steps: z.array(sceneStep).min(1),
});

export const script = z.object({
  id: z.string(),
  sceneId: z.string(),
  videoFormat,
  theme: z.string(),
  hook: z.string(),
  everydayContext: z.string(),
  structuresToShow: z.array(z.string()),
  suggestedMovement: z.string(),
  supportText: z.array(z.string()),
  visualGuidance: z.array(z.string()),
  closing: z.string(),
  durationSec: z.tuple([z.number(), z.number()]),
  editorialStatus: z.enum(["rascunho", "aguardando-revisao-clinica", "aprovado", "gravado", "publicado"]),
  clinicalReviewStatus: reviewStatus,
  notes: z.array(z.string()).default([]),
});

export const question = z.object({
  id: z.string(),
  text: z.string(),
  region: regionId,
  sceneId: z.string(),
  shortAnswer: z.string(),
});

export const viewPreset = z.object({
  id: z.string(),
  label: z.string(),
  region: regionId,
  camera: z.string(),
  layers: layerPatch,
  motion: z.object({ id: z.string(), time: z.number().min(0).max(1) }).nullable(),
  highlights: z.array(z.string()).default([]),
  background: z.enum(["institucional"]).default("institucional"),
  note: z.string().optional(),
});

export type Scene = z.infer<typeof scene>;
export type SceneInput = z.input<typeof scene>;
export type SceneStep = z.infer<typeof sceneStep>;
export type Script = z.infer<typeof script>;
export type Question = z.infer<typeof question>;
export type ViewPreset = z.infer<typeof viewPreset>;
export type VideoFormat = z.infer<typeof videoFormat>;
export type PublicationStatus = z.infer<typeof publicationStatus>;

export const VIDEO_FORMAT_LABELS: Record<VideoFormat, { label: string; description: string }> = {
  "o-que-acontece-aqui-dentro": {
    label: "O que acontece aqui dentro?",
    description: "Uma região do corpo é apresentada com as camadas anatômicas, de fora para dentro.",
  },
  "por-dentro-do-movimento": {
    label: "Por dentro do movimento",
    description: "Uma atividade cotidiana é demonstrada por animação.",
  },
  "a-dor-esta-aqui": {
    label: "A dor está aqui. Mas por quê?",
    description: "A região do desconforto é destacada e são apresentados mecanismos gerais possíveis.",
  },
  "isso-e-normal": {
    label: "Isso é normal?",
    description: "Uma dúvida comum explicada com apoio visual, sem diagnósticos ou afirmações absolutas.",
  },
  "voce-faz-todos-os-dias": {
    label: "Você faz esse movimento todos os dias",
    description: "Uma atividade simples é o ponto de partida para uma explicação anatômica.",
  },
  "entenda-em-30-segundos": {
    label: "Entenda em 30 segundos",
    description: "Conteúdo curto e direto sobre uma estrutura ou movimento.",
  },
};

export const PUBLICATION_LABELS: Record<z.infer<typeof publicationStatus>, string> = {
  proposta: "Proposta",
  "pendente-ativos": "Pendente de ativos",
  "pronta-para-demonstracao": "Pronta para demonstração",
  publicada: "Publicada",
};
