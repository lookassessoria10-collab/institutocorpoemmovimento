"use client";

import { createPortal, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Outlines, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { Matrix4, Mesh, type Object3D } from "three";
import type { MeshPhysicalMaterial } from "three";
import { getMotion } from "../kinematics/motions";
import { angleAt, segmentMatrices } from "../kinematics/solve";
import { useViewerStore } from "../store";
import type { AnatomyModelManifest, LayerId } from "../types";
import { applyVisual, createLayerMaterial, LAYER_RENDER_ORDER } from "./materials";
import { viewerRuntime } from "./runtime";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const PICK_MIN_OPACITY = 0.2;

function isMesh(o: Object3D): o is Mesh {
  return (o as Mesh).isMesh === true;
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

/** Pose diferente da neutra? (alguma trilha com ângulo ≠ 0) */
function poseIsActive(motionId: string | null, t: number, playing: boolean) {
  const motion = getMotion(motionId);
  if (!motion) return false;
  if (playing) return true;
  return motion.tracks.some((tr) => Math.abs(angleAt(tr.keyframes, t)) > 0.5);
}

export function AnatomyModel({ manifest, interactive = true }: { manifest: AnatomyModelManifest; interactive?: boolean }) {
  const gltf = useGLTF(manifest.file);
  const reducedMotion = usePrefersReducedMotion();
  const lastStoreWrite = useRef(0);
  const wasPlaying = useRef(false);

  const root = useMemo(() => {
    const r = gltf.scene.clone(true);
    r.traverse((o) => {
      if (!isMesh(o)) return;
      const layer = (o.userData.layer as LayerId) || "other";
      o.material = createLayerMaterial(layer);
      o.renderOrder = LAYER_RENDER_ORDER[layer];
      o.updateMatrix();
      o.userData.structureId = o.name;
      o.userData.coveredBySkin = Boolean(manifest.structures.find((s) => s.id === o.name)?.coveredBySkin);
      o.userData.baseMatrix = o.matrix.clone();
      o.matrixAutoUpdate = false;
      o.castShadow = false;
      o.receiveShadow = false;
    });
    return r;
  }, [gltf, manifest]);

  // Registro das malhas para câmera, anotações e gravação.
  useEffect(() => {
    viewerRuntime.root = root;
    viewerRuntime.meshes.clear();
    root.traverse((o) => {
      if (isMesh(o)) viewerRuntime.meshes.set(o.name, o);
    });
    return () => {
      viewerRuntime.meshes.clear();
      viewerRuntime.root = null;
      root.traverse((o) => {
        if (isMesh(o)) (o.material as MeshPhysicalMaterial).dispose();
      });
    };
  }, [root]);

  const outlined = useViewerStore((s) => {
    const ids = s.highlights.filter((h) => h.style === "contorno").map((h) => h.structureId);
    if (s.selected) ids.push(s.selected);
    return ids.join("|");
  });

  useFrame((state, delta) => {
    const st = useViewerStore.getState();
    const motion = getMotion(st.animation.id);
    const validMotion = motion && motion.modelId === manifest.id ? motion : null;

    // ---------------------------------------------------------- tempo do movimento
    let t = viewerRuntime.animationTime;
    if (validMotion && st.animation.playing) {
      t += (Math.min(delta, 0.1) * st.animation.speed) / validMotion.durationSec;
      if (t >= 1) {
        if (st.animation.loop) t = t % 1;
        else {
          t = 1;
          st.setAnimation({ playing: false, time: 1 });
        }
      }
      if (state.clock.elapsedTime - lastStoreWrite.current > 0.066) {
        lastStoreWrite.current = state.clock.elapsedTime;
        st.setAnimation({ time: t });
      }
    } else if (wasPlaying.current) {
      // Pausou agora: o store recebe o instante exato.
      st.setAnimation({ time: t });
    } else {
      t = st.animation.time;
    }
    wasPlaying.current = Boolean(validMotion && st.animation.playing);
    viewerRuntime.animationTime = t;

    const matrices = validMotion ? segmentMatrices(validMotion, t, manifest.joints) : null;
    const moving = validMotion ? poseIsActive(validMotion.id, t, st.animation.playing) : false;
    const hiddenWhileMoving = moving ? validMotion!.hiddenLayersWhileMoving : [];

    // ---------------------------------------------------------- aparência
    const pulse = reducedMotion ? 0.5 : (Math.sin(state.clock.elapsedTime * 2.4) + 1) / 2;
    const highlightSet = new Set(st.highlights.map((h) => h.structureId));
    const hiddenSet = new Set(st.hidden);
    const isolatedSet = st.isolated ? new Set(st.isolated) : null;
    // Pele opaca cobre as estruturas que estão inteiramente dentro do recorte
    // (marcadas pelo pipeline). Na fonte (BodyParts3D 4.0) algumas superfícies
    // internas atravessam a pele; sem esta regra apareceriam como manchas.
    const skin = st.layers.skin;
    const skinCovers = !isolatedSet && st.availableLayers.includes("skin") && skin.visible && skin.opacity >= 0.98 && !hiddenWhileMoving.includes("skin");

    for (const [id, mesh] of viewerRuntime.meshes) {
      const layer = (mesh.userData.layer as LayerId) || "other";
      const ls = st.layers[layer];
      let visible = isolatedSet ? isolatedSet.has(id) : ls.visible;
      if (hiddenSet.has(id)) visible = false;
      if (hiddenWhileMoving.includes(layer)) visible = false;
      if (skinCovers && (mesh.userData.coveredBySkin || layer === "muscles" || layer === "tendons")) visible = false;
      mesh.visible = visible && ls.opacity > 0.01;
      const emphasis = st.selected === id ? 3 : highlightSet.has(id) ? 2 : st.hovered === id ? 1 : 0;
      applyVisual(mesh.material as MeshPhysicalMaterial, { opacity: isolatedSet ? 1 : ls.opacity, emphasis, dim: false }, emphasis >= 2 ? pulse : 0);

      // Movimento: matriz do segmento × matriz original do nó.
      const seg = mesh.userData.segment as string | null;
      if (seg) {
        const base = mesh.userData.baseMatrix as Matrix4;
        const m = matrices?.get(seg);
        if (m) mesh.matrix.multiplyMatrices(m, base);
        else mesh.matrix.copy(base);
        mesh.matrixWorldNeedsUpdate = true;
      }
    }
  });

  const pickable = (o: Object3D) => {
    if (!isMesh(o) || !o.visible) return false;
    const mat = o.material as MeshPhysicalMaterial;
    return mat.opacity >= PICK_MIN_OPACITY;
  };

  const firstHit = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.intersections.find((i) => pickable(i.object));

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!interactive || e.pointerType === "touch") return;
    e.stopPropagation();
    const hit = firstHit(e);
    useViewerStore.getState().hover(hit ? hit.object.name : null);
    document.body.style.cursor = hit ? "pointer" : "";
  };

  const onOut = () => {
    useViewerStore.getState().hover(null);
    document.body.style.cursor = "";
  };

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!interactive) return;
    e.stopPropagation();
    if (e.delta > 6) return; // foi um arraste (girar/mover), não um clique
    const hit = firstHit(e);
    if (!hit) return;
    const st = useViewerStore.getState();
    const id = hit.object.name;
    if (st.tool) {
      const local = hit.object.worldToLocal(hit.point.clone());
      st.pushHistory();
      st.addAnnotation({
        id: newId(),
        type: st.tool,
        anchor: { kind: "structure", structureId: id, local: [local.x, local.y, local.z] },
        text: "",
        inRecording: true,
      });
      st.select(id);
      return;
    }
    st.select(st.selected === id ? null : id);
  };

  return (
    <>
      <primitive object={root} onPointerMove={onMove} onPointerOut={onOut} onClick={onClick} />
      {outlined
        .split("|")
        .filter(Boolean)
        .map((id) => {
          const mesh = viewerRuntime.meshes.get(id) ?? findMesh(root, id);
          return mesh ? createPortal(<Outlines key={id} thickness={2.2} screenspace color="#D6B469" />, mesh) : null;
        })}
    </>
  );
}

function findMesh(root: Object3D, id: string): Mesh | null {
  let found: Mesh | null = null;
  root.traverse((o) => {
    if (!found && isMesh(o) && o.name === id) found = o;
  });
  return found;
}
