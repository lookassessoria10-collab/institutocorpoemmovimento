import { viewPreset, type ViewPreset } from "./schema";

/**
 * Presets de visualização prontos (o estúdio também permite salvar presets
 * próprios no navegador e exportá-los como JSON para entrar aqui).
 */
const RAW: ViewPreset[] = [
  {
    id: "ombro-lateral-musculos",
    label: "Ombro · câmera lateral · músculos visíveis",
    region: "shoulder",
    camera: "lateral",
    layers: { skin: { visible: false }, muscles: { visible: true, opacity: 1 }, bones: { visible: true } },
    motion: null,
    highlights: [],
    background: "institucional",
    note: "O briefing pede este preset com a elevação do braço; a animação do ombro ainda está pendente.",
  },
  {
    id: "joelho-lateral-ossos-pausado",
    label: "Joelho · vista lateral · ossos visíveis · movimento pausado",
    region: "knee",
    camera: "lateral",
    layers: { skin: { visible: false }, muscles: { visible: false }, tendons: { visible: false }, bones: { visible: true } },
    motion: { id: "joelho-flexao-extensao", time: 0.25 },
    highlights: ["right_femur", "right_tibia", "right_patella"],
    background: "institucional",
  },
  {
    id: "quadril-posterior-gluteos",
    label: "Quadril · posterior · glúteos em destaque",
    region: "hip",
    camera: "posterior",
    layers: { skin: { visible: false } },
    motion: null,
    highlights: ["right_gluteus_maximus", "right_gluteus_medius"],
    background: "institucional",
  },
  {
    id: "coluna-lombar-discos",
    label: "Coluna · lombar lateral · ossos e discos",
    region: "spine",
    camera: "lombar-lateral",
    layers: { muscles: { visible: false } },
    motion: null,
    highlights: [],
    background: "institucional",
  },
];

export const VIEW_PRESETS: ViewPreset[] = RAW.map((p) => viewPreset.parse(p));
