import type { ClinicalReviewStatus } from "@/modules/anatomy/types";

const LABELS: Record<ClinicalReviewStatus, string> = {
  rascunho: "Rascunho · revisão clínica pendente",
  "aguardando-revisao": "Em revisão clínica",
  aprovado: "Revisado pela equipe clínica",
  reprovado: "Reprovado na revisão clínica",
};

export function ReviewBadge({ status, className = "" }: { status: ClinicalReviewStatus; className?: string }) {
  const tone =
    status === "aprovado"
      ? "border-clinico-aprovado/40 bg-clinico-aprovado/10 text-clinico-aprovado"
      : status === "reprovado"
        ? "border-red-400/40 bg-red-400/10 text-red-300"
        : "border-clinico-pendente/40 bg-clinico-pendente/10 text-clinico-pendente";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tone} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {LABELS[status]}
    </span>
  );
}
