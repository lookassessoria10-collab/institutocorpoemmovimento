// Baixa os arquivos oficiais do BodyParts3D 4.0 (DBCLS) para data/raw/.
// Fonte e licença: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html
// (CC BY 4.0 desde 27/02/2025). Ver docs/LICENCAS-ANATOMIA.md.
//
// Os dados brutos não são versionados (data/raw/ está no .gitignore): o
// pipeline é reprodutível a partir destes downloads.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const RAW = path.join(ROOT, "data/raw/bodyparts3d-4.0");
const BASE = "https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/";
const FILES = [
  "isa_element_parts.txt",
  "isa_parts_list_e.txt",
  "isa_inclusion_relation_list.txt",
  "README_e.html",
  "release_4.0_e.html",
  "coordinate_system.png",
  "isa_BP3D_4.0_obj_99.zip",
];

mkdirSync(RAW, { recursive: true });
const log = [];
for (const f of FILES) {
  const dest = path.join(RAW, f);
  if (!existsSync(dest)) {
    process.stdout.write(`↓ ${f} … `);
    const res = await fetch(BASE + f);
    if (!res.ok) throw new Error(`${f}: HTTP ${res.status}`);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log("ok");
  }
  const sha256 = createHash("sha256").update(readFileSync(dest)).digest("hex");
  log.push({ file: f, url: BASE + f, sha256 });
}
writeFileSync(path.join(RAW, "_downloads.json"), JSON.stringify({ fetchedAt: new Date().toISOString(), files: log }, null, 2));

const objDir = path.join(RAW, "isa_BP3D_4.0_obj_99");
if (!existsSync(objDir)) {
  console.log("Extraindo OBJ …");
  try {
    execFileSync("unzip", ["-q", "-o", path.join(RAW, "isa_BP3D_4.0_obj_99.zip"), "-d", RAW], { stdio: "inherit" });
  } catch {
    execFileSync("tar", ["-xf", path.join(RAW, "isa_BP3D_4.0_obj_99.zip"), "-C", RAW], { stdio: "inherit" });
  }
}
console.log("Pronto. Rode: npm run anatomy:build");
