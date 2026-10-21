"use client";

import { useMemo, useState } from "react";
import { LAYER_LABELS, structureText } from "../structures/catalog";
import { useViewerStore } from "../store";
import { LAYER_ORDER, type AnatomyModelManifest } from "../types";
import { focusStructure } from "../viewer/focus";
import { Icon } from "@/modules/ui/Icon";
import { PanelSection } from "@/modules/ui/controls";

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Lista de estruturas reais do modelo, com busca por nome público, técnico ou palavra-chave. */
export function StructuresPanel({ manifest, technical = false }: { manifest: AnatomyModelManifest; technical?: boolean }) {
  const [q, setQ] = useState("");
  const selected = useViewerStore((s) => s.selected);
  const hidden = useViewerStore((s) => s.hidden);
  const layers = useViewerStore((s) => s.layers);

  const items = useMemo(
    () =>
      manifest.structures.map((s) => {
        const t = structureText(s.id, s.nameEn);
        return { ...s, text: t, haystack: normalize([t.publicName, t.technicalPt, s.nameEn, ...(t.keywords ?? [])].join(" ")) };
      }),
    [manifest]
  );
  const filtered = q ? items.filter((i) => i.haystack.includes(normalize(q))) : items;

  const reveal = (id: string, layer: (typeof items)[number]["layer"]) => {
    const st = useViewerStore.getState();
    if (!st.layers[layer].visible) st.setLayer(layer, { visible: true });
    if (st.hidden.includes(id)) useViewerStore.setState({ hidden: st.hidden.filter((h) => h !== id) });
    st.select(id);
    focusStructure(id);
  };

  const toggleHidden = (id: string) => {
    const st = useViewerStore.getState();
    st.pushHistory();
    if (st.hidden.includes(id)) useViewerStore.setState({ hidden: st.hidden.filter((h) => h !== id) });
    else st.hideStructure(id);
  };

  return (
    <PanelSection title={`Estruturas (${manifest.structures.length})`}>
      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 focus-within:border-landim-ouro/60">
        <Icon name="search" className="h-4 w-4 text-palco-suave" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar: patela, coxa, manguito…"
          className="w-full bg-transparent text-sm text-palco-texto placeholder:text-palco-suave/70 focus:outline-none"
          aria-label="Buscar estrutura"
        />
      </label>
      <div className="space-y-3">
        {LAYER_ORDER.map((layer) => {
          const group = filtered.filter((i) => i.layer === layer);
          if (!group.length) return null;
          return (
            <div key={layer}>
              <p className="mb-1 text-[11px] text-palco-suave">{LAYER_LABELS[layer].label}</p>
              <ul className="space-y-0.5">
                {group.map((i) => {
                  const isHidden = hidden.includes(i.id) || !layers[i.layer].visible;
                  return (
                    <li key={i.id} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => reveal(i.id, i.layer)}
                        className={`min-w-0 flex-1 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors ${
                          selected === i.id ? "bg-landim-ouro/15 text-landim-ouroClaro" : "text-palco-texto hover:bg-white/5"
                        } ${isHidden ? "opacity-50" : ""}`}
                      >
                        <span className="block truncate">{i.text.publicName}</span>
                        {technical && (
                          <span className="block truncate text-[10px] text-palco-suave">
                            {i.text.technicalPt} · {i.sourceIds.join(" · ")}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        aria-label={hidden.includes(i.id) ? `Mostrar ${i.text.publicName}` : `Ocultar ${i.text.publicName}`}
                        onClick={() => toggleHidden(i.id)}
                        className="rounded-md p-1.5 text-palco-suave hover:bg-white/5 hover:text-palco-texto"
                      >
                        <Icon name={hidden.includes(i.id) ? "eyeOff" : "eye"} className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        {!filtered.length && <p className="text-sm text-palco-suave">Nenhuma estrutura encontrada neste modelo.</p>}
      </div>
    </PanelSection>
  );
}
