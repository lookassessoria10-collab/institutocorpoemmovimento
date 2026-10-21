/**
 * "Corpo em Movimento" como elemento tipográfico dentro da identidade da
 * campanha (mesmo recurso de "Histórias de Volta": Outfit bold em roxo +
 * palavra em script dourado). Não é um logotipo novo.
 */
export function Wordmark({
  tone = "light",
  size = "md",
  className = "",
}: {
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const main = tone === "light" ? "text-landim-roxo700" : "text-white";
  const sizes = {
    sm: ["text-lg", "text-2xl", "-mt-1"],
    md: ["text-2xl", "text-[2.1rem]", "-mt-2"],
    lg: ["text-4xl sm:text-5xl", "text-5xl sm:text-6xl", "-mt-3 sm:-mt-4"],
    xl: ["text-5xl sm:text-7xl", "text-6xl sm:text-8xl", "-mt-4 sm:-mt-6"],
  }[size];
  return (
    <span className={`inline-flex flex-col leading-none ${className}`} aria-label="Corpo em Movimento">
      <span aria-hidden className={`font-sans font-bold tracking-tight ${main} ${sizes[0]}`}>
        Corpo <span className="font-medium">em</span>
      </span>
      <span aria-hidden className={`font-script text-landim-ouro ${sizes[1]} ${sizes[2]} pl-[0.2em]`}>
        Movimento
      </span>
    </span>
  );
}
