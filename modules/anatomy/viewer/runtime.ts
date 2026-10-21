"use client";

import type { Camera, Mesh, Object3D, WebGLRenderer } from "three";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";

/**
 * Referências do visualizador montado, fora do React (lidas a cada quadro).
 * Usado pela câmera, pelas anotações ancoradas, pela sobreposição do vídeo e
 * pelo compositor da gravação.
 */
export interface FrameInfo {
  camera: Camera;
  gl: WebGLRenderer;
  width: number;
  height: number;
}

type FrameListener = (info: FrameInfo) => void;

export const viewerRuntime = {
  meshes: new Map<string, Mesh>(),
  root: null as Object3D | null,
  camera: null as Camera | null,
  controls: null as CameraControlsImpl | null,
  gl: null as WebGLRenderer | null,
  /** Chamados depois que cada quadro é renderizado. */
  afterRender: new Set<FrameListener>(),
  /** Tempo da animação atualizado a cada quadro (o store recebe com menos frequência). */
  animationTime: 0,
};

export function onAfterRender(fn: FrameListener) {
  viewerRuntime.afterRender.add(fn);
  return () => {
    viewerRuntime.afterRender.delete(fn);
  };
}

// Acesso para depuração e testes automatizados no navegador (somente desenvolvimento).
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as { __viewer: typeof viewerRuntime }).__viewer = viewerRuntime;
}
