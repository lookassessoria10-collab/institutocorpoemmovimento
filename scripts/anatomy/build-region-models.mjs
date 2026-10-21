// Pipeline de ativos anatômicos: BodyParts3D 4.0 (OBJ, mm, Z superior)
// → GLB por região (metros, Y superior), com um nó por estrutura.
//
// Uso:
//   npm run anatomy:fetch      (baixa e extrai os arquivos oficiais)
//   npm run anatomy:build      (gera public/anatomy/*.glb e os manifestos)
//
// Modificações feitas nos dados originais (obrigatório informar — CC BY 4.0):
//   1. Conversão de eixos e unidades (mm → m; Z superior → Y superior).
//   2. Simplificação (meshoptimizer) só das malhas acima do limite de triângulos da camada.
//   3. Recorte da pele (FMA7163) à faixa de altura da região (maior pedaço conectado).
//   4. Normais suaves recalculadas, quantização e compressão (EXT_meshopt_compression).
//   5. Materiais de cor por camada (a fonte não tem texturas).
// Nenhuma estrutura é criada, deformada ou deslocada.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Document, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, quantize, simplifyPrimitive } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";
import { loadElementParts } from "./lib-parts.mjs";
import { BODY_OVERVIEW, REGIONS } from "./regions.config.mjs";
import { computeJoint } from "./joints.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const RAW = path.join(ROOT, "data/raw/bodyparts3d-4.0");
const OBJ_DIR = path.join(RAW, "isa_BP3D_4.0_obj_99");
const OUT_GLB = path.join(ROOT, "public/anatomy");
const OUT_MANIFEST = path.join(ROOT, "modules/anatomy/assets/manifests");

const LAYER_CONCEPTS = [
  // ordem importa: a primeira correspondência define a camada
  ["skin", "FMA7163"], // skin
  ["joints", "FMA10446"], // intervertebral disk
  ["joints", "FMA55107"], // cartilage organ
  ["ligaments", "FMA21496"], // ligament organ
  ["tendons", "FMA9721"], // tendon
  ["bones", "FMA5018"], // bone organ
  ["muscles", "FMA5022"], // muscle organ
  ["muscles", "FMA85453"], // head of muscle organ (cabeças do bíceps, tríceps, gastrocnêmio…)
  ["muscles", "FMA10474"], // zone of muscle organ (cabeças e partes de músculos: vastos, deltoide…)
  ["muscles", "FMA32558"], // musculature (conjuntos, ex.: interespinais)
  ["bones", "FMA10483"], // zone of bone organ (ex.: manúbrio)
];
// Elementos cuja classe IS-A não é uma das acima.
const LAYER_OVERRIDES = {
  FJ1423: "tendons", // right iliotibial tract — faixa fibrosa (fáscia lata); exibida com tendões e fáscias
  FJ1520: "muscles", // ascending part of right trapezius — na árvore IS-A só como "organ zone"
  FJ1521: "muscles", // descending part of right trapezius — idem
  FJ3178: "bones", // body of sternum — parte do osso esterno (na árvore IS-A fica sob "body of organ")
};

const LAYER_MATERIALS = {
  bones: { color: [0.9, 0.86, 0.77, 1], roughness: 0.55 },
  muscles: { color: [0.62, 0.2, 0.19, 1], roughness: 0.62 },
  tendons: { color: [0.86, 0.84, 0.78, 1], roughness: 0.4 },
  ligaments: { color: [0.82, 0.83, 0.78, 1], roughness: 0.4 },
  joints: { color: [0.72, 0.82, 0.88, 1], roughness: 0.35 },
  skin: { color: [0.86, 0.7, 0.6, 1], roughness: 0.7 },
  other: { color: [0.7, 0.7, 0.7, 1], roughness: 0.6 },
};

// ---------------------------------------------------------------------------
// OBJ

function parseObj(file) {
  const text = readFileSync(file, "utf8");
  const pos = [];
  const idx = [];
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("v ")) {
      const [, x, y, z] = line.trim().split(/\s+/);
      // BodyParts3D: mm, X → esquerda, Y → posterior, Z → superior.
      // Modelo: m, X → esquerda, Y → superior, Z → anterior (rotação própria, det = +1).
      pos.push(+x / 1000, +z / 1000, -y / 1000);
    } else if (line.startsWith("f ")) {
      const verts = line
        .trim()
        .split(/\s+/)
        .slice(1)
        .map((t) => {
          const i = parseInt(t.split("/")[0], 10);
          return i < 0 ? pos.length / 3 + i : i - 1;
        });
      for (let k = 1; k + 1 < verts.length; k++) idx.push(verts[0], verts[k], verts[k + 1]);
    }
  }
  return weldPositions(new Float32Array(pos), new Uint32Array(idx));
}

/** Une vértices com a mesma posição (tolerância 1 µm) e remove triângulos degenerados. */
function weldPositions(positions, indices) {
  const key = (i) => `${Math.round(positions[i * 3] * 1e6)},${Math.round(positions[i * 3 + 1] * 1e6)},${Math.round(positions[i * 3 + 2] * 1e6)}`;
  const map = new Map();
  const out = [];
  const remap = new Uint32Array(positions.length / 3);
  for (let i = 0; i < positions.length / 3; i++) {
    const k = key(i);
    if (!map.has(k)) {
      map.set(k, out.length / 3);
      out.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
    }
    remap[i] = map.get(k);
  }
  const idx = [];
  for (let t = 0; t < indices.length; t += 3) {
    const a = remap[indices[t]], b = remap[indices[t + 1]], c = remap[indices[t + 2]];
    if (a !== b && b !== c && a !== c) idx.push(a, b, c);
  }
  return { positions: new Float32Array(out), indices: new Uint32Array(idx) };
}

function bboxOf(positions) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3)
    for (let k = 0; k < 3; k++) {
      if (positions[i + k] < min[k]) min[k] = positions[i + k];
      if (positions[i + k] > max[k]) max[k] = positions[i + k];
    }
  return { min, max };
}

function unionBox(a, b) {
  return { min: a.min.map((v, i) => Math.min(v, b.min[i])), max: a.max.map((v, i) => Math.max(v, b.max[i])) };
}

/**
 * Mantém só o pedaço conectado da pele mais próximo do centro articular da
 * região. Após o recorte por altura, a mão e o antebraço pendurados ao lado
 * do quadril viram pedaços separados (e têm muitos triângulos, por isso o
 * critério é a proximidade, não o tamanho).
 */
function componentNearest(mesh, anchor) {
  const { positions, indices } = mesh;
  const n = positions.length / 3;
  const parent = new Int32Array(n).map((_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  for (let t = 0; t < indices.length; t += 3) {
    const a = find(indices[t]);
    const b = find(indices[t + 1]);
    const c = find(indices[t + 2]);
    parent[b] = a;
    parent[find(c)] = a;
  }
  let best = -1;
  let bestD = Infinity;
  for (let i = 0; i < n; i++) {
    const d = (positions[i * 3] - anchor[0]) ** 2 + (positions[i * 3 + 1] - anchor[1]) ** 2 + (positions[i * 3 + 2] - anchor[2]) ** 2;
    if (d < bestD) {
      bestD = d;
      best = find(i);
    }
  }
  const keep = [];
  for (let t = 0; t < indices.length; t += 3) if (find(indices[t]) === best) keep.push(indices[t], indices[t + 1], indices[t + 2]);
  return cropToBox({ positions, indices: new Uint32Array(keep) }, { min: [-Infinity, -Infinity, -Infinity], max: [Infinity, Infinity, Infinity] });
}

/**
 * Corte exato por planos alinhados aos eixos (Sutherland–Hodgman por
 * triângulo): as bordas do recorte ficam retas, como um corte de atlas.
 * Pontos novos sobre uma aresta são calculados sempre na mesma ordem dos
 * vértices, para que triângulos vizinhos compartilhem o mesmo ponto.
 */
function clipToBox(mesh, box) {
  const { positions, indices } = mesh;
  const P = (i) => [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]];
  const planes = [];
  for (let k = 0; k < 3; k++) {
    if (Number.isFinite(box.min[k])) planes.push({ k, v: box.min[k], keepAbove: true });
    if (Number.isFinite(box.max[k])) planes.push({ k, v: box.max[k], keepAbove: false });
  }
  const inside = (p, pl) => (pl.keepAbove ? p[pl.k] >= pl.v : p[pl.k] <= pl.v);
  const cut = (a, b, pl) => {
    // ordem canônica (lexicográfica) para resultados idênticos nos dois triângulos vizinhos
    const [p, q] = a[0] < b[0] || (a[0] === b[0] && (a[1] < b[1] || (a[1] === b[1] && a[2] <= b[2]))) ? [a, b] : [b, a];
    const t = (pl.v - p[pl.k]) / (q[pl.k] - p[pl.k]);
    return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t].map((c, i) => (i === pl.k ? pl.v : c));
  };
  const out = [];
  for (let t = 0; t < indices.length; t += 3) {
    let poly = [P(indices[t]), P(indices[t + 1]), P(indices[t + 2])];
    for (const pl of planes) {
      if (!poly.length) break;
      const next = [];
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        const ia = inside(a, pl);
        const ib = inside(b, pl);
        if (ia) next.push(a);
        if (ia !== ib) next.push(cut(a, b, pl));
      }
      poly = next;
    }
    for (let i = 1; i + 1 < poly.length; i++) out.push(poly[0], poly[i], poly[i + 1]);
  }
  const flat = new Float32Array(out.length * 3);
  out.forEach((p, i) => flat.set(p, i * 3));
  return weldPositions(flat, new Uint32Array(out.map((_, i) => i)));
}

/** Mantém só os triângulos com centroide dentro da caixa; compacta os vértices. */
function cropToBox(mesh, box) {
  const { positions, indices } = mesh;
  const keep = [];
  for (let t = 0; t < indices.length; t += 3) {
    let inside = true;
    for (let k = 0; k < 3 && inside; k++) {
      const c = (positions[indices[t] * 3 + k] + positions[indices[t + 1] * 3 + k] + positions[indices[t + 2] * 3 + k]) / 3;
      if (c < box.min[k] || c > box.max[k]) inside = false;
    }
    if (inside) keep.push(indices[t], indices[t + 1], indices[t + 2]);
  }
  const remap = new Map();
  const pos = [];
  const idx = keep.map((v) => {
    if (!remap.has(v)) {
      remap.set(v, pos.length / 3);
      pos.push(positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]);
    }
    return remap.get(v);
  });
  return { positions: new Float32Array(pos), indices: new Uint32Array(idx) };
}

/** Normais suaves ponderadas por área (a malha da fonte é contínua, sem vincos). */
function smoothNormals(positions, indices) {
  const n = new Float32Array(positions.length);
  for (let t = 0; t < indices.length; t += 3) {
    const a = indices[t] * 3, b = indices[t + 1] * 3, c = indices[t + 2] * 3;
    const ux = positions[b] - positions[a], uy = positions[b + 1] - positions[a + 1], uz = positions[b + 2] - positions[a + 2];
    const vx = positions[c] - positions[a], vy = positions[c + 1] - positions[a + 1], vz = positions[c + 2] - positions[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const i of [a, b, c]) { n[i] += nx; n[i + 1] += ny; n[i + 2] += nz; }
  }
  for (let i = 0; i < n.length; i += 3) {
    const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
    n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;
  }
  return n;
}

const slug = (name) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

// ---------------------------------------------------------------------------

function layerOf(fj, fileIn) {
  if (LAYER_OVERRIDES[fj]) return LAYER_OVERRIDES[fj];
  const base = fj.replace(/M$/, "");
  for (const [layer, fma] of LAYER_CONCEPTS) if (fileIn(fj, fma) || fileIn(base, fma)) return layer;
  return "other";
}

function loadElement(fj) {
  const file = path.join(OBJ_DIR, `${fj}.obj`);
  if (!existsSync(file)) throw new Error(`Arquivo ausente na fonte: ${fj}.obj`);
  return parseObj(file);
}

async function buildModel({ id, file, title, region, side, items, budget, maxError = 0.0015, skinBox, jointIds, focusJoint, limitations }) {
  const parts = loadElementParts(RAW);
  const doc = new Document();
  doc.createBuffer();
  const scene = doc.createScene(id);
  const materials = {};
  const mat = (layer) =>
    (materials[layer] ??= doc
      .createMaterial(layer)
      .setBaseColorFactor(LAYER_MATERIALS[layer].color)
      .setRoughnessFactor(LAYER_MATERIALS[layer].roughness)
      .setMetallicFactor(0));

  const structures = [];
  const raw = new Map();
  let bounds = null;

  for (const item of items) {
    const leaf = parts.leafOf.get(item.fj);
    if (!leaf) throw new Error(`${item.fj} não consta em isa_element_parts.txt`);
    const layer = layerOf(item.fj, parts.fileIn);
    let mesh = loadElement(item.fj);
    if (layer === "skin") {
      if (!skinBox) continue;
      // A pele vem por último na lista: os ossos já estão carregados e o
      // centro articular da região pode ser calculado.
      const anchor = focusJoint ? computeJoint(focusJoint, raw).origin : bounds.min.map((v, i) => (v + bounds.max[i]) / 2);
      mesh = componentNearest(clipToBox(mesh, skinBox), anchor);
    }
    if (!mesh.indices.length) continue;
    const box = bboxOf(mesh.positions);
    let sid = slug(leaf.name);
    // Conjuntos da linha média vêm em dois arquivos (original e espelhado "M")
    // com o mesmo conceito: o lado é lido da própria geometria (X < 0 = direito).
    const lateralized = /\b(right|left)\b/.test(leaf.name);
    if (!lateralized && (raw.has(sid) || items.some((o) => o !== item && o.fj.replace(/M$/, "") === item.fj.replace(/M$/, "")))) {
      const cx = (box.min[0] + box.max[0]) / 2;
      sid = `${sid}__${cx < 0 ? "right" : "left"}_side`;
    }
    if (raw.has(sid)) throw new Error(`Estrutura repetida: ${sid}`);
    raw.set(sid, { ...mesh, fj: item.fj });
    if (layer !== "skin") bounds = bounds ? unionBox(bounds, box) : box;
    structures.push({
      id: sid,
      sourceIds: [leaf.fma, item.fj],
      nameEn: leaf.name,
      layer,
      segment: item.segment,
      center: box.min.map((v, i) => +((v + box.max[i]) / 2).toFixed(5)),
      // Centro dentro do recorte da pele: fica oculta enquanto a pele está
      // opaca (na fonte, algumas superfícies internas atravessam a pele).
      coveredBySkin:
        layer !== "skin" && skinBox
          ? box.min.every((v, i) => (v + box.max[i]) / 2 >= skinBox.min[i] && (v + box.max[i]) / 2 <= skinBox.max[i])
          : false,
      _mesh: mesh,
    });
  }

  // Eixos articulares calculados na geometria original (antes da simplificação).
  const joints = (jointIds || []).map((jid) => computeJoint(jid, raw));

  for (const s of structures) {
    const { positions, indices } = s._mesh;
    const prim = doc
      .createPrimitive()
      .setAttribute("POSITION", doc.createAccessor().setType("VEC3").setArray(positions))
      .setIndices(doc.createAccessor().setType("SCALAR").setArray(indices))
      .setMaterial(mat(s.layer));
    const sourceTriangles = indices.length / 3;
    const ratio = Math.min(1, (budget[s.layer] ?? 6000) / sourceTriangles);
    s.sourceTriangles = sourceTriangles;
    if (ratio < 0.98) {
      await MeshoptSimplifier.ready;
      simplifyPrimitive(prim, { simplifier: MeshoptSimplifier, ratio, error: maxError, lockBorder: s.layer === "skin" });
    }
    s.triangles = prim.getIndices().getCount() / 3;
    prim.setAttribute(
      "NORMAL",
      doc.createAccessor().setType("VEC3").setArray(smoothNormals(prim.getAttribute("POSITION").getArray(), prim.getIndices().getArray()))
    );
    const meshNode = doc.createMesh(s.id).addPrimitive(prim);
    const node = doc.createNode(s.id).setMesh(meshNode).setExtras({ fma: s.sourceIds[0], bp3dElement: s.sourceIds[1], layer: s.layer, segment: s.segment ?? null });
    scene.addChild(node);
    delete s._mesh;
  }

  await doc.transform(dedup(), prune());
  await MeshoptEncoder.ready;
  await doc.transform(quantize({ quantizePosition: 14, quantizeNormal: 10 }), meshopt({ encoder: MeshoptEncoder, level: "medium" }));
  doc.getRoot().getAsset().copyright = "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International (modified)";
  doc.getRoot().getAsset().generator = "corpo-em-movimento/scripts/anatomy/build-region-models.mjs";

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
  const glb = await io.writeBinary(doc);
  const sha256 = createHash("sha256").update(glb).digest("hex");
  const name = `${file}.${sha256.slice(0, 10)}.glb`;
  for (const old of readdirSync(OUT_GLB).filter((f) => f.startsWith(`${file}.`) && f.endsWith(".glb"))) rmSync(path.join(OUT_GLB, old));
  writeFileSync(path.join(OUT_GLB, name), glb);

  const focusJ = joints.find((j) => j.id === focusJoint);
  const focus = focusJ ? focusJ.origin : bounds.min.map((v, i) => (v + bounds.max[i]) / 2);
  const manifest = {
    id,
    region,
    title,
    side,
    file: `/anatomy/${name}`,
    bytes: glb.byteLength,
    sha256,
    sourceId: "bodyparts3d-4.0",
    units: "m",
    bounds: { min: bounds.min.map((v) => +v.toFixed(5)), max: bounds.max.map((v) => +v.toFixed(5)) },
    focus: focus.map((v) => +v.toFixed(5)),
    focusRadius: +(Math.max(...bounds.max.map((v, i) => v - bounds.min[i])) / 2).toFixed(5),
    triangles: structures.reduce((a, s) => a + s.triangles, 0),
    structures,
    joints,
    limitations,
    generatedAt: new Date().toISOString(),
  };
  writeFileSync(path.join(OUT_MANIFEST, `${id}.json`), JSON.stringify(manifest, null, 2));
  console.log(`✔ ${name}  ${(glb.byteLength / 1024 / 1024).toFixed(2)} MB  ${manifest.triangles} triângulos  ${structures.length} estruturas`);
  for (const j of joints) console.log(`   eixo ${j.id}: origem ${j.origin.map((v) => v.toFixed(4))} eixo ${j.axis.map((v) => v.toFixed(3))}  ${j.quality ?? ""}`);
  return manifest;
}

// ---------------------------------------------------------------------------

async function main() {
  if (!existsSync(OBJ_DIR)) {
    console.error("Arquivos OBJ não encontrados. Rode antes: npm run anatomy:fetch");
    process.exit(1);
  }
  mkdirSync(OUT_GLB, { recursive: true });
  mkdirSync(OUT_MANIFEST, { recursive: true });
  const only = process.argv[2];

  for (const r of REGIONS) {
    if (only && only !== r.id && only !== "regions") continue;
    // Caixa da pele: união dos ossos da região, com margem; no lado medial,
    // limite em X para não pegar a pele do membro oposto.
    let skinBox = null;
    if (r.skin) {
      const parts = loadElementParts(RAW);
      let box = null;
      for (const it of r.structures) if (layerOf(it.fj, parts.fileIn) === "bones" && (!r.skinBones || r.skinBones.includes(it.fj))) {
        const b = bboxOf(loadElement(it.fj).positions);
        box = box ? unionBox(box, b) : b;
      }
      // Recorte só na altura (e na linha média, quando houver limite medial):
      // cortes laterais ou anteroposteriores abririam buracos na pele.
      const m = r.skin.margin;
      skinBox = { min: [-Infinity, box.min[1] - m, -Infinity], max: [Infinity, box.max[1] + m, Infinity] };
      if (r.skin.medialLimitX !== undefined) skinBox.max[0] = r.skin.medialLimitX;
      if (r.skin.maxY !== undefined) skinBox.max[1] = Math.min(skinBox.max[1], r.skin.maxY);
    }
    const items = [...r.structures, ...(r.skin ? [{ fj: "FJ2810" }] : [])];
    await buildModel({
      id: r.file,
      file: r.file,
      title: r.title,
      region: r.id,
      side: r.side,
      items,
      budget: r.budget,
      maxError: r.maxError,
      skinBox,
      jointIds: r.joints,
      focusJoint: r.focus,
      limitations: regionLimitations(r.id),
    });
  }

  if (!only || only === "body") {
    const parts = loadElementParts(RAW);
    const bones = [...parts.byConcept.get(BODY_OVERVIEW.conceptBones).files].sort();
    await buildModel({
      id: BODY_OVERVIEW.file,
      file: BODY_OVERVIEW.file,
      title: BODY_OVERVIEW.title,
      region: "body",
      side: "midline",
      items: bones.map((fj) => ({ fj })),
      budget: { bones: BODY_OVERVIEW.budget },
      maxError: 0.02,
      skinBox: null,
      jointIds: [],
      focusJoint: null,
      limitations: ["Visão geral simplificada (até 900 triângulos por osso) para carregamento rápido; não usar para close-ups."],
    });
  }
}

function regionLimitations(id) {
  const common = [
    "Acervo BodyParts3D 4.0: um único corpo de referência (adulto masculino), não representa variações individuais.",
    "Sem texturas na fonte: as cores são convenções educativas por camada.",
    "Músculos e pele são superfícies estáticas: não se deformam durante os movimentos.",
  ];
  const extra = {
    knee: [
      "A fonte não inclui ligamentos cruzados/colaterais, meniscos nem cartilagem articular do joelho: essas camadas ficam indisponíveis.",
      "O tendão patelar não existe como malha na fonte. Na malha de referência, a distância entre o polo inferior da patela e a tuberosidade da tíbia é curta (ver manifesto): a altura da patela deve ser avaliada na revisão clínica.",
    ],
    hip: ["A fonte não inclui ligamentos do quadril, lábio acetabular nem cápsula articular."],
    shoulder: ["A fonte não inclui ligamentos, lábio glenoidal nem cápsula articular do ombro."],
    spine: [
      "O disco entre T12 e L1 aparece na fonte apenas como \"intervertebral disk\" (FJ3211), sem nível; a posição foi conferida pela geometria.",
      "A fonte não inclui os ligamentos da coluna; multífido e quadrado lombar não constam no acervo IS-A 4.0.",
    ],
  };
  return [...common, ...(extra[id] || [])];
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
