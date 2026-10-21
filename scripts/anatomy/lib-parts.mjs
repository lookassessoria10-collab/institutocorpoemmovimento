// Leitura das listas oficiais do BodyParts3D 4.0 (árvore IS-A).
//  - isa_element_parts.txt: concept id (FMA) \t name \t element file id (FJ)
//  - isa_inclusion_relation_list.txt: parent id \t parent name \t child id \t child name
import { readFileSync } from "node:fs";
import path from "node:path";

function rows(file) {
  return readFileSync(file, "utf8")
    .split(/\r?\n/)
    .slice(1)
    .filter((l) => l.trim())
    .map((l) => l.split("\t"));
}

export function loadElementParts(rawDir) {
  const byConcept = new Map(); // FMA -> { fma, name, files:Set }
  const byFile = new Map(); // FJ -> Set(FMA)
  for (const [fma, name, fj] of rows(path.join(rawDir, "isa_element_parts.txt"))) {
    if (!byConcept.has(fma)) byConcept.set(fma, { fma, name, files: new Set() });
    byConcept.get(fma).files.add(fj);
    if (!byFile.has(fj)) byFile.set(fj, new Set());
    byFile.get(fj).add(fma);
  }
  const children = new Map(); // FMA -> Set(FMA)
  for (const [parent, , child] of rows(path.join(rawDir, "isa_inclusion_relation_list.txt"))) {
    if (!children.has(parent)) children.set(parent, new Set());
    children.get(parent).add(child);
  }

  /**
   * Conceito mais específico de cada arquivo: entre os conceitos que contêm
   * o arquivo, o que não tem nenhum filho (direto) também contendo o arquivo.
   * Desempate: menos elementos.
   */
  const leafOf = new Map();
  for (const [fj, concepts] of byFile) {
    const leaves = [...concepts].filter((fma) => ![...(children.get(fma) || [])].some((c) => concepts.has(c)));
    leaves.sort((a, b) => byConcept.get(a).files.size - byConcept.get(b).files.size);
    const best = byConcept.get(leaves[0] || [...concepts][0]);
    leafOf.set(fj, { fma: best.fma, name: best.name, elements: best.files.size, alternatives: leaves.slice(1).map((f) => byConcept.get(f).name) });
  }

  /** true se o arquivo pertence ao conceito (ex.: FMA5018 bone organ). */
  const fileIn = (fj, fma) => byConcept.get(fma)?.files.has(fj) ?? false;
  return { byConcept, byFile, leafOf, fileIn };
}
