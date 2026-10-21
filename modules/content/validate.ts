import { availableLayers, MODELS } from "@/modules/anatomy/assets/registry";
import { getMotion } from "@/modules/anatomy/kinematics/motions";
import { REGIONS, type RegionConfig } from "@/modules/anatomy/regions";
import { QUESTIONS } from "./questions";
import { VIEW_PRESETS } from "./presets";
import { SCENES } from "./scenes";
import type { Scene } from "./schema";
import { SCRIPTS } from "./scripts";

/**
 * Validação cruzada do conteúdo contra os ativos reais: nenhuma cena pode
 * citar estrutura, câmera, camada, área ou movimento que não exista.
 * Executada pelos testes (npm test) e exibida no estúdio.
 */

export interface ContentIssue {
  where: string;
  message: string;
}

export function regionForModel(modelId: string): RegionConfig | null {
  return REGIONS.find((r) => r.modelId === modelId) ?? null;
}

export function validateScene(s: Scene): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const at = (m: string, step?: string) => issues.push({ where: step ? `${s.id} › ${step}` : s.id, message: m });
  const model = MODELS[s.modelId];
  if (!model) {
    at(`modelo inexistente: ${s.modelId}`);
    return issues;
  }
  const region = regionForModel(s.modelId);
  const cameraIds = new Set(region?.cameraPresets.map((p) => p.id) ?? []);
  const painIds = new Set(region?.painAreas.map((p) => p.id) ?? []);
  const structures = new Set(model.structures.map((x) => x.id));
  const layers = new Set(availableLayers(model));

  const checkStructure = (id: string, step?: string) => {
    if (!structures.has(id)) at(`estrutura inexistente no modelo ${s.modelId}: ${id}`, step);
  };
  const checkMotion = (id: string, step?: string) => {
    const m = getMotion(id);
    if (!m) at(`movimento inexistente: ${id}`, step);
    else if (m.modelId !== s.modelId) at(`movimento ${id} pertence ao modelo ${m.modelId}`, step);
  };

  for (const c of [s.initialCamera, ...s.cameraPresets]) if (!cameraIds.has(c)) at(`câmera inexistente: ${c}`);
  for (const l of s.activeLayers) if (!layers.has(l)) at(`camada indisponível no modelo: ${l}`);
  s.highlightTargets.forEach((id) => checkStructure(id));
  s.annotationItems.forEach((a) => checkStructure(a.structure));
  if (s.animationId) checkMotion(s.animationId);
  if (!SCRIPTS.some((r) => r.id === s.scriptId && r.sceneId === s.id)) at(`roteiro ${s.scriptId} ausente ou ligado a outra cena`);

  let hasPendingStep = false;
  for (const st of s.steps) {
    if (!cameraIds.has(st.camera)) at(`câmera inexistente: ${st.camera}`, st.id);
    [...st.highlights, ...st.outline, ...(st.isolate ?? [])].forEach((id) => checkStructure(id, st.id));
    st.annotations.forEach((a) => checkStructure(a.structure, st.id));
    if (st.painArea && !painIds.has(st.painArea)) at(`área de desconforto inexistente: ${st.painArea}`, st.id);
    if (st.motion) checkMotion(st.motion.id, st.id);
    if (st.layers) for (const l of Object.keys(st.layers)) if (!layers.has(l as never)) at(`camada indisponível: ${l}`, st.id);
    if (st.pending) hasPendingStep = true;
  }

  if (s.publicationStatus === "pronta-para-demonstracao" || s.publicationStatus === "publicada") {
    if (s.pendingAssets.length) at("cena marcada como pronta, mas lista ativos pendentes");
    if (hasPendingStep && !s.coverageNote) at("cena pronta com passo pendente precisa de nota de cobertura (coverageNote)");
  }
  if (s.publicationStatus === "pendente-ativos" && !s.pendingAssets.length) at("cena pendente sem lista de ativos pendentes");
  if (s.publicationStatus === "publicada" && s.clinicalReviewStatus !== "aprovado") at("cena publicada sem revisão clínica aprovada");
  return issues;
}

export function validateContent(): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const ids = new Set<string>();
  for (const s of SCENES) {
    if (ids.has(s.id)) issues.push({ where: s.id, message: "id de cena repetido" });
    ids.add(s.id);
    issues.push(...validateScene(s));
  }
  for (const q of QUESTIONS) if (!ids.has(q.sceneId)) issues.push({ where: q.id, message: `pergunta aponta para cena inexistente: ${q.sceneId}` });
  for (const r of SCRIPTS) if (!ids.has(r.sceneId)) issues.push({ where: r.id, message: `roteiro aponta para cena inexistente: ${r.sceneId}` });
  for (const p of VIEW_PRESETS) {
    const region = REGIONS.find((r) => r.id === p.region);
    const model = region?.modelId ? MODELS[region.modelId] : null;
    if (!model || !region) {
      issues.push({ where: p.id, message: "região sem modelo" });
      continue;
    }
    if (!region.cameraPresets.some((c) => c.id === p.camera)) issues.push({ where: p.id, message: `câmera inexistente: ${p.camera}` });
    for (const h of p.highlights) if (!model.structures.some((x) => x.id === h)) issues.push({ where: p.id, message: `estrutura inexistente: ${h}` });
    if (p.motion) {
      const m = getMotion(p.motion.id);
      if (!m || m.modelId !== model.id) issues.push({ where: p.id, message: `movimento inválido: ${p.motion.id}` });
    }
  }
  return issues;
}

/** Situação de uma cena para exibição (nunca "concluída" sem ativos e revisão). */
export function sceneReadiness(s: Scene) {
  const pendingSteps = s.steps.filter((x) => x.pending).length;
  return {
    assetsReady: s.publicationStatus !== "pendente-ativos" && s.pendingAssets.length === 0,
    clinicallyApproved: s.clinicalReviewStatus === "aprovado",
    pendingSteps,
    partial: pendingSteps > 0,
  };
}
