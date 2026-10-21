import { APP_CONFIG } from "@/config/app";

/** Logotipo oficial do Instituto Landim (arquivos em public/brand/). */
export function LandimLogo({ tone = "light", className = "h-7 w-auto" }: { tone?: "light" | "dark"; className?: string }) {
  const src = tone === "light" ? APP_CONFIG.brand.headerOnLight : APP_CONFIG.brand.headerOnDark;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="Instituto Landim" className={className} width={806} height={170} />;
}
