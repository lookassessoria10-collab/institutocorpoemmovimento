"use client";

import { useEffect, useRef } from "react";
import { useViewerStore } from "../store";
import { projectPoint, projectStructureAnchor } from "../viewer/projection";
import { onAfterRender } from "../viewer/runtime";

/**
 * Rótulos HTML presos a pontos 3D (atlas público). A posição é atualizada
 * diretamente no DOM a cada quadro, sem re-renderizar o React.
 */
export function AnchoredLabels() {
  const annotations = useViewerStore((s) => s.annotations);
  const pain = useViewerStore((s) => s.painArea);
  const refs = useRef(new Map<string, HTMLDivElement>());
  const painRef = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      onAfterRender(({ camera, width, height }) => {
        for (const a of useViewerStore.getState().annotations) {
          const el = refs.current.get(a.id);
          if (!el || a.anchor.kind !== "structure") continue;
          const p = projectStructureAnchor(a.anchor, camera);
          if (!p || !p.onScreen) {
            el.style.opacity = "0";
            continue;
          }
          el.style.opacity = "1";
          el.style.transform = `translate(${p.x * width}px, ${p.y * height}px)`;
        }
        const pa = useViewerStore.getState().painArea;
        if (painRef.current && pa) {
          const p = projectPoint([pa.center[0], pa.center[1] + pa.radius, pa.center[2]], camera);
          painRef.current.style.opacity = p.onScreen ? "1" : "0";
          painRef.current.style.transform = `translate(${p.x * width}px, ${p.y * height}px)`;
        }
      }),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {annotations
        .filter((a) => a.anchor.kind === "structure" && a.text)
        .map((a) => (
          <div
            key={a.id}
            ref={(el) => {
              if (el) refs.current.set(a.id, el);
              else refs.current.delete(a.id);
            }}
            className="absolute left-0 top-0 opacity-0 transition-opacity duration-300"
          >
            <div className="-translate-y-1/2">
              <span className="block h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-landim-ouro shadow-[0_0_0_4px_rgba(214,180,105,.25)]" />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-landim-ouro/50 bg-palco-fundo/85 px-2.5 py-0.5 text-xs font-medium text-white">
                {a.text}
              </span>
            </div>
          </div>
        ))}
      {pain && (
        <div ref={painRef} className="absolute left-0 top-0 opacity-0 transition-opacity duration-300">
          <span className="block -translate-x-1/2 -translate-y-[130%] whitespace-nowrap rounded-full border border-clinico-desconforto/60 bg-palco-fundo/85 px-2.5 py-0.5 text-[11px] text-[#FBE3DA]">
            {pain.label}
          </span>
        </div>
      )}
    </div>
  );
}
