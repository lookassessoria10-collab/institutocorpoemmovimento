import { describe, expect, it } from "vitest";
import { formatFromActualMime, MIME_CANDIDATES, recordingFileName, supportedRecordingFormats } from "../recording/mime";

describe("formato de gravação", () => {
  it("só oferece o que o navegador declara suportar, preferindo MP4", () => {
    const list = supportedRecordingFormats((t) => t.startsWith("video/webm") || t === "video/mp4;codecs=avc1");
    expect(list[0].container).toBe("mp4");
    expect(list.every((f) => f.mimeType !== "video/mp4")).toBe(true);
  });

  it("navegador só com WebM grava WebM", () => {
    const list = supportedRecordingFormats((t) => t.startsWith("video/webm"));
    expect(list.every((f) => f.container === "webm")).toBe(true);
  });

  it("nunca rotula WebM como MP4: o contêiner vem do tipo real gravado", () => {
    const requested = MIME_CANDIDATES[0];
    const actual = formatFromActualMime("video/webm;codecs=vp9", requested);
    expect(actual.container).toBe("webm");
    expect(recordingFileName("cena", actual)).toMatch(/\.webm$/);
  });

  it("nome do arquivo identifica a cena e a data", () => {
    const name = recordingFileName("Joelho Subir Escadas!", MIME_CANDIDATES[0], new Date(2026, 9, 21, 9, 5, 3));
    expect(name).toBe("corpo-em-movimento_joelho-subir-escadas_20261021-090503.mp4");
  });

  it("detecção que lança exceção não quebra a lista", () => {
    expect(supportedRecordingFormats(() => {
      throw new Error("x");
    })).toEqual([]);
  });
});
