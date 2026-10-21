// Eixos articulares calculados a partir da geometria real do BodyParts3D.
// Coordenadas do modelo: metros, +X esquerda do corpo, +Y superior, +Z anterior.
// Para estruturas do lado direito, "medial" = X maior (em direção à linha média).
//
// Métodos (documentados também em docs/04-animacoes.md):
//  - knee-tea: eixo transepicondilar do fêmur (pontos mais proeminentes
//    medial e lateral do fêmur distal). Aproximação usual do eixo de
//    flexão–extensão do joelho (Churchill et al., 1998, Clin Orthop Relat Res).
//  - hip-center / shoulder-gh: centro de esfera ajustada por mínimos
//    quadrados à cabeça do fêmur / úmero (articulações esferoides).

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function len(a) {
  return Math.hypot(a[0], a[1], a[2]);
}
function norm(a) {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}
const round = (v, n = 5) => v.map((x) => +x.toFixed(n));

function vertices(positions) {
  const out = [];
  for (let i = 0; i < positions.length; i += 3) out.push([positions[i], positions[i + 1], positions[i + 2]]);
  return out;
}

function solve4(M, v) {
  // Eliminação de Gauss com pivoteamento parcial.
  const A = M.map((row, i) => [...row, v[i]]);
  for (let c = 0; c < 4; c++) {
    let p = c;
    for (let r = c + 1; r < 4; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = 0; r < 4; r++) {
      if (r === c) continue;
      const f = A[r][c] / A[c][c];
      for (let k = c; k < 5; k++) A[r][k] -= f * A[c][k];
    }
  }
  return A.map((row, i) => row[4] / row[i]);
}

/** Ajuste algébrico de esfera: 2p·c + k = |p|², k = r² − |c|². */
export function fitSphere(points) {
  const M = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  const v = [0, 0, 0, 0];
  for (const p of points) {
    const row = [2 * p[0], 2 * p[1], 2 * p[2], 1];
    const rhs = p[0] * p[0] + p[1] * p[1] + p[2] * p[2];
    for (let i = 0; i < 4; i++) {
      v[i] += row[i] * rhs;
      for (let j = 0; j < 4; j++) M[i][j] += row[i] * row[j];
    }
  }
  const [cx, cy, cz, k] = solve4(M, v);
  const c = [cx, cy, cz];
  return { center: c, radius: Math.sqrt(k + cx * cx + cy * cy + cz * cz) };
}

function rms(points, sphere) {
  let s = 0;
  for (const p of points) s += (len(sub(p, sphere.center)) - sphere.radius) ** 2;
  return Math.sqrt(s / points.length);
}

/**
 * Centro de cabeça articular: semente = ponto mais medial da extremidade
 * proximal, deslocada lateralmente; refinamento iterativo selecionando os
 * vértices próximos da superfície esférica.
 */
function headCenter(verts, { proximalFraction, seedShift }) {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of verts) {
    minY = Math.min(minY, p[1]);
    maxY = Math.max(maxY, p[1]);
  }
  const prox = verts.filter((p) => p[1] > maxY - (maxY - minY) * proximalFraction);
  const medial = prox.reduce((a, b) => (b[0] > a[0] ? b : a));
  let center = [medial[0] - seedShift, medial[1], medial[2]];
  let sphere = { center, radius: seedShift };
  let used = prox;
  for (let it = 0; it < 10; it++) {
    const limit = it === 0 ? sphere.radius * 1.35 : sphere.radius;
    used = prox.filter((p) => {
      const d = len(sub(p, sphere.center));
      return it === 0 ? d < limit : Math.abs(d - sphere.radius) < Math.max(0.0025, sphere.radius * 0.12);
    });
    if (used.length < 40) break;
    sphere = fitSphere(used);
  }
  return { ...sphere, residual: rms(used, sphere), samples: used.length };
}

function rotateAbout(p, origin, axis, rad) {
  // Rodrigues: v' = v cosθ + (k × v) sinθ + k (k·v)(1 − cosθ)
  const v = sub(p, origin);
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const k = axis;
  const kv = [k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]];
  const d = k[0] * v[0] + k[1] * v[1] + k[2] * v[2];
  return [0, 1, 2].map((i) => origin[i] + v[i] * c + kv[i] * s + k[i] * d * (1 - c));
}

function minDistance(a, b) {
  let best = Infinity;
  for (const p of a)
    for (const q of b) {
      const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
      if (d < best) best = d;
    }
  return Math.sqrt(best);
}

/**
 * Contato patelofemoral: para cada ângulo de giro da patela em torno do eixo
 * transepicondilar, o deslocamento radial (em direção ao eixo ou para fora)
 * que mantém a mesma folga mínima entre patela e fêmur medida na posição de
 * repouso. Evita que a patela "flutue" ou atravesse o fêmur durante a flexão.
 */
function patellofemoralContact(patella, femur, origin, axis) {
  const distalFemur = femur.filter((p) => p[1] < origin[1] + 0.06);
  const rest = minDistance(patella, distalFemur);
  const centroid = patella.reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]).map((v) => v / patella.length);
  const rel = sub(centroid, origin);
  const along = rel[0] * axis[0] + rel[1] * axis[1] + rel[2] * axis[2];
  const radial0 = norm(sub(rel, axis.map((a) => a * along)));
  const table = [];
  for (let deg = 0; deg <= 100; deg += 5) {
    const rad = (deg * Math.PI) / 180;
    const rotated = patella.map((p) => rotateAbout(p, origin, axis, rad));
    const u = rotateAbout([origin[0] + radial0[0], origin[1] + radial0[1], origin[2] + radial0[2]], origin, axis, rad).map((v, i) => v - origin[i]);
    const shifted = (delta) => rotated.map((p) => [p[0] + u[0] * delta, p[1] + u[1] * delta, p[2] + u[2] * delta]);
    // Bissecção: a folga cresce quando a patela se afasta do eixo (delta > 0).
    let lo = -0.03;
    let hi = 0.03;
    for (let it = 0; it < 22; it++) {
      const mid = (lo + hi) / 2;
      if (minDistance(shifted(mid), distalFemur) < rest) lo = mid;
      else hi = mid;
    }
    table.push({ deg, delta: +((lo + hi) / 2).toFixed(5) });
  }
  return { radial: round(radial0, 6), restGap: +rest.toFixed(5), table };
}

export function computeJoint(id, raw) {
  const get = (sid) => {
    const m = raw.get(sid);
    if (!m) throw new Error(`Eixo ${id}: estrutura ${sid} ausente no modelo`);
    return vertices(m.positions);
  };

  if (id === "knee-tea") {
    const femur = get("right_femur");
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of femur) {
      minY = Math.min(minY, p[1]);
      maxY = Math.max(maxY, p[1]);
    }
    const distal = femur.filter((p) => p[1] < minY + (maxY - minY) * 0.12);
    const medial = distal.reduce((a, b) => (b[0] > a[0] ? b : a));
    const lateral = distal.reduce((a, b) => (b[0] < a[0] ? b : a));
    const origin = medial.map((v, i) => (v + lateral[i]) / 2);
    const axis = norm(sub(medial, lateral));
    const width = len(sub(medial, lateral));
    // Referências do tendão patelar, para o movimento da patela por restrição
    // geométrica (comprimento do tendão constante; ver docs/04-animacoes.md).
    const patella = get("right_patella");
    const patellaApex = patella.reduce((a, b) => (b[1] < a[1] ? b : a));
    const tibia = get("right_tibia");
    let tMin = Infinity;
    let tMax = -Infinity;
    for (const p of tibia) {
      tMin = Math.min(tMin, p[1]);
      tMax = Math.max(tMax, p[1]);
    }
    // Tuberosidade: ponto mais anterior entre 10 e 60 mm abaixo do topo do platô
    // (exclui a borda anterior do platô).
    const proximalTibia = tibia.filter((p) => p[1] < tMax - 0.01 && p[1] > tMax - 0.06);
    const tibialTuberosity = proximalTibia.reduce((a, b) => (b[2] > a[2] ? b : a));
    const patellaContact = patellofemoralContact(patella, femur, origin, axis);
    return {
      id,
      origin: round(origin),
      axis: round(axis, 6),
      method:
        "Eixo transepicondilar: pontos mais proeminentes medial e lateral do fêmur distal (12% inferiores do comprimento), calculados na malha original do BodyParts3D.",
      landmarks: {
        medialEpicondyle: round(medial),
        lateralEpicondyle: round(lateral),
        patellaApex: round(patellaApex),
        tibialTuberosity: round(tibialTuberosity),
      },
      patellaContact,
      quality: `largura epicondilar ${(width * 1000).toFixed(1)} mm · tendão patelar (ápice–tuberosidade) ${(len(sub(patellaApex, tibialTuberosity)) * 1000).toFixed(1)} mm`,
    };
  }

  if (id === "hip-center") {
    const s = headCenter(get("right_femur"), { proximalFraction: 0.14, seedShift: 0.022 });
    return {
      id,
      origin: round(s.center),
      axis: [1, 0, 0],
      axes: { flexion: [1, 0, 0], abduction: [0, 0, 1], rotation: [0, 1, 0] },
      method:
        "Centro da cabeça do fêmur por ajuste de esfera (mínimos quadrados) na malha original; eixos anatômicos do corpo de referência (X mediolateral, Z anteroposterior, Y longitudinal).",
      quality: `raio ${(s.radius * 1000).toFixed(1)} mm · resíduo ${(s.residual * 1000).toFixed(2)} mm · ${s.samples} vértices`,
    };
  }

  if (id === "shoulder-gh") {
    const s = headCenter(get("right_humerus"), { proximalFraction: 0.12, seedShift: 0.02 });
    return {
      id,
      origin: round(s.center),
      axis: [1, 0, 0],
      axes: { flexion: [1, 0, 0], abduction: [0, 0, 1], rotation: [0, 1, 0] },
      method:
        "Centro da cabeça do úmero por ajuste de esfera (mínimos quadrados) na malha original; eixos anatômicos do corpo de referência.",
      quality: `raio ${(s.radius * 1000).toFixed(1)} mm · resíduo ${(s.residual * 1000).toFixed(2)} mm · ${s.samples} vértices`,
    };
  }

  throw new Error(`Eixo desconhecido: ${id}`);
}
