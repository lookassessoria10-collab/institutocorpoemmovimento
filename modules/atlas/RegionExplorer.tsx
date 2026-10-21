"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { APP_CONFIG, canShowPublic, movimentosUrl, whatsappHref } from "@/config/app";
import { availableLayers, getModel } from "@/modules/anatomy/assets/registry";
import { getMotion } from "@/modules/anatomy/kinematics/motions";
import { angleAt } from "@/modules/anatomy/kinematics/solve";
import { regionById, type RegionConfig } from "@/modules/anatomy/regions";
import { useViewerStore } from "@/modules/anatomy/store";
import { LAYER_ORDER, type LayerId, type RegionId } from "@/modules/anatomy/types";
import { AnchoredLabels } from "@/modules/anatomy/ui/AnchoredLabels";
import { LayersPanel } from "@/modules/anatomy/ui/LayersPanel";
import { MotionPanel } from "@/modules/anatomy/ui/MotionControls";
import { StructureCard } from "@/modules/anatomy/ui/StructureCard";
import { StructuresPanel } from "@/modules/anatomy/ui/StructuresPanel";
import { ViewToolbar } from "@/modules/anatomy/ui/ViewToolbar";
import { AnatomyStage } from "@/modules/anatomy/viewer/AnatomyStage";
import { focusStructure } from "@/modules/anatomy/viewer/focus";
import { LandimLogo } from "@/modules/brand/LandimLogo";
import { ReviewBadge } from "@/modules/brand/ReviewBadge";
import { applySceneStep, resolvePainArea } from "@/modules/content/player";
import { getScene, scenesForModel } from "@/modules/content/scenes";
import type { Scene } from "@/modules/content/schema";
import { sceneReadiness } from "@/modules/content/validate";
import { Icon } from "@/modules/ui/Icon";
import { Notice, PanelSection } from "@/modules/ui/controls";
import { StageFallback } from "./StageFallback";

type Tab = "explorar" | "movimento" | "entender";

const UNAVAILABLE: Partial<Record<RegionId, Partial<Record<LayerId, string>>>> = {
  knee: { ligaments: "A fonte não inclui ligamentos do joelho", joints: "A fonte não inclui meniscos nem cartilagem" },
  hip: { ligaments: "A fonte não inclui ligamentos do quadril", joints: "Lábio e cartilagem não constam na fonte" },
  shoulder: { ligaments: "A fonte não inclui ligamentos do ombro", tendons: "Tendões não constam como malhas separadas", joints: "Lábio e cápsula não constam na fonte" },
  spine: { ligaments: "A fonte não inclui ligamentos da coluna", skin: "Sem pele neste modelo", tendons: "Não constam como malhas separadas" },
};

function useMovingPose() {
  return useViewerStore((s) => {
    const m = getMotion(s.animation.id);
    if (!m) return false;
    return s.animation.playing || m.tracks.some((t) => Math.abs(angleAt(t.keyframes, s.animation.time)) > 0.5);
  });
}

export function RegionExplorer({ regionId }: { regionId: RegionId }) {
  const region = regionById(regionId) as RegionConfig;
  const manifest = getModel(region.modelId!);
  const params = useSearchParams();
  const loadModel = useViewerStore((s) => s.loadModel);
  const selected = useViewerStore((s) => s.selected);
  const pain = useViewerStore((s) => s.painArea);
  const moving = useMovingPose();
  const [tab, setTab] = useState<Tab>("explorar");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scene, setScene] = useState<Scene | null>(null);
  const [step, setStep] = useState(0);

  const scenes = useMemo(() => scenesForModel(manifest.id).filter((s) => canShowPublic(s.clinicalReviewStatus)), [manifest.id]);

  // Carga do modelo + parâmetros de entrada (links do Movimentos de Volta,
  // da campanha e das perguntas): ?cena=&passo=&estrutura=&camada=&vista=
  useEffect(() => {
    loadModel(region.id, manifest.id, availableLayers(manifest));
    const cena = getScene(params.get("cena"));
    if (cena && cena.modelId === manifest.id && canShowPublic(cena.clinicalReviewStatus)) {
      const passo = Math.max(0, Math.min(cena.steps.length - 1, Number(params.get("passo") || 0)));
      setScene(cena);
      setStep(passo);
      setTab("entender");
      // Espera um quadro para o visualizador montar antes de aplicar o passo.
      requestAnimationFrame(() => applySceneStep(cena, passo, { transitionMs: 0 }));
      return;
    }
    const st = useViewerStore.getState();
    const camada = params.get("camada") as LayerId | null;
    if (camada && LAYER_ORDER.includes(camada)) {
      for (const l of LAYER_ORDER) if (l !== camada && l !== "bones") st.setLayer(l, { visible: false });
      st.setLayer(camada, { visible: true });
    }
    const vista = params.get("vista");
    if (vista && region.cameraPresets.some((p) => p.id === vista)) st.requestCamera(vista, 0);
    const estrutura = params.get("estrutura");
    if (estrutura && manifest.structures.some((s) => s.id === estrutura)) {
      st.select(estrutura);
      window.setTimeout(() => focusStructure(estrutura), 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadModel, region.id, manifest]);

  const startScene = (s: Scene, i = 0) => {
    setScene(s);
    setStep(i);
    applySceneStep(s, i);
  };
  const exitScene = () => {
    setScene(null);
    useViewerStore.getState().setPainArea(null);
    useViewerStore.setState({ annotations: [] });
  };

  const panel = (
    <div className="space-y-6">
      {tab === "explorar" && (
        <>
          <LayersPanel unavailableNote={UNAVAILABLE[region.id]} />
          <StructuresPanel manifest={manifest} />
        </>
      )}
      {tab === "movimento" && (
        <MotionPanel modelId={manifest.id} region={region.id} cameraPreset={region.cameraPresets.some((p) => p.id === "movimento") ? "movimento" : undefined} publicMode />
      )}
      {tab === "entender" && (
        <LearnPanel region={region} modelId={manifest.id} scenes={scenes} activeScene={scene?.id ?? null} onStartScene={(s) => startScene(s, 0)} />
      )}
    </div>
  );

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-palco-fundo text-palco-texto">
      {/* No celular o palco termina acima dos controles: o modelo fica centrado na área visível. */}
      <div
        className={`absolute inset-x-0 top-0 transition-[bottom] duration-300 ease-suave lg:bottom-0 ${
          sheetOpen ? "bottom-[calc(60dvh+44px)]" : "bottom-[calc(112px+env(safe-area-inset-bottom))]"
        }`}
      >
        <AnatomyStage
          manifest={manifest}
          presets={region.cameraPresets}
          side={region.side}
          fallback={<StageFallback region={region} />}
          ariaLabel={`Modelo anatômico 3D da região: ${region.label}. Arraste para girar, use dois dedos ou a roda do mouse para aproximar.`}
        >
          {null}
        </AnatomyStage>
        <AnchoredLabels />
      </div>

      {/* Cabeçalho */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 bg-gradient-to-b from-palco-fundo/90 to-transparent px-4 pb-10 pt-4 sm:px-6">
        <div className="pointer-events-auto flex items-center gap-4">
          <Link href="/" aria-label="Início do Corpo em Movimento" className="flex items-center gap-3">
            <LandimLogo tone="dark" className="h-5 w-auto sm:h-6" />
          </Link>
          <span className="h-6 w-px bg-white/15" />
          <div>
            <p className="hidden text-[11px] uppercase tracking-[0.22em] text-landim-ouro sm:block">Corpo em Movimento</p>
            <h1 className="text-base font-semibold leading-tight sm:text-lg">{region.label}</h1>
          </div>
        </div>
        <nav className="pointer-events-auto flex items-center gap-1 text-sm" aria-label="Navegação">
          <Link href="/atlas" className="rounded-full px-3 py-1.5 text-palco-suave hover:bg-white/5 hover:text-palco-texto">
            Regiões
          </Link>
          <Link href="/perguntas" className="hidden rounded-full px-3 py-1.5 text-palco-suave hover:bg-white/5 hover:text-palco-texto sm:inline-flex">
            Perguntas
          </Link>
        </nav>
      </header>

      {/* Painel lateral (desktop) */}
      <aside className="absolute bottom-4 left-4 top-24 z-10 hidden w-[340px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-palco-painel/80 backdrop-blur lg:flex">
        <Tabs tab={tab} setTab={setTab} />
        <div className="scrollbar-fina flex-1 overflow-y-auto p-4">{panel}</div>
        <p className="border-t border-white/5 px-4 py-2.5 text-[10px] leading-relaxed text-palco-suave">{APP_CONFIG.copy.disclaimer}</p>
      </aside>

      {/* Vistas (desktop) */}
      <div className="absolute right-4 top-24 z-10 hidden lg:block">
        <ViewToolbar presets={region.cameraPresets} />
      </div>

      {/* Ficha da estrutura (desktop) */}
      {selected && (
        <div className="absolute bottom-6 right-6 z-20 hidden lg:block">
          <StructureCard manifest={manifest} publicMode />
        </div>
      )}

      {/* Cena em andamento */}
      {scene && (
        <ScenePlayerBar
          scene={scene}
          step={step}
          compact={sheetOpen}
          onStep={(i) => {
            setStep(i);
            applySceneStep(scene, i);
          }}
          onExit={exitScene}
        />
      )}

      {/* Avisos do palco (desktop) */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden w-[min(92vw,520px)] -translate-x-1/2 flex-col items-center gap-2 lg:flex">
        <StageNotices pain={Boolean(pain)} moving={moving && !selected} />
      </div>

      {/* Celular: avisos e ficha → vistas → folha inferior, empilhados sem sobreposição */}
      <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col lg:hidden">
        <div className="pointer-events-none flex flex-col gap-2 px-3 pb-2">
          <StageNotices pain={Boolean(pain)} moving={moving && !selected} />
          {selected && !sheetOpen && (
            <div className="pointer-events-auto">
              <StructureCard manifest={manifest} publicMode className="max-w-none" />
            </div>
          )}
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pb-2">
          <ViewToolbar presets={region.cameraPresets} compact />
        </div>
        <div
          className={`flex flex-col rounded-t-3xl border-t border-white/10 bg-palco-painel/95 pb-[env(safe-area-inset-bottom)] backdrop-blur transition-[height] duration-300 ease-suave ${
            sheetOpen ? "h-[60dvh]" : "h-[64px]"
          }`}
        >
          <button
            type="button"
            className="mx-auto block w-full shrink-0 pt-2"
            aria-expanded={sheetOpen}
            aria-label={sheetOpen ? "Recolher painel" : "Abrir painel"}
            onClick={() => setSheetOpen((v) => !v)}
          >
            <span className="mx-auto block h-1 w-10 rounded-full bg-white/25" />
          </button>
          <Tabs
            tab={tab}
            setTab={(t) => {
              if (sheetOpen && t === tab) setSheetOpen(false);
              else {
                setTab(t);
                setSheetOpen(true);
              }
            }}
          />
          {sheetOpen && (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-3">
              {selected && (
                <div className="mb-5">
                  <StructureCard manifest={manifest} publicMode className="max-w-none border-landim-ouro/30" />
                </div>
              )}
              {panel}
              <p className="mt-6 text-[10px] leading-relaxed text-palco-suave">{APP_CONFIG.copy.disclaimer}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: Array<{ id: Tab; label: string }> = [
    { id: "explorar", label: "Explorar" },
    { id: "movimento", label: "Movimento" },
    { id: "entender", label: "Entender" },
  ];
  return (
    <div role="tablist" className="flex gap-1 border-b border-white/5 px-3 pb-2 pt-2">
      {items.map((i) => (
        <button
          key={i.id}
          role="tab"
          aria-selected={tab === i.id}
          onClick={() => setTab(i.id)}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === i.id ? "bg-landim-ouro text-landim-roxo950" : "text-palco-suave hover:text-palco-texto"
          }`}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}

function LearnPanel({
  region,
  modelId,
  scenes,
  activeScene,
  onStartScene,
}: {
  region: RegionConfig;
  modelId: string;
  scenes: Scene[];
  activeScene: string | null;
  onStartScene: (s: Scene) => void;
}) {
  const pain = useViewerStore((s) => s.painArea);
  const movimentos = movimentosUrl(region.movimentosPath);
  return (
    <div className="space-y-6">
      <PanelSection title={region.label}>
        <p className="text-sm leading-relaxed text-palco-texto/90">{region.intro}</p>
        <ul className="space-y-1.5 text-sm text-palco-suave">
          {region.observe.map((o) => (
            <li key={o} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-landim-ouro" />
              {o}
            </li>
          ))}
        </ul>
      </PanelSection>

      <PanelSection title="Cenas educativas">
        {scenes.length ? (
          <ul className="space-y-1.5">
            {scenes.map((s) => {
              const r = sceneReadiness(s);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onStartScene(s)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      activeScene === s.id ? "border-landim-ouro/60 bg-landim-ouro/10" : "border-white/5 bg-white/[0.03] hover:border-white/15"
                    }`}
                  >
                    <span className="block text-sm font-medium text-palco-texto">{s.title}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5">
                      <ReviewBadge status={s.clinicalReviewStatus} />
                      {!r.assetsReady && <span className="text-[11px] text-clinico-pendente">Parte da cena em preparação</span>}
                      {r.assetsReady && r.partial && <span className="text-[11px] text-palco-suave">Demonstração parcial</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-palco-suave">As cenas desta região estão em revisão clínica.</p>
        )}
      </PanelSection>

      {region.painAreas.length > 0 && (
        <PanelSection title="Onde costuma incomodar?">
          <div className="flex flex-wrap gap-1.5">
            {region.painAreas.map((p) => {
              const active = pain?.label.startsWith(p.label);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => useViewerStore.getState().setPainArea(active ? null : resolvePainArea(region, p.id, modelId))}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    active ? "border-clinico-desconforto/70 bg-clinico-desconforto/15 text-[#FBE3DA]" : "border-white/10 text-palco-texto hover:border-white/30"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <Notice tone="pain">{APP_CONFIG.copy.painDisclaimer}</Notice>
        </PanelSection>
      )}

      <PanelSection title="Continue explorando">
        <ul className="space-y-2 text-sm">
          <li>
            {movimentos ? (
              <a href={movimentos} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 hover:border-white/15">
                Movimentos de Volta · {region.label.toLowerCase()} <Icon name="external" className="h-3.5 w-3.5 text-palco-suave" />
              </a>
            ) : (
              <span className="flex items-center justify-between rounded-xl border border-white/5 px-3 py-2.5 text-palco-suave">
                Movimentos de Volta <span className="text-[11px]">em breve</span>
              </span>
            )}
          </li>
          <li>
            <a href={APP_CONFIG.links.historias} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 hover:border-white/15">
              Histórias de Volta <Icon name="external" className="h-3.5 w-3.5 text-palco-suave" />
            </a>
          </li>
          <li>
            <a href={whatsappHref()} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 hover:border-white/15">
              Falar com o Instituto Landim <Icon name="external" className="h-3.5 w-3.5 text-palco-suave" />
            </a>
          </li>
        </ul>
      </PanelSection>
    </div>
  );
}

function StageNotices({ pain, moving }: { pain: boolean; moving: boolean }) {
  return (
    <>
      {pain && <Notice tone="pain">{APP_CONFIG.copy.painDisclaimer}</Notice>}
      {moving && (
        <span className="self-center rounded-full border border-white/10 bg-palco-painel/80 px-3 py-1 text-center text-[11px] text-palco-suave backdrop-blur">
          Durante o movimento, mostramos os ossos: músculos e pele deste modelo não se deformam.
        </span>
      )}
    </>
  );
}

function ScenePlayerBar({
  scene,
  step,
  compact,
  onStep,
  onExit,
}: {
  scene: Scene;
  step: number;
  /** Celular com o painel aberto: só título e navegação, para não cobrir o modelo. */
  compact: boolean;
  onStep: (i: number) => void;
  onExit: () => void;
}) {
  const s = scene.steps[step];
  return (
    <div className="absolute left-3 right-3 top-[60px] z-20 rounded-2xl border border-white/10 bg-palco-painel/90 p-3 shadow-landim backdrop-blur sm:p-4 lg:left-1/2 lg:right-auto lg:top-24 lg:w-[560px] lg:-translate-x-1/2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.16em] text-landim-ouro">
            Cena {String(scene.number).padStart(2, "0")} · {step + 1}/{scene.steps.length} · {s.label}
          </p>
          <h2 className="mt-1 text-sm font-semibold leading-snug sm:text-[15px]">{scene.title}</h2>
        </div>
        <button type="button" onClick={onExit} className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs hover:border-white/30">
          Explorar livremente
        </button>
      </div>
      {s.publicText && (
        <p className={`mt-2 max-h-[22dvh] overflow-y-auto text-[13px] leading-relaxed text-palco-texto/90 sm:text-sm lg:max-h-none ${compact ? "hidden lg:block" : ""}`}>
          {s.publicText}
        </p>
      )}
      {s.pending && (
        <div className="mt-2">
          <Notice tone="pending">{s.pending}</Notice>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => onStep(step - 1)}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-palco-suave hover:text-palco-texto disabled:opacity-30"
        >
          <Icon name="chevronLeft" /> Anterior
        </button>
        <div className="flex gap-1">
          {scene.steps.map((x, i) => (
            <button
              key={x.id}
              type="button"
              aria-label={`Passo ${i + 1}: ${x.label}`}
              onClick={() => onStep(i)}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-landim-ouro" : "w-1.5 bg-white/25 hover:bg-white/50"}`}
            />
          ))}
        </div>
        <button
          type="button"
          disabled={step === scene.steps.length - 1}
          onClick={() => onStep(step + 1)}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-palco-texto hover:text-landim-ouroClaro disabled:opacity-30"
        >
          Próximo <Icon name="chevronRight" />
        </button>
      </div>
      <p className="mt-2 hidden text-[10px] text-palco-suave sm:block">Conteúdo educativo em revisão clínica. Não substitui avaliação profissional.</p>
    </div>
  );
}
