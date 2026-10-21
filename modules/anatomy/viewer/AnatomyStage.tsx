"use client";

import { advance, Canvas, useFrame, useThree } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { Component, Suspense, useEffect, useState, type ReactNode } from "react";
import { NeutralToneMapping, SRGBColorSpace } from "three";
import type { CameraPreset } from "../camera/framing";
import { useViewerStore } from "../store";
import type { AnatomyModelManifest } from "../types";
import { AnatomyModel } from "./AnatomyModel";
import { STAGE_BG_CSS } from "./background";
import { CameraDirector } from "./CameraDirector";
import { Lights } from "./Lights";
import { PainAreaMesh } from "./PainAreaMesh";
import { viewerRuntime } from "./runtime";

export function detectWebGL(): boolean {
  if (typeof document === "undefined") return true;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

class ModelErrorBoundary extends Component<{ children: ReactNode; onError: (e: Error) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Notifica os ouvintes depois de cada quadro renderizado (overlay, gravação). */
function AfterRenderBridge() {
  const { gl, camera, size } = useThree();
  useEffect(() => {
    viewerRuntime.gl = gl;
    // Somente desenvolvimento: permite que testes automatizados avancem quadros
    // quando o navegador de teste não entrega requestAnimationFrame.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __advance?: (t: number) => void }).__advance = (t: number) => advance(t);
    }
  }, [gl]);
  useFrame(() => {
    if (!viewerRuntime.afterRender.size) return;
    const info = { camera, gl, width: size.width, height: size.height };
    viewerRuntime.afterRender.forEach((fn) => fn(info));
  }, 10);
  return null;
}

/**
 * Renderização explícita: com um useFrame de prioridade positiva o R3F deixa
 * de renderizar sozinho, então o quadro é desenhado aqui e, logo em seguida,
 * os ouvintes (prioridade 10) leem o canvas já atualizado.
 */
function RenderPass() {
  useFrame(({ gl, scene, camera }) => {
    gl.render(scene, camera);
  }, 1);
  return null;
}

function LoadingVeil() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-palco-suave backdrop-blur">
        Carregando modelo anatômico… {Math.round(progress)}%
      </div>
    </div>
  );
}

export interface AnatomyStageProps {
  manifest: AnatomyModelManifest;
  presets: CameraPreset[];
  side: "right" | "left" | "midline";
  interactive?: boolean;
  /** Proporção do quadro de saída (estúdio). */
  frameAspect?: number;
  className?: string;
  /** Resolução extra do canvas (estúdio grava em resolução de saída). */
  dpr?: number | [number, number];
  children?: ReactNode;
  fallback?: ReactNode;
  ariaLabel?: string;
  /** false = sem fundo próprio (o estúdio pinta o fundo do quadro inteiro). */
  background?: string | false;
}

export function AnatomyStage({
  manifest,
  presets,
  side,
  interactive = true,
  frameAspect,
  className = "",
  dpr = [1, 2],
  children,
  fallback,
  ariaLabel,
  background,
}: AnatomyStageProps) {
  const [supported, setSupported] = useState(true);
  const [lostCount, setLostCount] = useState(0);
  const [lost, setLost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setSupported(detectWebGL()), []);

  if (!supported) return <>{fallback}</>;

  return (
    <div className={`viewer-surface relative h-full w-full overflow-hidden ${className}`} style={background === false ? undefined : { background: background ?? STAGE_BG_CSS }}>
      <Canvas
        key={lostCount}
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: false }}
        camera={{ fov: 30, near: 0.005, far: 20, position: [0, 1, 2] }}
        onCreated={({ gl }) => {
          gl.toneMapping = NeutralToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.outputColorSpace = SRGBColorSpace;
          gl.setClearColor(0x000000, 0);
          const el = gl.domElement;
          el.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            setLost(true);
          });
          el.addEventListener("webglcontextrestored", () => {
            setLost(false);
            setLostCount((n) => n + 1);
          });
        }}
        onPointerMissed={(e) => {
          if (e.type === "click" && !useViewerStore.getState().tool) useViewerStore.getState().select(null);
        }}
        aria-label={ariaLabel ?? `Modelo anatômico 3D: ${manifest.title}`}
        role="img"
      >
        <Lights />
        <ModelErrorBoundary onError={(e) => setError(e.message)}>
          <Suspense fallback={null}>
            <AnatomyModel manifest={manifest} interactive={interactive} />
          </Suspense>
        </ModelErrorBoundary>
        <PainAreaMesh />
        <CameraDirector manifest={manifest} presets={presets} side={side} frameAspect={frameAspect} />
        <RenderPass />
        <AfterRenderBridge />
        {children}
      </Canvas>
      <LoadingVeil />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <div className="max-w-sm rounded-2xl border border-palco-borda bg-palco-painel/90 p-5 text-sm text-palco-suave">
            <p className="mb-1 font-semibold text-palco-texto">Não foi possível carregar o modelo anatômico.</p>
            <p>O arquivo {manifest.file} não respondeu. Verifique a conexão ou se o pipeline de ativos foi executado.</p>
          </div>
        </div>
      )}
      {lost && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-6 text-center text-sm text-palco-texto">
          O navegador interrompeu o processamento 3D. Tentando restaurar…
          <button className="ml-3 underline" onClick={() => setLostCount((n) => n + 1)}>
            Recarregar visualizador
          </button>
        </div>
      )}
    </div>
  );
}
