import { describe, expect, it } from "vitest";
import { fitFormat, OUTPUT_FORMATS, safeRect } from "../composition/formats";
import { computeLayout } from "../composition/layout";

const inside = (r: { x: number; y: number; w: number; h: number }, W: number, H: number) => r.x >= 0 && r.y >= 0 && r.x + r.w <= W && r.y + r.h <= H;

describe("formatos de saída", () => {
  it("tem os três formatos pedidos com as dimensões corretas", () => {
    expect([OUTPUT_FORMATS.vertical.width, OUTPUT_FORMATS.vertical.height]).toEqual([1080, 1920]);
    expect([OUTPUT_FORMATS.horizontal.width, OUTPUT_FORMATS.horizontal.height]).toEqual([1920, 1080]);
    expect([OUTPUT_FORMATS.square.width, OUTPUT_FORMATS.square.height]).toEqual([1080, 1080]);
  });

  it("a prévia preserva a proporção", () => {
    const f = fitFormat(OUTPUT_FORMATS.vertical, 900, 700);
    expect(f.h).toBeLessThanOrEqual(700);
    expect(f.w / f.h).toBeCloseTo(9 / 16, 2);
  });

  it("a área segura vertical reserva margens para a interface do Instagram", () => {
    const s = safeRect(OUTPUT_FORMATS.vertical);
    expect(s.y).toBeGreaterThanOrEqual(200);
    expect(1920 - (s.y + s.h)).toBeGreaterThanOrEqual(400);
  });
});

describe("modos de apresentação", () => {
  for (const format of ["vertical", "horizontal", "square"] as const) {
    it(`todos os retângulos ficam dentro do quadro (${format})`, () => {
      const f = OUTPUT_FORMATS[format];
      for (const mode of ["anatomia", "gilvan", "texto"] as const)
        for (const cam of ["lado", "janela-circular", "janela-retangular"] as const) {
          const l = computeLayout(format, mode, cam, true);
          expect(inside(l.viewport, f.width, f.height)).toBe(true);
          expect(inside(l.text, f.width, f.height)).toBe(true);
          if (l.webcam) expect(inside(l.webcam, f.width, f.height)).toBe(true);
        }
    });
  }

  it("sem webcam ativa, o modo B não reserva espaço para vídeo", () => {
    expect(computeLayout("vertical", "gilvan", "lado", false).webcam).toBeNull();
  });

  it("no modo C a anatomia fica abaixo da faixa do título (vertical)", () => {
    const l = computeLayout("vertical", "texto", "lado", false);
    expect(l.viewport.y).toBeGreaterThan(OUTPUT_FORMATS.vertical.safe.top);
  });

  it("a janela da webcam respeita a área segura no vertical", () => {
    const l = computeLayout("vertical", "gilvan", "janela-circular", true);
    expect(l.webcam!.y + l.webcam!.h).toBeLessThanOrEqual(1920 - OUTPUT_FORMATS.vertical.safe.bottom);
  });
});
