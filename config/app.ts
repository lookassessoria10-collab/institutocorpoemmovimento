/**
 * Configuração central do módulo Corpo em Movimento (nome, marca, links do
 * ecossistema, contatos institucionais e modo de publicação de conteúdo).
 *
 * Segue o mesmo padrão do `config/app.ts` do Moveo: textos e links ficam
 * aqui para que nenhum componente precise ser alterado ao trocar dados.
 *
 * Dados institucionais: copiados da página oficial da campanha Histórias de
 * Volta (institutolandimhistorias.vercel.app, rodapé, consultado em
 * 21/10/2026). Não acrescente especialidades, registros ou contatos que não
 * estejam em uma fonte oficial do Instituto.
 */

export type ContentMode = "preview" | "production";

const contentMode: ContentMode =
  process.env.NEXT_PUBLIC_CONTENT_MODE === "production" ? "production" : "preview";

export const APP_CONFIG = {
  name: "Corpo em Movimento",
  institution: "Instituto Landim",
  campaign: "Histórias de Volta",
  tagline: "Atlas anatômico interativo do Instituto Landim",

  /**
   * "preview": conteúdos pendentes de revisão clínica aparecem com selo
   * visível ("Em revisão clínica").
   * "production": o atlas público só exibe textos, cenas e animações com
   * revisão clínica aprovada. O estúdio continua mostrando tudo, com selos.
   */
  contentMode,

  brand: {
    // Logotipos oficiais (ver public/brand/ e docs/10-marca-e-identidade.md)
    headerOnLight: "/brand/campanha-logo-landim.png",
    headerOnDark: "/brand/campanha-logo-landim-claro.png",
    signatureOnDark: "/brand/landim-vertical-branco-dourado-recorte.png",
    signatureOnLight: "/brand/landim-vertical-roxo-dourado-recorte.png",
    campaignTagline: "Mais vida. Menos dor.",
  },

  links: {
    historias: process.env.NEXT_PUBLIC_HISTORIAS_URL || "https://institutolandimhistorias.vercel.app/",
    /**
     * Movimentos de Volta (adaptação do Moveo). Enquanto a nova publicação
     * não existir, o link aponta para a raiz configurada aqui. Os caminhos
     * por região seguem as rotas atuais do Moveo (`/assessment/<regiao>`).
     */
    movimentos: process.env.NEXT_PUBLIC_MOVIMENTOS_URL || "",
    instituto: "https://institutolandim.com.br/",
    instagram: "https://www.instagram.com/institutolandim/",
  },

  contact: {
    whatsappNumber: "5571999723787",
    whatsappMessage:
      "Olá! Explorei o Corpo em Movimento, da campanha Histórias de Volta, e gostaria de falar com o Instituto Landim.",
    phoneDisplay: "(71) 3035-3787",
    phoneHref: "tel:+557130353787",
    email: "institutolandim@hotmail.com",
    address: "Centro Médico do Vale – Salas 215 e 216 · Av. Reitor Miguel Calmon, 1210 – Canela · Salvador – BA",
    technicalResponsible: "Dr. Gilvan Landim · Ortopedista · CRM-BA 26.935 · RQE 20.526",
  },

  copy: {
    disclaimer:
      "Conteúdo educativo. As imagens mostram estruturas anatômicas de referência e não representam o corpo de uma pessoa específica. Este material não realiza diagnóstico nem substitui uma consulta.",
    painDisclaimer:
      "A área destacada indica a região onde o desconforto costuma ser percebido. Ela não identifica a causa: sintomas parecidos podem ter origens diferentes e precisam de avaliação.",
    reviewBadge: "Em revisão clínica",
    illustrativeBadge: "Exemplo educativo",
  },
} as const;

export function whatsappHref(message: string = APP_CONFIG.contact.whatsappMessage) {
  return `https://wa.me/${APP_CONFIG.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Conteúdo clínico só aparece no atlas público em produção quando aprovado.
 * Em "preview" aparece com selo de revisão pendente.
 */
export function canShowPublic(status: "rascunho" | "aguardando-revisao" | "aprovado" | "reprovado"): boolean {
  if (status === "reprovado") return false;
  return APP_CONFIG.contentMode === "preview" || status === "aprovado";
}

export function movimentosUrl(path?: string): string | null {
  const base = APP_CONFIG.links.movimentos;
  if (!base) return null;
  return path ? new URL(path, base).toString() : base;
}
