import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import knee from "../assets/manifests/knee-right.json";
import hip from "../assets/manifests/hip-right.json";
import { getMotion, MOTIONS } from "../kinematics/motions";
import { angleAt, contactDelta, segmentMatrices } from "../kinematics/solve";
import type { JointAxis } from "../types";

const kneeJoints = knee.joints as unknown as JointAxis[];
const hipJoints = hip.joints as unknown as JointAxis[];

describe("interpolação dos movimentos", () => {
  it("respeita os pontos-chave e limita t a [0, 1]", () => {
    const kf = [
      { t: 0, deg: 0 },
      { t: 0.5, deg: 90 },
      { t: 1, deg: 0 },
    ];
    expect(angleAt(kf, 0)).toBe(0);
    expect(angleAt(kf, 0.5)).toBe(90);
    expect(angleAt(kf, 1)).toBe(0);
    expect(angleAt(kf, -1)).toBe(0);
    expect(angleAt(kf, 0.25)).toBeCloseTo(45, 5);
  });

  it("tabela de contato patelofemoral interpola linearmente", () => {
    const table = [
      { deg: 0, delta: 0 },
      { deg: 10, delta: -0.002 },
    ];
    expect(contactDelta(table, 5)).toBeCloseTo(-0.001, 6);
    expect(contactDelta(table, 50)).toBe(-0.002);
  });
});

describe("cinemática do joelho (modelo real)", () => {
  const motion = getMotion("joelho-flexao-extensao")!;

  it("na flexão de 90° a extremidade distal da tíbia vai para trás (−Z)", () => {
    const m = segmentMatrices(motion, 0.5, kneeJoints).get("perna")!;
    const tibiaDistal = new Vector3(-0.075, 0.0, 0.07); // ponto abaixo do joelho, no modelo
    const moved = tibiaDistal.clone().applyMatrix4(m);
    expect(moved.z).toBeLessThan(tibiaDistal.z - 0.25);
    expect(moved.y).toBeGreaterThan(tibiaDistal.y + 0.25);
  });

  it("o eixo transepicondilar fica parado (rotação em torno dele)", () => {
    const j = kneeJoints.find((x) => x.id === "knee-tea")!;
    const m = segmentMatrices(motion, 0.5, kneeJoints).get("perna")!;
    const o = new Vector3(...j.origin);
    expect(o.clone().applyMatrix4(m).distanceTo(o)).toBeLessThan(1e-9);
  });

  it("na posição inicial não há deslocamento", () => {
    const m = segmentMatrices(motion, 0, kneeJoints).get("perna")!;
    const p = new Vector3(-0.07, 0.2, 0.08);
    expect(p.clone().applyMatrix4(m).distanceTo(p)).toBeLessThan(1e-9);
  });

  it("a largura epicondilar calculada é anatomicamente plausível (70–100 mm)", () => {
    const j = knee.joints.find((x) => x.id === "knee-tea")!;
    const l = j.landmarks!;
    const w = new Vector3(...(l.medialEpicondyle as [number, number, number])).distanceTo(new Vector3(...(l.lateralEpicondyle as [number, number, number])));
    expect(w).toBeGreaterThan(0.07);
    expect(w).toBeLessThan(0.1);
  });
});

describe("cinemática do quadril (modelo real)", () => {
  it("flexão do quadril leva a coxa para a frente (+Z)", () => {
    const motion = getMotion("quadril-flexao")!;
    const m = segmentMatrices(motion, 0.5, hipJoints).get("coxa")!;
    const knee = new Vector3(-0.08, 0.4, 0.07);
    const moved = knee.clone().applyMatrix4(m);
    expect(moved.z).toBeGreaterThan(knee.z + 0.3);
  });

  it("o raio da cabeça do fêmur ajustado é plausível (18–28 mm)", () => {
    const q = hip.joints.find((x) => x.id === "hip-center")!.quality as string;
    const r = Number(q.match(/raio ([\d.]+) mm/)![1]);
    expect(r).toBeGreaterThan(18);
    expect(r).toBeLessThan(28);
  });

  it("sentar e levantar compõe quadril e joelho (posição sentada: perna vertical)", () => {
    const motion = getMotion("sentar-levantar")!;
    const m = segmentMatrices(motion, 0, kneeJoints).get("perna")!;
    const kneeJ = new Vector3(...kneeJoints.find((x) => x.id === "knee-tea")!.origin);
    const ankle = new Vector3(kneeJ.x, kneeJ.y - 0.4, kneeJ.z);
    const k2 = kneeJ.clone().applyMatrix4(m);
    const a2 = ankle.clone().applyMatrix4(m);
    const dir = a2.sub(k2).normalize();
    expect(dir.y).toBeLessThan(-0.95); // perna apontando para baixo
  });
});

describe("governança dos movimentos", () => {
  it("todo movimento cita referência, limita amplitude e aguarda revisão", () => {
    for (const m of MOTIONS) {
      expect(m.references.length).toBeGreaterThan(0);
      expect(m.limitations.length).toBeGreaterThan(0);
      expect(m.reviewStatus).not.toBe("aprovado");
      expect(m.hiddenLayersWhileMoving).toContain("muscles");
    }
  });
});
