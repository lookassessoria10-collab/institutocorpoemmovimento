import type { Metadata, Viewport } from "next";
import { Fraunces, Great_Vibes, Outfit } from "next/font/google";
import "./globals.css";
import { APP_CONFIG } from "@/config/app";

// Tipografia da campanha Histórias de Volta: Outfit (texto e títulos),
// Fraunces (serifa editorial) e Great Vibes (assinatura em script, usada
// apenas como acento tipográfico no nome, como em "de Volta").
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});
const script = Great_Vibes({ subsets: ["latin"], variable: "--font-script", weight: "400", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: `${APP_CONFIG.name} · ${APP_CONFIG.institution}`,
    template: `%s · ${APP_CONFIG.name}`,
  },
  description:
    "Explore as estruturas envolvidas nos movimentos do dia a dia e entenda, de forma visual, como diferentes regiões do corpo participam das suas atividades.",
  icons: { icon: "/brand/landim-vertical-roxo-dourado-recorte.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#140A1C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${fraunces.variable} ${script.variable}`}>
      <body className="min-h-dvh bg-landim-creme font-sans text-landim-texto antialiased">{children}</body>
    </html>
  );
}
