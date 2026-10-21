"use client";

import { StageButton } from "@/modules/ui/controls";
import { formatClock } from "./RecordingBar";
import { useStudioStore } from "./store";

/** Prévia da gravação: o arquivo só existe neste navegador até ser baixado. */
export function PreviewModal({ onDownload, onDiscard }: { onDownload: () => void; onDiscard: () => void }) {
  const result = useStudioStore((s) => s.result);
  const phase = useStudioStore((s) => s.phase);
  if (phase !== "preview" || !result) return null;
  const vertical = useStudioStore.getState().format === "vertical";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Prévia da gravação">
      <div className="flex max-h-full w-full max-w-4xl flex-col gap-4 rounded-2xl border border-white/10 bg-palco-painel p-5 text-palco-texto md:flex-row">
        <video src={result.url} controls playsInline className={`rounded-xl bg-black ${vertical ? "max-h-[70vh] md:w-[40%]" : "md:w-[62%]"} object-contain`} />
        <div className="flex flex-1 flex-col gap-3 text-sm">
          <h2 className="text-lg font-semibold">Gravação concluída</h2>
          <dl className="grid grid-cols-[110px_1fr] gap-y-1.5 text-[13px]">
            <dt className="text-palco-suave">Arquivo</dt>
            <dd className="break-all">{result.fileName}</dd>
            <dt className="text-palco-suave">Formato</dt>
            <dd>
              {result.format.container.toUpperCase()} · {result.format.mimeType}
            </dd>
            <dt className="text-palco-suave">Duração</dt>
            <dd>{formatClock(result.durationMs)}</dd>
            <dt className="text-palco-suave">Tamanho</dt>
            <dd>{(result.bytes / 1024 / 1024).toFixed(1)} MB</dd>
          </dl>
          {result.format.container === "webm" && (
            <p className="rounded-xl border border-clinico-pendente/30 bg-clinico-pendente/10 p-3 text-[12px] text-[#F3D79C]">
              Este navegador gravou em WebM. Para o Instagram, converta para MP4 (ver docs/09-exportar-gravacao.md) — o arquivo não foi renomeado como MP4.
            </p>
          )}
          <p className="text-[12px] text-palco-suave">O vídeo fica apenas neste computador: nada foi enviado a servidores.</p>
          <div className="mt-auto flex gap-2">
            <StageButton icon="download" label="Baixar vídeo" onClick={onDownload} className="border-landim-ouro/60 bg-landim-ouro text-landim-roxo950 hover:bg-landim-ouroClaro" />
            <StageButton label="Descartar" onClick={onDiscard} />
          </div>
        </div>
      </div>
    </div>
  );
}
