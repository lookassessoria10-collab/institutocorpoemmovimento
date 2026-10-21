import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AVAILABLE_REGIONS, regionBySlug } from "@/modules/anatomy/regions";
import { RegionExplorer } from "@/modules/atlas/RegionExplorer";

export function generateStaticParams() {
  return AVAILABLE_REGIONS.map((r) => ({ regiao: r.slug }));
}

export function generateMetadata({ params }: { params: { regiao: string } }): Metadata {
  const region = regionBySlug(params.regiao);
  return { title: region ? region.label : "Região" };
}

export default function RegionPage({ params }: { params: { regiao: string } }) {
  const region = regionBySlug(params.regiao);
  if (!region || !region.modelId) notFound();
  // useSearchParams (links profundos) exige um limite de Suspense.
  return (
    <Suspense fallback={<main className="h-dvh bg-palco-fundo" />}>
      <RegionExplorer regionId={region.id} />
    </Suspense>
  );
}
