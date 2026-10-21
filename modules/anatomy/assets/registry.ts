import type { AnatomyModelManifest, LayerId, RegionId } from "../types";
import body from "./manifests/body-skeleton.json";
import hip from "./manifests/hip-right.json";
import knee from "./manifests/knee-right.json";
import shoulder from "./manifests/shoulder-right.json";
import spine from "./manifests/spine.json";
import { SOURCES } from "./sources";

/**
 * Registro dos modelos anatômicos. Os manifestos são gerados pelo pipeline
 * (scripts/anatomy) junto com cada GLB; nada aqui é escrito à mão além do
 * mapeamento região → modelo.
 */
export const MODELS: Record<string, AnatomyModelManifest> = {
  "knee-right": knee as unknown as AnatomyModelManifest,
  "hip-right": hip as unknown as AnatomyModelManifest,
  "shoulder-right": shoulder as unknown as AnatomyModelManifest,
  spine: spine as unknown as AnatomyModelManifest,
  "body-skeleton": body as unknown as AnatomyModelManifest,
};

export const REGION_MODEL: Partial<Record<RegionId, string>> = {
  knee: "knee-right",
  hip: "hip-right",
  shoulder: "shoulder-right",
  spine: "spine",
};

export const OVERVIEW_MODEL = "body-skeleton";

export function getModel(id: string): AnatomyModelManifest {
  const m = MODELS[id];
  if (!m) throw new Error(`Modelo anatômico não registrado: ${id}`);
  return m;
}

export function modelForRegion(region: RegionId): AnatomyModelManifest | null {
  const id = REGION_MODEL[region];
  return id ? getModel(id) : null;
}

/** Camadas com pelo menos uma estrutura real no modelo. */
export function availableLayers(model: AnatomyModelManifest): LayerId[] {
  const set = new Set(model.structures.map((s) => s.layer));
  return (["skin", "muscles", "tendons", "ligaments", "joints", "bones", "other"] as LayerId[]).filter((l) => set.has(l));
}

export function sourceOf(model: AnatomyModelManifest) {
  return SOURCES[model.sourceId];
}
