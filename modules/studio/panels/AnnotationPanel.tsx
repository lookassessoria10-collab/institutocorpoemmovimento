"use client";

import { structureText } from "@/modules/anatomy/structures/catalog";
import { useViewerStore, type AnnotationType } from "@/modules/anatomy/store";
import type { AnatomyModelManifest } from "@/modules/anatomy/types";
import { Icon, type IconName } from "@/modules/ui/Icon";
import { Notice, PanelSection, Slider, StageButton, Toggle } from "@/modules/ui/controls";

const TOOLS: Array<{ type: AnnotationType; label: string; icon: IconName; hint: string }> = [
  { type: "marcador", label: "Marcador", icon: "marker", hint: "Ponto preso à estrutura" },
  { type: "seta", label: "Seta", icon: "arrow", hint: "Aponta para a região" },
  { type: "area", label: "Área", icon: "circle", hint: "Círculo de interesse" },
];

let seq = 0;

/**
 * Ferramentas de anotação. Marcador, seta e área ficam ancorados em 3D (seguem
 * a estrutura ao girar o modelo). A legenda fixa fica presa à composição do
 * vídeo. Cada item escolhe se entra na gravação ou se é só apoio de edição.
 */
export function AnnotationPanel({ manifest }: { manifest: AnatomyModelManifest }) {
  const tool = useViewerStore((s) => s.tool);
  const setTool = useViewerStore((s) => s.setTool);
  const annotations = useViewerStore((s) => s.annotations);
  const selected = useViewerStore((s) => s.selected);
  const highlights = useViewerStore((s) => s.highlights);
  const layers = useViewerStore((s) => s.layers);
  const isolated = useViewerStore((s) => s.isolated);
  const st = () => useViewerStore.getState();
  const sel = selected ? manifest.structures.find((s) => s.id === selected) : null;
  const selHighlight = highlights.find((h) => h.structureId === selected);

  const withHistory = (fn: () => void) => () => {
    st().pushHistory();
    fn();
  };

  return (
    <div className="space-y-5">
      <PanelSection title="Ferramentas">
        <div className="grid grid-cols-3 gap-1.5">
          {TOOLS.map((t) => (
            <button
              key={t.type}
              type="button"
              title={t.hint}
              onClick={() => setTool(tool === t.type ? null : t.type)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs transition-colors ${
                tool === t.type ? "border-landim-ouro/70 bg-landim-ouro/15 text-landim-ouroClaro" : "border-white/5 bg-white/[0.03] text-palco-texto hover:border-white/15"
              }`}
            >
              <Icon name={t.icon} className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
        {tool && <Notice>Clique em uma estrutura no modelo para posicionar. Clique de novo na ferramenta para sair.</Notice>}
        <StageButton
          icon="text"
          label="Legenda fixa no vídeo"
          onClick={withHistory(() =>
            st().addAnnotation({ id: `leg-${++seq}`, type: "legenda", anchor: { kind: "screen", x: 0.04, y: 0.3 }, text: "Nova legenda", inRecording: true })
          )}
        />
      </PanelSection>

      <PanelSection title="Estrutura selecionada">
        {sel ? (
          <div className="space-y-2.5">
            <p className="text-sm font-medium">{structureText(sel.id, sel.nameEn).publicName}</p>
            <div className="flex flex-wrap gap-1.5">
              <StageButton label={selHighlight?.style === "estrutura" ? "Sem destaque" : "Destacar"} active={selHighlight?.style === "estrutura"} onClick={withHistory(() => st().toggleHighlight(sel.id, "estrutura"))} />
              <StageButton
                label="Contorno"
                active={selHighlight?.style === "contorno"}
                onClick={withHistory(() => {
                  const h = st().highlights.filter((x) => x.structureId !== sel.id);
                  st().setHighlights(selHighlight?.style === "contorno" ? h : [...h, { structureId: sel.id, style: "contorno" }]);
                })}
              />
              <StageButton label={isolated ? "Mostrar tudo" : "Isolar"} onClick={withHistory(() => st().isolate(isolated ? null : [sel.id]))} />
              <StageButton label="Ocultar" onClick={withHistory(() => st().hideStructure(sel.id))} />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-[11px] text-palco-suave">Transparência da camada</span>
              <Slider label="Opacidade da camada da estrutura" value={layers[sel.layer].opacity} min={0.05} max={1} onChange={(v) => st().setLayer(sel.layer, { opacity: v })} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-palco-suave">Clique em uma estrutura no modelo para destacá-la, contorná-la ou isolá-la.</p>
        )}
      </PanelSection>

      <PanelSection
        title={`Anotações (${annotations.length})`}
        aside={
          <div className="flex gap-1.5">
            <StageButton compact icon="undo" aria-label="Restaurar estado anterior" title="Restaurar estado anterior" onClick={() => st().undo()} />
            <StageButton compact icon="close" aria-label="Limpar anotações" title="Limpar anotações" onClick={withHistory(() => st().clearAnnotations())} />
          </div>
        }
      >
        <ul className="space-y-2">
          {annotations.map((a) => (
            <li key={a.id} className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
              <div className="flex items-center gap-2">
                <Icon name={a.type === "seta" ? "arrow" : a.type === "area" ? "circle" : a.type === "legenda" ? "text" : "marker"} className="h-4 w-4 shrink-0 text-landim-ouro" />
                <input
                  value={a.text}
                  maxLength={60}
                  placeholder={a.anchor.kind === "structure" ? structureText(a.anchor.structureId).publicName.split(" · ")[0] : "Texto"}
                  onChange={(e) => st().updateAnnotation(a.id, { text: e.target.value })}
                  aria-label="Texto da anotação"
                  className="min-w-0 flex-1 rounded-md bg-black/20 px-2 py-1 text-sm text-palco-texto focus:outline-none focus:ring-1 focus:ring-landim-ouro/60"
                />
                <button type="button" aria-label="Remover anotação" onClick={withHistory(() => st().removeAnnotation(a.id))} className="rounded p-1 text-palco-suave hover:text-palco-texto">
                  <Icon name="close" className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-palco-suave">
                <span>{a.anchor.kind === "structure" ? "Ancorada na estrutura (3D)" : "Fixa na composição"}</span>
                <span className="inline-flex items-center gap-1.5">
                  No vídeo <Toggle checked={a.inRecording} label="Incluir na gravação" onChange={(v) => st().updateAnnotation(a.id, { inRecording: v })} />
                </span>
              </div>
              {a.anchor.kind === "screen" && (
                <div className="mt-2 grid grid-cols-[16px_1fr] items-center gap-x-2 gap-y-1.5 text-[11px] text-palco-suave">
                  <span>X</span>
                  <Slider label="Posição horizontal" value={a.anchor.x} onChange={(x) => st().updateAnnotation(a.id, { anchor: { kind: "screen", x, y: (a.anchor as { y: number }).y } })} />
                  <span>Y</span>
                  <Slider label="Posição vertical" value={a.anchor.y} onChange={(y) => st().updateAnnotation(a.id, { anchor: { kind: "screen", x: (a.anchor as { x: number }).x, y } })} />
                </div>
              )}
            </li>
          ))}
          {!annotations.length && <li className="text-sm text-palco-suave">Nenhuma anotação.</li>}
        </ul>
      </PanelSection>
    </div>
  );
}
