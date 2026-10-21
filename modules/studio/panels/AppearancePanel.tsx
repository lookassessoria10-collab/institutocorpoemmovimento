"use client";

import type { Scene } from "@/modules/content/schema";
import { Notice, PanelSection, Segmented, Toggle } from "@/modules/ui/controls";
import { OUTPUT_FORMATS, type OutputFormatId } from "../composition/formats";
import type { PresentationMode, WebcamLayout } from "../composition/layout";
import { useStudioStore } from "../store";
import { useMediaToggles } from "../useRecording";

export const MODE_LABELS: Record<PresentationMode, { short: string; label: string; hint: string }> = {
  anatomia: { short: "A", label: "Anatomia em destaque", hint: "Só o modelo. Ideal para gravar a voz por cima ou editar depois." },
  gilvan: { short: "B", label: "Gilvan + anatomia", hint: "Vídeo da webcam ao lado ou sobre a cena (exige permissão da câmera)." },
  texto: { short: "C", label: "Anatomia + texto", hint: "Título e frases curtas, para motion ou narração posterior." },
};

export function FormatPicker() {
  const format = useStudioStore((s) => s.format);
  const set = useStudioStore((s) => s.set);
  return (
    <Segmented<OutputFormatId>
      label="Formato do vídeo"
      value={format}
      onChange={(v) => set({ format: v })}
      options={(Object.keys(OUTPUT_FORMATS) as OutputFormatId[]).map((id) => ({ value: id, label: OUTPUT_FORMATS[id].ratioLabel }))}
    />
  );
}

export function ModePicker() {
  const mode = useStudioStore((s) => s.mode);
  const setMode = useStudioStore((s) => s.setMode);
  return (
    <Segmented<PresentationMode>
      label="Modo de apresentação"
      value={mode}
      onChange={setMode}
      options={(Object.keys(MODE_LABELS) as PresentationMode[]).map((m) => ({ value: m, label: `${MODE_LABELS[m].short} · ${MODE_LABELS[m].label.split(" ")[0]}` }))}
    />
  );
}

export function AppearancePanel({ scene, stepIndex }: { scene: Scene | null; stepIndex: number }) {
  const s = useStudioStore();
  const { toggleWebcam } = useMediaToggles();
  const f = OUTPUT_FORMATS[s.format];
  const step = scene?.steps[stepIndex];

  return (
    <div className="space-y-5">
      <PanelSection title="Formato">
        <FormatPicker />
        <p className="text-[11px] text-palco-suave">
          {f.width} × {f.height} px · {f.note}
        </p>
        <label className="flex items-center justify-between text-sm">
          Mostrar área segura (só na tela)
          <Toggle checked={s.showSafeGuides} label="Mostrar área segura" onChange={(v) => s.set({ showSafeGuides: v })} />
        </label>
      </PanelSection>

      <PanelSection title="Modo">
        <div className="space-y-1.5">
          {(Object.keys(MODE_LABELS) as PresentationMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => s.setMode(m)}
              className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${
                s.mode === m ? "border-landim-ouro/60 bg-landim-ouro/10" : "border-white/5 bg-white/[0.03] hover:border-white/15"
              }`}
            >
              <span className="text-sm font-medium">
                <span className="mr-1.5 font-serif text-landim-ouro">{MODE_LABELS[m].short}</span>
                {MODE_LABELS[m].label}
              </span>
              <span className="mt-0.5 block text-[11px] text-palco-suave">{MODE_LABELS[m].hint}</span>
            </button>
          ))}
        </div>
        {s.mode === "gilvan" && (
          <div className="space-y-2.5 rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <label className="flex items-center justify-between text-sm">
              Webcam
              <Toggle checked={s.webcamEnabled} label="Usar webcam" onChange={(v) => void toggleWebcam(v)} />
            </label>
            <Segmented<WebcamLayout>
              label="Posição do vídeo"
              value={s.webcamLayout}
              onChange={(v) => s.set({ webcamLayout: v })}
              options={[
                { value: "janela-circular", label: "Círculo" },
                { value: "janela-retangular", label: "Janela" },
                { value: "lado", label: "Lado a lado" },
              ]}
            />
            <label className="flex items-center justify-between text-sm">
              Espelhar imagem
              <Toggle checked={s.webcamMirror} label="Espelhar webcam" onChange={(v) => s.set({ webcamMirror: v })} />
            </label>
            {!s.webcamEnabled && <Notice>Sem webcam ativa, a composição mostra apenas a anatomia. Nenhum recorte automático de fundo é aplicado.</Notice>}
          </div>
        )}
      </PanelSection>

      <PanelSection title="Textos no vídeo">
        {(
          [
            ["title", "Título"],
            ["caption", "Legenda do passo"],
            ["signature", "Assinatura Instituto Landim"],
            ["notice", "Aviso de representação educativa"],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="flex items-center justify-between text-sm">
            {label}
            <Toggle checked={s.texts[k]} label={label} onChange={(v) => s.set({ texts: { ...s.texts, [k]: v } })} />
          </label>
        ))}
        {s.texts.notice === false && <Notice tone="pain">Mantenha o aviso ligado sempre que a área de desconforto estiver visível.</Notice>}
        <label className="block text-[11px] text-palco-suave">
          Título (só nesta sessão)
          <input
            value={s.titleOverride ?? step?.title ?? ""}
            onChange={(e) => s.set({ titleOverride: e.target.value })}
            maxLength={90}
            className="mt-1 w-full rounded-lg bg-black/20 px-2.5 py-1.5 text-sm text-palco-texto focus:outline-none focus:ring-1 focus:ring-landim-ouro/60"
          />
        </label>
        <label className="block text-[11px] text-palco-suave">
          Legenda (só nesta sessão)
          <input
            value={s.captionOverride ?? step?.caption ?? ""}
            onChange={(e) => s.set({ captionOverride: e.target.value })}
            maxLength={120}
            className="mt-1 w-full rounded-lg bg-black/20 px-2.5 py-1.5 text-sm text-palco-texto focus:outline-none focus:ring-1 focus:ring-landim-ouro/60"
          />
        </label>
        <p className="text-[11px] text-palco-suave">Mudanças definitivas de texto entram pelo catálogo de cenas, com revisão clínica.</p>
      </PanelSection>
    </div>
  );
}
