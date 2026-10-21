import Link from "next/link";
import { APP_CONFIG, whatsappHref } from "@/config/app";
import { LandimLogo } from "@/modules/brand/LandimLogo";

export function SiteFooter() {
  const c = APP_CONFIG.contact;
  return (
    <footer className="break-words bg-landim-roxo950 px-4 py-12 text-sm text-white/80 sm:px-10">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <LandimLogo tone="dark" className="h-7 w-auto" />
          <p className="mt-4 max-w-sm text-white/70">{APP_CONFIG.copy.disclaimer}</p>
          <p className="mt-4 text-xs text-white/50">Responsável técnico: {c.technicalResponsible}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-landim-ouro">Fale com a gente</p>
          <ul className="mt-3 space-y-1.5">
            <li>
              <a href={whatsappHref()} className="hover:text-white">WhatsApp</a>
            </li>
            <li>
              <a href={c.phoneHref} className="hover:text-white">{c.phoneDisplay}</a>
            </li>
            <li>
              <a href={`mailto:${c.email}`} className="hover:text-white">{c.email}</a>
            </li>
            <li>
              <a href={APP_CONFIG.links.instagram} className="hover:text-white">@institutolandim</a>
            </li>
          </ul>
          <p className="mt-3 text-xs text-white/50">{c.address}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-landim-ouro">Ecossistema</p>
          <ul className="mt-3 space-y-1.5">
            <li>
              <a href={APP_CONFIG.links.historias} className="hover:text-white">Histórias de Volta</a>
            </li>
            <li>
              {APP_CONFIG.links.movimentos ? (
                <a href={APP_CONFIG.links.movimentos} className="hover:text-white">Movimentos de Volta</a>
              ) : (
                <span className="text-white/50">Movimentos de Volta · em breve</span>
              )}
            </li>
            <li>
              <a href={APP_CONFIG.links.instituto} className="hover:text-white">Instituto Landim</a>
            </li>
            <li>
              <Link href="/creditos" className="hover:text-white">Créditos e licenças dos modelos</Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs text-white/45">
        Modelos anatômicos: BodyParts3D, © The Database Center for Life Science, licenciado sob CC Attribution 4.0 International — convertidos e
        simplificados pelo Instituto Landim. © {new Date().getFullYear()} Instituto Landim.
      </p>
    </footer>
  );
}
