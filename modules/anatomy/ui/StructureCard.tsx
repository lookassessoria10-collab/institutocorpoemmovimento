"use client";

import { LAYER_LABELS, structureText } from "../structures/catalog";
import { useViewerStore } from "../store";
import type { AnatomyModelManifest } from "../types";
import { focusStructure } from "../viewer/focus";
import { Icon } from "@/modules/ui/Icon";
import { ReviewBadge } from "@/modules/brand/ReviewBadge";
import { canShowPublic } from "@/config/app";

/** Ficha da estrutura selecionada: nome público, explicação e nome técnico. */
export function StructureCard({
  manifest,
  technical = false,
  publicMode = false,
  className = "",
}: {
  manifest: AnatomyModelManifest;
  technical?: boolean;
  /** Atlas público: em produção, só mostra explicações aprovadas. */
  publicMode?: boolean;
  className?: string;
}) {
  const selected = useViewerStore((s) => s.selected);
  const highlights = useViewerStore((s) => s.highlights);
  const isolated = useViewerStore((s) => s.isolated);
  if (!selected) return null;
  const s = manifest.structures.find((x) => x.id === selected);
  if (!s) return null;
  const t = structureText(s.id, s.nameEn);
  const isHighlighted = highlights.some((h) => h.structureId === s.id);
  const st = () => useViewerStore.getState();
  const action = (fn: () => void) => () => {
    st().pushHistory();
    fn();
  };

  return (
    <div
      className={`w-full max-w-sm rounded-2xl border border-white/10 bg-palco-painel/90 p-4 text-palco-texto shadow-landim backdrop-blur ${className}`}
      role="dialog"
      aria-label={t.publicName}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.16em] text-landim-ouro">{LAYER_LABELS[s.layer].label}</p>
          <h3 className="mt-1 text-base font-semibold leading-snug">{t.publicName}</h3>
        </div>
        <button
          type="button"
          aria-label="Fechar"
          onClick={() => st().select(null)}
          className="rounded-full p-1.5 text-palco-suave hover:bg-white/10 hover:text-palco-texto"
        >
          <Icon name="close" />
        </button>
      </div>
      {publicMode && !canShowPublic(t.reviewStatus) ? (
        <p className="mt-2 text-sm text-palco-suave">Explicação em revisão clínica.</p>
      ) : t.description ? (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-palco-texto/90 sm:line-clamp-none">{t.description}</p>
      ) : (
        <p className="mt-2 text-sm text-palco-suave">Explicação em preparação.</p>
      )}
      <p className="mt-3 text-[11px] text-palco-suave">
        Nome técnico: {t.technicalPt}
        {technical && (
          <>
            {" "}
            · {s.nameEn} · {s.sourceIds.join(" · ")}
          </>
        )}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => focusStructure(s.id)} className="rounded-full border border-white/10 px-3 py-1 text-xs hover:border-white/30">
          Aproximar
        </button>
        <button
          type="button"
          onClick={action(() => st().toggleHighlight(s.id))}
          className={`rounded-full border px-3 py-1 text-xs ${isHighlighted ? "border-landim-ouro/70 text-landim-ouroClaro" : "border-white/10 hover:border-white/30"}`}
        >
          {isHighlighted ? "Remover destaque" : "Destacar"}
        </button>
        <button
          type="button"
          onClick={action(() => st().isolate(isolated ? null : [s.id]))}
          className="rounded-full border border-white/10 px-3 py-1 text-xs hover:border-white/30"
        >
          {isolated ? "Mostrar tudo" : "Isolar"}
        </button>
        <button type="button" onClick={action(() => st().hideStructure(s.id))} className="rounded-full border border-white/10 px-3 py-1 text-xs hover:border-white/30">
          Ocultar
        </button>
      </div>
      <ReviewBadge status={t.reviewStatus} className="mt-3" />
    </div>
  );
}
