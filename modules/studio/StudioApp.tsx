"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { availableLayers, getModel, REGION_MODEL } from "@/modules/anatomy/assets/registry";
import { AVAILABLE_REGIONS, regionById, type RegionConfig } from "@/modules/anatomy/regions";
import { useViewerStore } from "@/modules/anatomy/store";
import type { RegionId } from "@/modules/anatomy/types";
import { LayersPanel } from "@/modules/anatomy/ui/LayersPanel";
import { MotionPanel, MotionTimeline } from "@/modules/anatomy/ui/MotionControls";
import { StructureCard } from "@/modules/anatomy/ui/StructureCard";
import { StructuresPanel } from "@/modules/anatomy/ui/StructuresPanel";
import { viewerRuntime } from "@/modules/anatomy/viewer/runtime";
import { LandimLogo } from "@/modules/brand/LandimLogo";
import { applySceneStep } from "@/modules/content/player";
import { getScene } from "@/modules/content/scenes";
import { regionForModel } from "@/modules/content/validate";
import { Icon } from "@/modules/ui/Icon";
import { Notice, StageButton } from "@/modules/ui/controls";
import { AnnotationPanel } from "./panels/AnnotationPanel";
import { AppearancePanel, FormatPicker, ModePicker } from "./panels/AppearancePanel";
import { CameraPanel } from "./panels/CameraPanel";
import { InfoPanel } from "./panels/InfoPanel";
import { PresetsPanel } from "./panels/PresetsPanel";
import { SceneLibrary } from "./panels/SceneLibrary";
import { ScriptPanel } from "./panels/ScriptPanel";
import { PreviewModal } from "./PreviewModal";
import { RecordingBar, RecordingTimer } from "./RecordingBar";
import { StepStrip } from "./StepStrip";
import { useStudioStore } from "./store";
import { StudioStage } from "./StudioStage";
import { useRecordingController, useSupportedFormats } from "./useRecording";

type LeftTab = "cenas" | "roteiro" | "movimento" | "estruturas";
type RightTab = "camadas" | "camera" | "anotacoes" | "aparencia" | "presets" | "info";

export function StudioApp({ authMode }: { authMode: "configured" | "dev-local" }) {
  const studio = useStudioStore();
  const scene = getScene(studio.sceneId);
  const regionId: RegionId = scene ? scene.region : studio.regionId;
  // A cena define o modelo (ex.: sentar e levantar usa o membro inferior).
  const modelId = scene?.modelId ?? REGION_MODEL[regionId] ?? "knee-right";
  const manifest = getModel(modelId);
  const region = (regionForModel(modelId) ?? regionById(regionId)) as RegionConfig;
  const step = scene?.steps[studio.stepIndex];

  const [left, setLeft] = useState<LeftTab>("cenas");
  const [right, setRight] = useState<RightTab>("camadas");
  const formats = useSupportedFormats();
  const recording = useRecordingController(scene?.slug ?? `livre-${region.slug}`);
  const loadModel = useViewerStore((s) => s.loadModel);
  const animId = useViewerStore((s) => s.animation.id);

  useEffect(() => {
    loadModel(region.id, manifest.id, availableLayers(manifest));
  }, [loadModel, region.id, manifest]);

  // Passo da cena → câmera, camadas, destaques, movimento e legenda sincronizados.
  useEffect(() => {
    if (scene) applySceneStep(scene, studio.stepIndex);
  }, [scene, studio.stepIndex, manifest.id]);

  // Roteiro automático: avança pelos passos usando a duração de cada um.
  useEffect(() => {
    if (!studio.autoplay || !scene || !step) return;
    const id = window.setTimeout(() => {
      const st = useStudioStore.getState();
      if (st.stepIndex < scene.steps.length - 1) st.set({ stepIndex: st.stepIndex + 1 });
      else st.set({ autoplay: false });
    }, step.durationSec * 1000);
    return () => window.clearTimeout(id);
  }, [studio.autoplay, studio.stepIndex, scene, step]);

  // Atalhos de teclado.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      const st = useStudioStore.getState();
      const sc = getScene(st.sceneId);
      if (e.key === "Escape" && st.presentation) st.set({ presentation: false });
      else if (e.key === "p" || e.key === "P") st.set({ presentation: !st.presentation });
      else if (e.key === "ArrowRight" && sc) st.set({ stepIndex: Math.min(sc.steps.length - 1, st.stepIndex + 1) });
      else if (e.key === "ArrowLeft" && sc) st.set({ stepIndex: Math.max(0, st.stepIndex - 1) });
      else if (e.key === " ") {
        const v = useViewerStore.getState();
        if (!v.animation.id) return;
        e.preventDefault();
        if (!v.animation.playing) viewerRuntime.animationTime = v.animation.time;
        v.setAnimation({ playing: !v.animation.playing });
      } else if (e.key === "r" || e.key === "R") {
        if (st.phase === "idle") recording.start();
        else void recording.stop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [recording]);

  const leftTabs: Array<[LeftTab, string]> = [
    ["cenas", "Cenas"],
    ["roteiro", "Roteiro"],
    ["movimento", "Movimento"],
    ["estruturas", "Busca"],
  ];
  const rightTabs: Array<[RightTab, string]> = [
    ["camadas", "Camadas"],
    ["camera", "Câmera"],
    ["anotacoes", "Anotações"],
    ["aparencia", "Vídeo"],
    ["presets", "Presets"],
    ["info", "Info"],
  ];

  const pres = studio.presentation;
  const regionButtons = useMemo(
    () =>
      AVAILABLE_REGIONS.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => {
            useStudioStore.getState().setScene(null);
            useStudioStore.getState().set({ regionId: r.id });
          }}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            regionId === r.id && !scene ? "bg-landim-ouro text-landim-roxo950" : regionId === r.id ? "bg-landim-ouro/20 text-landim-ouroClaro" : "text-palco-suave hover:text-palco-texto"
          }`}
        >
          {r.label}
        </button>
      )),
    [regionId, scene]
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#0B0610] text-palco-texto">
      {/* Barra superior */}
      {!pres && (
        <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/5 px-4 py-2.5">
          <Link href="/" className="flex items-center gap-3" title="Atlas público">
            <LandimLogo tone="dark" className="h-5 w-auto" />
          </Link>
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-landim-ouro">Estúdio Gilvan</span>
          <span className="hidden min-w-0 flex-1 truncate text-sm text-palco-texto xl:block">
            {scene ? `Cena ${String(scene.number).padStart(2, "0")} · ${scene.title}` : `Exploração livre · ${region.label}`}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <FormatPicker />
            <ModePicker />
            <StageButton icon="expand" label="Iniciar apresentação" onClick={() => studio.set({ presentation: true })} className="border-landim-ouro/50 text-landim-ouroClaro" />
            {authMode === "configured" ? (
              <form method="post" action="/api/estudio/logout">
                <StageButton type="submit" label="Sair" />
              </form>
            ) : (
              <span className="rounded-full border border-clinico-pendente/40 px-2.5 py-1 text-[10px] text-clinico-pendente" title="Sem senha configurada: acesso liberado só em localhost">
                acesso local
              </span>
            )}
          </div>
        </header>
      )}

      <div className="relative flex min-h-0 flex-1">
        {/* Coluna esquerda */}
        {!pres && studio.leftOpen && (
          <aside className="hidden w-[300px] shrink-0 flex-col border-r border-white/5 bg-palco-fundo lg:flex">
            <div className="flex flex-wrap gap-1 border-b border-white/5 px-3 py-2">{regionButtons}</div>
            <div role="tablist" className="flex gap-1 px-3 pt-2">
              {leftTabs.map(([id, label]) => (
                <button key={id} role="tab" aria-selected={left === id} onClick={() => setLeft(id)} className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium ${left === id ? "bg-white/10 text-palco-texto" : "text-palco-suave hover:text-palco-texto"}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="scrollbar-fina flex-1 overflow-y-auto p-3">
              {left === "cenas" && <SceneLibrary />}
              {left === "roteiro" && <ScriptPanel scene={scene} stepIndex={studio.stepIndex} />}
              {left === "movimento" && <MotionPanel modelId={manifest.id} region={region.id} cameraPreset={region.cameraPresets.some((p) => p.id === "movimento") ? "movimento" : undefined} />}
              {left === "estruturas" && <StructuresPanel manifest={manifest} technical />}
            </div>
          </aside>
        )}

        {/* Palco */}
        <main className="relative min-w-0 flex-1">
          <StudioStage manifest={manifest} region={region} scene={scene} stepIndex={studio.stepIndex} />
          {!pres && (
            <>
              <div className="absolute left-3 top-3 hidden gap-1.5 lg:flex">
                <StageButton compact icon="panelLeft" aria-label="Recolher/abrir coluna esquerda" onClick={() => studio.set({ leftOpen: !studio.leftOpen })} />
              </div>
              <div className="absolute right-3 top-3 hidden gap-1.5 lg:flex">
                <StageButton compact icon="panelRight" aria-label="Recolher/abrir coluna direita" onClick={() => studio.set({ rightOpen: !studio.rightOpen })} />
              </div>
              {step?.pending && (
                <div className="absolute left-1/2 top-3 w-[min(90%,460px)] -translate-x-1/2">
                  <Notice tone="pending">Passo pendente (não vai como demonstração concluída): {step.pending}</Notice>
                </div>
              )}
              <div className="absolute bottom-3 left-3 max-w-sm">
                <StructureCard manifest={manifest} technical />
              </div>
            </>
          )}
          {pres && <PresentationControls scene={scene} />}
        </main>

        {/* Coluna direita */}
        {!pres && studio.rightOpen && (
          <aside className="hidden w-[320px] shrink-0 flex-col border-l border-white/5 bg-palco-fundo lg:flex">
            <div role="tablist" className="flex flex-wrap gap-1 border-b border-white/5 px-3 py-2">
              {rightTabs.map(([id, label]) => (
                <button key={id} role="tab" aria-selected={right === id} onClick={() => setRight(id)} className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${right === id ? "bg-white/10 text-palco-texto" : "text-palco-suave hover:text-palco-texto"}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="scrollbar-fina flex-1 overflow-y-auto p-3">
              {right === "camadas" && <LayersPanel />}
              {right === "camera" && <CameraPanel region={region} scene={scene} />}
              {right === "anotacoes" && <AnnotationPanel manifest={manifest} />}
              {right === "aparencia" && <AppearancePanel scene={scene} stepIndex={studio.stepIndex} />}
              {right === "presets" && <PresetsPanel region={region.id} modelId={manifest.id} />}
              {right === "info" && <InfoPanel manifest={manifest} />}
            </div>
          </aside>
        )}
      </div>

      {/* Barra inferior */}
      {!pres && (
        <footer className="space-y-2 border-t border-white/5 bg-palco-fundo px-4 py-2.5">
          <StepStrip scene={scene} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-[280px] flex-1">
              {animId ? <MotionTimeline dense /> : <span className="text-xs text-palco-suave">Sem movimento ativo neste passo.</span>}
            </div>
            <RecordingBar formats={formats} onStart={recording.start} onStop={() => void recording.stop()} />
          </div>
        </footer>
      )}

      <PreviewModal onDownload={recording.download} onDiscard={recording.discard} />

      {/* Celular: o estúdio prioriza o computador */}
      <div className="pointer-events-none fixed inset-x-3 bottom-3 z-40 lg:hidden">
        <div className="pointer-events-auto rounded-2xl border border-white/10 bg-palco-painel/95 p-3 text-xs text-palco-suave">
          O estúdio é otimizado para computador. No celular, use para prévia das cenas.
          <div className="mt-2">
            <StepStrip scene={scene} compact />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Controles mínimos do modo apresentação (fora do quadro: não aparecem na gravação). */
function PresentationControls({ scene }: { scene: ReturnType<typeof getScene> }) {
  const set = useStudioStore((s) => s.set);
  const anim = useViewerStore((s) => s.animation);
  return (
    <div className="group absolute inset-x-0 bottom-0 flex justify-center pb-4">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-2 opacity-30 backdrop-blur transition-opacity duration-300 hover:opacity-100 focus-within:opacity-100">
        {scene && (
          <>
            <StageButton compact icon="chevronLeft" aria-label="Passo anterior" onClick={() => set({ stepIndex: Math.max(0, useStudioStore.getState().stepIndex - 1) })} />
            <StageButton compact icon="chevronRight" aria-label="Próximo passo" onClick={() => set({ stepIndex: Math.min(scene.steps.length - 1, useStudioStore.getState().stepIndex + 1) })} />
          </>
        )}
        {anim.id && (
          <StageButton
            compact
            icon={anim.playing ? "pause" : "play"}
            aria-label={anim.playing ? "Pausar movimento" : "Reproduzir movimento"}
            onClick={() => {
              const v = useViewerStore.getState();
              if (!v.animation.playing) viewerRuntime.animationTime = v.animation.time;
              v.setAnimation({ playing: !v.animation.playing });
            }}
          />
        )}
        <RecordingTimer />
        <StageButton icon="close" label="Sair da apresentação" onClick={() => set({ presentation: false })} />
        <span className="hidden text-[10px] text-palco-suave xl:inline">
          <Icon name="info" className="mr-1 inline h-3 w-3" />P · Esc · ← → · Espaço · R
        </span>
      </div>
    </div>
  );
}
