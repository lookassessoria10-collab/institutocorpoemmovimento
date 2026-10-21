"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { APP_CONFIG } from "@/config/app";
import type { RegionConfig } from "@/modules/anatomy/regions";
import { useViewerStore } from "@/modules/anatomy/store";
import type { AnatomyModelManifest } from "@/modules/anatomy/types";
import { AnatomyStage } from "@/modules/anatomy/viewer/AnatomyStage";
import { paintStageBackground, STAGE_BG_CSS } from "@/modules/anatomy/viewer/background";
import { projectPoint, projectStructureAnchor } from "@/modules/anatomy/viewer/projection";
import { onAfterRender } from "@/modules/anatomy/viewer/runtime";
import type { Scene } from "@/modules/content/schema";
import { drawComposition, type DrawParams, type ProjectedAnnotation } from "./composition/draw";
import { fitFormat, OUTPUT_FORMATS } from "./composition/formats";
import { computeLayout, type CompositionLayout } from "./composition/layout";
import { useStudioStore } from "./store";

/** Canvas de composição usado pela gravação (preenchido a cada quadro enquanto grava). */
export const compositionTarget: { canvas: HTMLCanvasElement | null } = { canvas: null };

function cssFont(varName: string, fallback: string) {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

/** Textos da composição a partir do passo atual da cena, das edições da sessão e das opções do modo. */
export function compositionTexts(scene: Scene | null, stepIndex: number) {
  const st = useStudioStore.getState();
  const step = scene?.steps[stepIndex];
  const pain = useViewerStore.getState().painArea;
  const title = st.titleOverride ?? step?.title ?? (st.mode === "texto" ? scene?.title : undefined);
  const caption = st.captionOverride ?? step?.caption;
  return {
    kicker: st.texts.title && title ? "Corpo em Movimento" : undefined,
    title: st.texts.title ? title : undefined,
    caption: st.texts.caption ? caption : undefined,
    notice: st.texts.notice && pain ? "Representação educativa da região · não indica a causa" : undefined,
  };
}

export function StudioStage({
  manifest,
  region,
  scene,
  stepIndex,
}: {
  manifest: AnatomyModelManifest;
  region: RegionConfig;
  scene: Scene | null;
  stepIndex: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const signature = useRef<HTMLImageElement | null>(null);
  const [avail, setAvail] = useState({ w: 800, h: 600 });
  const formatId = useStudioStore((s) => s.format);
  const mode = useStudioStore((s) => s.mode);
  const webcamLayout = useStudioStore((s) => s.webcamLayout);
  const webcamStream = useStudioStore((s) => s.webcamStream);
  const presentation = useStudioStore((s) => s.presentation);
  const phase = useStudioStore((s) => s.phase);
  const countdownLeft = useStudioStore((s) => s.countdownLeft);

  const format = OUTPUT_FORMATS[formatId];
  const pad = presentation ? 0 : 24;
  const fit = fitFormat(format, Math.max(200, avail.w - pad * 2), Math.max(200, avail.h - pad * 2));
  const layout: CompositionLayout = useMemo(
    () => computeLayout(formatId, mode, webcamLayout, Boolean(webcamStream) && mode === "gilvan"),
    [formatId, mode, webcamLayout, webcamStream]
  );
  const vp = layout.viewport;
  const scale = fit.scale;
  // Resolução do canvas 3D ≈ resolução de saída (vídeo nítido).
  const dpr = Math.min(3, Math.max(1, 1 / scale));

  // Refs lidas a cada quadro (sem re-renderizar).
  const live = useRef({ layout, scale, scene, stepIndex, format });
  live.current = { layout, scale, scene, stepIndex, format };

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setAvail({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = APP_CONFIG.brand.headerOnDark;
    signature.current = img;
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.srcObject = webcamStream;
    if (webcamStream) v.play().catch(() => undefined);
  }, [webcamStream]);

  // Composição: prévia (sobreposição) e, durante a gravação, o canvas de saída.
  useEffect(
    () =>
      onAfterRender(({ camera, gl }) => {
        const { layout: L, scale: S, scene: sc, stepIndex: si } = live.current;
        const studio = useStudioStore.getState();
        const viewer = useViewerStore.getState();
        const V = L.viewport;
        const toOut = (p: { x: number; y: number }) => ({ x: V.x + p.x * V.w, y: V.y + p.y * V.h });

        const annotations: ProjectedAnnotation[] = [];
        for (const a of viewer.annotations) {
          if (a.anchor.kind === "structure") {
            const p = projectStructureAnchor(a.anchor, camera);
            if (!p) continue;
            const o = toOut(p);
            annotations.push({ id: a.id, type: a.type, x: o.x, y: o.y, text: a.text, inRecording: a.inRecording, onScreen: p.onScreen });
          } else {
            const T = L.text;
            annotations.push({ id: a.id, type: a.type, x: T.x + a.anchor.x * T.w, y: T.y + a.anchor.y * T.h, text: a.text, inRecording: a.inRecording, onScreen: true });
          }
        }
        let painLabel: DrawParams["painLabel"] = null;
        if (viewer.painArea) {
          const pa = viewer.painArea;
          const p = projectPoint([pa.center[0], pa.center[1] + pa.radius * 0.8, pa.center[2]], camera);
          const o = toOut(p);
          painLabel = { x: o.x, y: o.y, text: pa.label, onScreen: p.onScreen };
        }
        const params: DrawParams = {
          layout: L,
          mode: studio.mode,
          texts: compositionTexts(sc, si),
          annotations,
          painLabel,
          webcam: video.current && studio.webcamStream ? { video: video.current, mirror: studio.webcamMirror } : null,
          signature: signature.current,
          showSignature: studio.texts.signature,
          fontFamily: cssFont("--font-outfit", "system-ui, sans-serif"),
          scriptFamily: cssFont("--font-script", "cursive"),
          forRecording: false,
          showSafeGuides: studio.showSafeGuides && !studio.presentation,
        };

        const c = overlay.current;
        if (c) {
          const ctx = c.getContext("2d");
          if (ctx) {
            const k = (c.width / L.width) || S;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.setTransform(k, 0, 0, k, 0, 0);
            drawComposition(ctx, params);
          }
        }

        const out = compositionTarget.canvas;
        if (out && (studio.phase === "recording" || studio.phase === "countdown")) {
          const ctx = out.getContext("2d");
          if (ctx) {
            paintStageBackground(ctx, L.width, L.height);
            ctx.drawImage(gl.domElement, V.x, V.y, V.w, V.h);
            drawComposition(ctx, { ...params, forRecording: true, showSafeGuides: false });
          }
        }
      }),
    []
  );

  const pxRatio = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;

  return (
    <div ref={container} className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="relative shadow-[0_30px_80px_-30px_rgba(0,0,0,.8)] transition-[width,height] duration-300 ease-suave"
        style={{ width: fit.w, height: fit.h, background: STAGE_BG_CSS }}
        data-composition={formatId}
      >
        <div className="absolute" style={{ left: vp.x * scale, top: vp.y * scale, width: vp.w * scale, height: vp.h * scale }}>
          <AnatomyStage manifest={manifest} presets={region.cameraPresets} side={region.side} frameAspect={vp.w / vp.h} dpr={dpr} background={false} />
        </div>
        <canvas
          ref={overlay}
          className="pointer-events-none absolute inset-0"
          width={Math.round(fit.w * pxRatio)}
          height={Math.round(fit.h * pxRatio)}
          style={{ width: fit.w, height: fit.h }}
          aria-hidden
        />
        {phase === "countdown" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30" aria-live="assertive">
            <span className="font-serif text-8xl text-white drop-shadow-lg">{countdownLeft}</span>
          </div>
        )}
      </div>
      <video ref={video} muted playsInline className="hidden" />
    </div>
  );
}
