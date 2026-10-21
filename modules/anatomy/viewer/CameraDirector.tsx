"use client";

import { CameraControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Box3, PerspectiveCamera, Vector3 } from "three";
import { cameraPositionFor, fitDistance, fitDistanceBox, viewDirection, type CameraPreset } from "../camera/framing";
import { useViewerStore } from "../store";
import type { AnatomyModelManifest, V3 } from "../types";
import { viewerRuntime } from "./runtime";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export const CAMERA_FOV = 30;

export function resolvePresetTarget(preset: CameraPreset, manifest: AnatomyModelManifest): V3 {
  if (preset.target === "focus") return manifest.focus;
  if ("point" in preset.target) return preset.target.point;
  const id = preset.target.structure;
  const s = manifest.structures.find((x) => x.id === id);
  return s ? s.center : manifest.focus;
}

/** Posição e alvo da câmera para um preset, ajustados à proporção do quadro. */
export function presetPose(preset: CameraPreset, manifest: AnatomyModelManifest, aspect: number, side: "right" | "left" | "midline") {
  const target = resolvePresetTarget(preset, manifest);
  const dir = viewDirection(preset.view, side, preset.azimuthDeg, preset.elevationDeg);
  const distance = preset.extent ? fitDistanceBox(preset.extent[0], preset.extent[1], CAMERA_FOV, aspect) : fitDistance(preset.radius, CAMERA_FOV, aspect);
  return { target, position: cameraPositionFor(target, dir, distance), distance };
}

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

interface Tween {
  fromTarget: Vector3;
  toTarget: Vector3;
  fromOffset: Vector3;
  toOffset: Vector3;
  start: number;
  duration: number;
}

/**
 * Câmera orbital com limites e transições suaves entre presets.
 * A interpolação acontece em torno do alvo (direção esférica + distância),
 * para a câmera não atravessar o modelo entre duas vistas.
 */
export function CameraDirector({
  manifest,
  presets,
  side,
  /** Proporção do quadro de saída (estúdio). Sem valor, usa a do canvas. */
  frameAspect,
}: {
  manifest: AnatomyModelManifest;
  presets: CameraPreset[];
  side: "right" | "left" | "midline";
  frameAspect?: number;
}) {
  const controls = useRef<CameraControls>(null);
  const { camera, size } = useThree();
  const reduced = usePrefersReducedMotion();
  const tween = useRef<Tween | null>(null);
  const request = useViewerStore((s) => s.camera);
  const aspect = frameAspect ?? size.width / Math.max(1, size.height);
  // Proporção usada nos pedidos de câmera. Fora do estúdio, redimensionar o
  // canvas (ex.: abrir o painel no celular) não descarta o ângulo escolhido.
  const aspectRef = useRef(aspect);
  aspectRef.current = aspect;
  const reframeKey = frameAspect ?? 0;
  // Limites de zoom ficam estáveis entre pequenos redimensionamentos.
  const limitAspect = frameAspect ?? Math.round(aspect * 4) / 4;

  const bounds = useMemo(() => {
    const b = new Box3(new Vector3(...manifest.bounds.min), new Vector3(...manifest.bounds.max));
    return b.expandByScalar(0.05);
  }, [manifest]);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    viewerRuntime.controls = c;
    const radius = Math.max(...presets.map((p) => p.radius), manifest.focusRadius * 0.6);
    c.minDistance = fitDistance(0.03, CAMERA_FOV, limitAspect);
    c.maxDistance = fitDistance(radius * 1.8, CAMERA_FOV, Math.min(limitAspect, 1));
    c.setBoundary(bounds);
    c.boundaryEnclosesCamera = false;
    c.dollyToCursor = true;
    c.smoothTime = 0.18;
    c.draggingSmoothTime = 0.08;
    c.azimuthRotateSpeed = 0.6;
    c.polarRotateSpeed = 0.6;
    c.dollySpeed = 0.6;
    return () => {
      if (viewerRuntime.controls === c) viewerRuntime.controls = null;
    };
  }, [bounds, presets, manifest.focusRadius, limitAspect]);

  // Pedido de preset (botões, cenas, perguntas).
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const preset = presets.find((p) => p.id === request.presetId) ?? presets[0];
    if (!preset) return;
    const pose = presetPose(preset, manifest, aspectRef.current, side);
    const toTarget = new Vector3(...pose.target);
    const toPos = new Vector3(...pose.position);
    const duration = reduced ? 0 : request.durationMs;
    if (duration <= 0) {
      tween.current = null;
      c.setLookAt(toPos.x, toPos.y, toPos.z, toTarget.x, toTarget.y, toTarget.z, false);
      return;
    }
    const fromTarget = c.getTarget(new Vector3());
    const fromPos = c.getPosition(new Vector3());
    tween.current = {
      fromTarget,
      toTarget,
      fromOffset: fromPos.clone().sub(fromTarget),
      toOffset: toPos.clone().sub(toTarget),
      start: performance.now(),
      duration,
    };
    // reframeKey: no estúdio, trocar o formato do vídeo reenquadra a cena.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.seq, request.presetId, reframeKey]);

  useEffect(() => {
    (camera as PerspectiveCamera).fov = CAMERA_FOV;
    (camera as PerspectiveCamera).near = 0.005;
    (camera as PerspectiveCamera).far = 20;
    camera.updateProjectionMatrix();
    viewerRuntime.camera = camera;
  }, [camera]);

  useFrame(() => {
    const tw = tween.current;
    const c = controls.current;
    if (!tw || !c) return;
    const x = Math.min(1, (performance.now() - tw.start) / tw.duration);
    const k = easeInOut(x);
    const target = tw.fromTarget.clone().lerp(tw.toTarget, k);
    const fromLen = tw.fromOffset.length();
    const toLen = tw.toOffset.length();
    const dir = tw.fromOffset.clone().normalize();
    const toDir = tw.toOffset.clone().normalize();
    // Interpolação esférica da direção (slerp simples).
    const dot = Math.min(1, Math.max(-1, dir.dot(toDir)));
    const omega = Math.acos(dot);
    let d: Vector3;
    if (omega < 1e-4) d = toDir;
    else {
      const s = Math.sin(omega);
      d = dir.multiplyScalar(Math.sin((1 - k) * omega) / s).add(toDir.clone().multiplyScalar(Math.sin(k * omega) / s));
    }
    const pos = target.clone().add(d.normalize().multiplyScalar(fromLen + (toLen - fromLen) * k));
    c.setLookAt(pos.x, pos.y, pos.z, target.x, target.y, target.z, false);
    if (x >= 1) tween.current = null;
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      onStart={() => {
        // O usuário assumiu a câmera: interrompe a transição automática.
        tween.current = null;
      }}
    />
  );
}

/** Zoom pelos botões (+/−), relativo à distância atual. */
export function zoomBy(factor: number) {
  const c = viewerRuntime.controls;
  if (!c) return;
  const d = c.distance;
  c.dollyTo(Math.min(c.maxDistance, Math.max(c.minDistance, d * factor)), true);
}
