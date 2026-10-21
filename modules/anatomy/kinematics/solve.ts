import { Matrix4, Vector3 } from "three";
import type { JointAxis } from "../types";
import type { MotionDefinition, MotionTrack } from "./motions";

type ManifestJoint = JointAxis & { axes?: Record<string, [number, number, number]> };

/** Interpolação suave (smoothstep) entre pontos-chave; t é limitado a [0, 1]. */
export function angleAt(keyframes: MotionTrack["keyframes"], t: number): number {
  if (!keyframes.length) return 0;
  const x = Math.min(1, Math.max(0, t));
  if (x <= keyframes[0].t) return keyframes[0].deg;
  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i];
    const b = keyframes[i + 1];
    if (x <= b.t) {
      const u = b.t === a.t ? 1 : (x - a.t) / (b.t - a.t);
      const s = u * u * (3 - 2 * u);
      return a.deg + (b.deg - a.deg) * s;
    }
  }
  return keyframes[keyframes.length - 1].deg;
}

/** Interpolação linear na tabela de contato (ângulos fora da tabela usam o extremo). */
export function contactDelta(table: Array<{ deg: number; delta: number }>, deg: number): number {
  if (!table.length) return 0;
  if (deg <= table[0].deg) return table[0].delta;
  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i];
    const b = table[i + 1];
    if (deg <= b.deg) return a.delta + ((b.delta - a.delta) * (deg - a.deg)) / (b.deg - a.deg);
  }
  return table[table.length - 1].delta;
}

export function trackAxis(track: MotionTrack, joint: ManifestJoint): Vector3 {
  const v = track.axis === "primary" ? joint.axis : joint.axes?.[track.axis] ?? joint.axis;
  return new Vector3(v[0], v[1], v[2]).normalize();
}

/** Rotação de `rad` em torno do eixo `axis` que passa por `origin`: T(o)·R·T(−o). */
export function rotationAboutLine(origin: Vector3, axis: Vector3, rad: number, out = new Matrix4()): Matrix4 {
  const t1 = new Matrix4().makeTranslation(origin.x, origin.y, origin.z);
  const r = new Matrix4().makeRotationAxis(axis, rad);
  const t2 = new Matrix4().makeTranslation(-origin.x, -origin.y, -origin.z);
  return out.copy(t1).multiply(r).multiply(t2);
}

/**
 * Matriz de cada segmento no instante t. As trilhas são compostas na ordem
 * proximal → distal: M(segmento) = M(trilha 1) · M(trilha 2) · …
 */
export function segmentMatrices(motion: MotionDefinition, t: number, joints: ManifestJoint[]): Map<string, Matrix4> {
  const result = new Map<string, Matrix4>();
  for (const track of motion.tracks) {
    const joint = joints.find((j) => j.id === track.joint);
    if (!joint) continue;
    const origin = new Vector3(...joint.origin);
    const axis = trackAxis(track, joint);
    const deg = angleAt(track.keyframes, t) * track.direction;
    for (const seg of track.segments) {
      const factor = track.segmentFactor?.[seg] ?? 1;
      const rad = (deg * factor * Math.PI) / 180;
      const m = rotationAboutLine(origin, axis, rad);
      if (track.contactSegment === seg && joint.patellaContact) {
        // Desloca radialmente para manter a folga patelofemoral de repouso.
        const delta = contactDelta(joint.patellaContact.table, Math.abs(deg * factor));
        const u = new Vector3(...joint.patellaContact.radial).applyAxisAngle(axis, rad).multiplyScalar(delta);
        m.premultiply(new Matrix4().makeTranslation(u.x, u.y, u.z));
      }
      const prev = result.get(seg);
      result.set(seg, prev ? prev.clone().multiply(m) : m);
    }
  }
  return result;
}

/** Ângulo atual de cada trilha (para exibir no estúdio). */
export function trackAngles(motion: MotionDefinition, t: number) {
  return motion.tracks.map((tr) => ({ label: tr.label, deg: angleAt(tr.keyframes, t) }));
}
