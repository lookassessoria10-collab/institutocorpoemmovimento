import { describe, expect, it } from "vitest";
import { fitDistance, fitDistanceBox, viewDirection } from "../camera/framing";

describe("enquadramento anatômico", () => {
  it("vista lateral do lado direito olha a partir de −X", () => {
    expect(viewDirection("lateral", "right")[0]).toBeLessThan(-0.99);
    expect(viewDirection("lateral", "left")[0]).toBeGreaterThan(0.99);
    expect(viewDirection("anterior", "right")[2]).toBeGreaterThan(0.99);
    expect(viewDirection("posterior", "midline")[2]).toBeLessThan(-0.99);
  });

  it("formato vertical precisa de mais distância que o horizontal para o mesmo raio", () => {
    expect(fitDistance(0.2, 30, 9 / 16)).toBeGreaterThan(fitDistance(0.2, 30, 16 / 9));
  });

  it("estruturas altas ocupam melhor o vertical com enquadramento por retângulo", () => {
    const sphere = fitDistance(0.52, 30, 9 / 16);
    const box = fitDistanceBox(0.2, 0.52, 30, 9 / 16);
    expect(box).toBeLessThan(sphere);
  });
});
