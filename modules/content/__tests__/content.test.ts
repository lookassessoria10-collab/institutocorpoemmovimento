import { describe, expect, it } from "vitest";
import { QUESTIONS } from "../questions";
import { SCENES } from "../scenes";
import { SCRIPTS } from "../scripts";
import { sceneReadiness, validateContent } from "../validate";

describe("catálogo de conteúdo", () => {
  it("tem as 12 cenas do briefing, numeradas de 1 a 12", () => {
    expect(SCENES).toHaveLength(12);
    expect(SCENES.map((s) => s.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("não referencia estruturas, câmeras, camadas ou movimentos inexistentes", () => {
    expect(validateContent()).toEqual([]);
  });

  it("toda cena tem roteiro e todo roteiro aponta para uma cena", () => {
    for (const s of SCENES) expect(SCRIPTS.some((r) => r.id === s.scriptId)).toBe(true);
    expect(SCRIPTS).toHaveLength(12);
  });

  it("nenhuma cena aparece como aprovada clinicamente sem revisão registrada", () => {
    for (const s of SCENES) expect(s.clinicalReviewStatus).not.toBe("aprovado");
    for (const s of SCENES) expect(s.publicationStatus).not.toBe("publicada");
  });

  it("cenas que dependem de animações ausentes ficam pendentes", () => {
    const pending = SCENES.filter((s) => !sceneReadiness(s).assetsReady).map((s) => s.id);
    expect(pending).toEqual(["cena-01", "cena-02", "cena-07"]);
  });

  it("a cena de referência (joelho e escadas) tem 5 passos e 40–50 s", () => {
    const s = SCENES.find((x) => x.id === "cena-04")!;
    expect(s.steps).toHaveLength(5);
    const total = s.steps.reduce((a, b) => a + b.durationSec, 0);
    expect(total).toBeGreaterThanOrEqual(40);
    expect(total).toBeLessThanOrEqual(50);
    expect(s.animationId).toBe("joelho-flexao-extensao");
  });

  it("perguntas abrem cenas existentes", () => {
    for (const q of QUESTIONS) expect(SCENES.some((s) => s.id === q.sceneId)).toBe(true);
  });
});
