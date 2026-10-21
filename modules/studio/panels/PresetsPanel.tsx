"use client";

import { useEffect, useRef, useState } from "react";
import type { RegionId } from "@/modules/anatomy/types";
import { VIEW_PRESETS } from "@/modules/content/presets";
import { Icon } from "@/modules/ui/Icon";
import { Notice, PanelSection, StageButton } from "@/modules/ui/controls";
import { useViewerStore } from "@/modules/anatomy/store";
import { applySaved, applyViewPreset, deleteSaved, downloadJson, importPresets, loadSaved, saveCurrent, type SavedPreset } from "../presets";

export function PresetsPanel({ region, modelId }: { region: RegionId; modelId: string }) {
  const [saved, setSaved] = useState<SavedPreset[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const currentModel = useViewerStore((s) => s.modelId);

  useEffect(() => setSaved(loadSaved()), []);
  const builtIn = VIEW_PRESETS.filter((p) => p.region === region);
  const mine = saved.filter((p) => p.modelId === (currentModel ?? modelId));

  return (
    <div className="space-y-5">
      <PanelSection title="Presets prontos">
        {builtIn.length ? (
          <ul className="space-y-1.5">
            {builtIn.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => applyViewPreset(p)}
                  className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-left text-[13px] hover:border-white/15"
                >
                  {p.label}
                  {p.note && <span className="mt-0.5 block text-[11px] text-clinico-pendente">{p.note}</span>}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-palco-suave">Sem presets prontos para esta região.</p>
        )}
      </PanelSection>

      <PanelSection title="Meus presets (neste navegador)">
        <form
          className="flex gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            setSaved(saveCurrent(name.trim()));
            setName("");
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do preset"
            aria-label="Nome do preset"
            maxLength={80}
            className="min-w-0 flex-1 rounded-lg bg-black/20 px-2.5 py-1.5 text-sm text-palco-texto focus:outline-none focus:ring-1 focus:ring-landim-ouro/60"
          />
          <StageButton type="submit" label="Salvar" />
        </form>
        <ul className="space-y-1.5">
          {mine.map((p) => (
            <li key={p.id} className="flex items-center gap-1.5">
              <button type="button" onClick={() => applySaved(p)} className="min-w-0 flex-1 truncate rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-left text-[13px] hover:border-white/15">
                {p.name}
              </button>
              <button type="button" aria-label={`Excluir ${p.name}`} onClick={() => setSaved(deleteSaved(p.id))} className="rounded p-1.5 text-palco-suave hover:text-palco-texto">
                <Icon name="close" className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          {!mine.length && <li className="text-sm text-palco-suave">Nenhum preset salvo para este modelo.</li>}
        </ul>
        <div className="flex flex-wrap gap-1.5">
          <StageButton icon="download" label="Exportar JSON" disabled={!saved.length} onClick={() => downloadJson("presets-estudio.json", saved)} />
          <StageButton label="Importar JSON" onClick={() => file.current?.click()} />
          <input
            ref={file}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                setSaved(importPresets(await f.text()));
                setError(null);
              } catch {
                setError("Arquivo inválido: use um JSON exportado por este estúdio.");
              }
              e.target.value = "";
            }}
          />
        </div>
        {error && <Notice tone="pain">{error}</Notice>}
      </PanelSection>
    </div>
  );
}
