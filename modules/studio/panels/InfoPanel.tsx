"use client";

import { sourceOf } from "@/modules/anatomy/assets/registry";
import type { AnatomyModelManifest } from "@/modules/anatomy/types";
import { validateContent } from "@/modules/content/validate";
import { PanelSection } from "@/modules/ui/controls";

const SHORTCUTS: Array<[string, string]> = [
  ["Espaço", "Reproduzir / pausar movimento"],
  ["← →", "Passo anterior / próximo"],
  ["P", "Modo apresentação"],
  ["Esc", "Sair da apresentação"],
  ["R", "Iniciar / parar gravação"],
];

export function InfoPanel({ manifest }: { manifest: AnatomyModelManifest }) {
  const src = sourceOf(manifest);
  const issues = validateContent();
  return (
    <div className="space-y-5 text-sm">
      <PanelSection title="Modelo">
        <p className="font-medium">{manifest.title}</p>
        <p className="text-[12px] text-palco-suave">
          {manifest.structures.length} estruturas · {manifest.triangles.toLocaleString("pt-BR")} triângulos · {(manifest.bytes / 1024 / 1024).toFixed(2)} MB
        </p>
        <p className="text-[12px] text-palco-suave">{src.attribution}</p>
        <ul className="list-disc space-y-1 pl-4 text-[12px] text-palco-suave">
          {manifest.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        {manifest.joints.map((j) => (
          <p key={j.id} className="text-[11px] text-palco-suave">
            Eixo {j.id}: {j.method}
          </p>
        ))}
      </PanelSection>
      <PanelSection title="Validação do conteúdo">
        <p className={issues.length ? "text-red-300" : "text-clinico-aprovado"}>
          {issues.length ? `${issues.length} problema(s) entre cenas e ativos` : "Cenas, roteiros e presets conferidos com os ativos reais."}
        </p>
        {issues.slice(0, 8).map((i) => (
          <p key={i.where + i.message} className="text-[11px] text-red-300">
            {i.where}: {i.message}
          </p>
        ))}
      </PanelSection>
      <PanelSection title="Atalhos">
        <dl className="grid grid-cols-[64px_1fr] gap-y-1 text-[12px]">
          {SHORTCUTS.map(([k, d]) => (
            <div key={k} className="contents">
              <dt>
                <kbd className="rounded border border-white/15 bg-black/30 px-1.5 py-0.5 text-[11px]">{k}</kbd>
              </dt>
              <dd className="text-palco-suave">{d}</dd>
            </div>
          ))}
        </dl>
      </PanelSection>
      <PanelSection title="Captura externa (OBS Studio)">
        <p className="text-[12px] leading-relaxed text-palco-suave">
          Se a gravação interna não estiver disponível neste navegador, use o modo apresentação (tecla P): menus e painéis somem e o quadro fica limpo.
          No OBS, adicione uma fonte &quot;Captura de janela&quot; (ou &quot;Captura de tela&quot;) e recorte ao quadro do vídeo. Detalhes em
          docs/09-exportar-gravacao.md.
        </p>
      </PanelSection>
    </div>
  );
}
