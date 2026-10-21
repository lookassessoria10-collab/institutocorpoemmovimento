"use client";

import { useMemo, useState } from "react";
import { REGIONS } from "@/modules/anatomy/regions";
import { ReviewBadge } from "@/modules/brand/ReviewBadge";
import { SCENES } from "@/modules/content/scenes";
import { PUBLICATION_LABELS, VIDEO_FORMAT_LABELS } from "@/modules/content/schema";
import { sceneReadiness } from "@/modules/content/validate";
import { Icon } from "@/modules/ui/Icon";
import { useStudioStore } from "../store";

const ORDER = ["shoulder", "knee", "spine", "hip"] as const;

/** Biblioteca de cenas prontas, agrupadas por região, com busca e situação de cada uma. */
export function SceneLibrary() {
  const sceneId = useStudioStore((s) => s.sceneId);
  const setScene = useStudioStore((s) => s.setScene);
  const [q, setQ] = useState("");
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const filtered = useMemo(() => SCENES.filter((s) => !q || norm(`${s.title} ${s.summary} ${s.slug}`).includes(norm(q))), [q]);

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 focus-within:border-landim-ouro/60">
        <Icon name="search" className="h-4 w-4 text-palco-suave" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cena ou assunto…"
          aria-label="Buscar cena"
          className="w-full bg-transparent text-sm text-palco-texto placeholder:text-palco-suave/70 focus:outline-none"
        />
      </label>
      {ORDER.map((rid) => {
        const list = filtered.filter((s) => s.region === rid);
        if (!list.length) return null;
        return (
          <section key={rid}>
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-palco-suave">{REGIONS.find((r) => r.id === rid)?.label}</h3>
            <ul className="space-y-1.5">
              {list.map((s) => {
                const r = sceneReadiness(s);
                const active = s.id === sceneId;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setScene(s.id, 0)}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        active ? "border-landim-ouro/60 bg-landim-ouro/10" : "border-white/5 bg-white/[0.03] hover:border-white/15"
                      }`}
                    >
                      <span className="flex items-start gap-2">
                        <span className="mt-0.5 font-serif text-sm text-landim-ouro">{String(s.number).padStart(2, "0")}</span>
                        <span className="min-w-0">
                          <span className="block text-[13px] font-medium leading-snug text-palco-texto">{s.title}</span>
                          <span className="mt-1 block text-[11px] text-palco-suave">
                            {VIDEO_FORMAT_LABELS[s.videoFormat].label} · ~{s.estimatedDuration}s
                          </span>
                          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                r.assetsReady ? "bg-clinico-aprovado/15 text-clinico-aprovado" : "bg-clinico-pendente/15 text-clinico-pendente"
                              }`}
                            >
                              {PUBLICATION_LABELS[s.publicationStatus]}
                              {r.assetsReady && r.partial ? " (parcial)" : ""}
                            </span>
                            <ReviewBadge status={s.clinicalReviewStatus} />
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
