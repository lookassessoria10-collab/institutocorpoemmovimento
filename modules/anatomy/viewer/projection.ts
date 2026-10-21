"use client";

import { Box3, Vector3, type Camera, type Mesh } from "three";
import type { StructureAnchor } from "../store";
import { viewerRuntime } from "./runtime";

const tmp = new Vector3();
const centers = new WeakMap<Mesh, Vector3>();

function localCenter(mesh: Mesh): Vector3 {
  let c = centers.get(mesh);
  if (!c) {
    const g = mesh.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    c = (g.boundingBox as Box3).getCenter(new Vector3());
    centers.set(mesh, c);
  }
  return c;
}

export interface Projected {
  /** Coordenadas normalizadas no viewport (0–1, origem no canto superior esquerdo). */
  x: number;
  y: number;
  onScreen: boolean;
}

/** Projeta uma âncora 3D para a tela, acompanhando rotação e movimento do modelo. */
export function projectStructureAnchor(anchor: StructureAnchor, camera: Camera): Projected | null {
  const mesh = viewerRuntime.meshes.get(anchor.structureId);
  if (!mesh) return null;
  if (anchor.local) tmp.set(anchor.local[0], anchor.local[1], anchor.local[2]);
  else tmp.copy(localCenter(mesh));
  tmp.applyMatrix4(mesh.matrixWorld);
  tmp.project(camera);
  const onScreen = mesh.visible && tmp.z < 1 && tmp.z > -1 && Math.abs(tmp.x) <= 1.02 && Math.abs(tmp.y) <= 1.02;
  return { x: (tmp.x + 1) / 2, y: (1 - tmp.y) / 2, onScreen };
}

export function projectPoint(p: [number, number, number], camera: Camera): Projected {
  tmp.set(p[0], p[1], p[2]).project(camera);
  return { x: (tmp.x + 1) / 2, y: (1 - tmp.y) / 2, onScreen: tmp.z < 1 && Math.abs(tmp.x) <= 1 && Math.abs(tmp.y) <= 1 };
}
