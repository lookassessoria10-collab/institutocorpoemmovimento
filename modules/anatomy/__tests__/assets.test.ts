import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { availableLayers, MODELS, REGION_MODEL } from "../assets/registry";
import { structureText } from "../structures/catalog";

const root = path.resolve(__dirname, "../../..");

describe("ativos anatômicos", () => {
  it("cada manifesto aponta para um GLB existente, com o mesmo SHA-256", () => {
    for (const m of Object.values(MODELS)) {
      const file = path.join(root, "public", m.file);
      expect(existsSync(file), m.file).toBe(true);
      const buf = readFileSync(file);
      expect(buf.byteLength).toBe(m.bytes);
      expect(createHash("sha256").update(buf).digest("hex")).toBe(m.sha256);
    }
  });

  it("as quatro regiões prioritárias têm modelo real", () => {
    for (const r of ["shoulder", "knee", "spine", "hip"] as const) expect(REGION_MODEL[r]).toBeTruthy();
  });

  it("toda estrutura tem identificador real da fonte (FMA + arquivo BodyParts3D)", () => {
    for (const m of Object.values(MODELS))
      for (const s of m.structures) {
        expect(s.sourceIds[0]).toMatch(/^FMA\d+$/);
        expect(s.sourceIds[1]).toMatch(/^FJ\d+M?$/);
      }
  });

  it("toda estrutura dos modelos regionais tem nome técnico e público em português", () => {
    for (const id of Object.values(REGION_MODEL)) {
      for (const s of MODELS[id!].structures) {
        const t = structureText(s.id, s.nameEn);
        expect(t.reviewStatus, s.id).not.toBe("rascunho");
        expect(t.publicName).not.toBe(s.nameEn);
        expect(t.technicalPt).not.toBe(s.nameEn);
      }
    }
  });

  it("camadas sem estruturas não aparecem como disponíveis", () => {
    const knee = MODELS["knee-right"];
    expect(availableLayers(knee)).not.toContain("ligaments");
    expect(availableLayers(knee)).not.toContain("joints");
    expect(availableLayers(MODELS.spine)).toContain("joints");
  });
});
