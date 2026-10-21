"use client";

import { Sphere, Vector3 } from "three";
import { viewerRuntime } from "./runtime";

/** Foco automático: aproxima a câmera da estrutura, mantendo a direção atual. */
export function focusStructure(id: string, smooth = true) {
  const mesh = viewerRuntime.meshes.get(id);
  const c = viewerRuntime.controls;
  if (!mesh || !c) return;
  const g = mesh.geometry;
  if (!g.boundingSphere) g.computeBoundingSphere();
  const s = (g.boundingSphere as Sphere).clone().applyMatrix4(mesh.matrixWorld);
  const radius = Math.max(s.radius, 0.025);
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  c.fitToSphere(new Sphere(s.center, radius * 1.15), smooth && !reduce);
}

export function currentCameraPose() {
  const c = viewerRuntime.controls;
  if (!c) return null;
  const p = c.getPosition(new Vector3());
  const t = c.getTarget(new Vector3());
  return { position: p.toArray() as [number, number, number], target: t.toArray() as [number, number, number] };
}

export function setCameraPose(pose: { position: [number, number, number]; target: [number, number, number] }, smooth = true) {
  const c = viewerRuntime.controls;
  if (!c) return;
  c.setLookAt(...pose.position, ...pose.target, smooth);
}
