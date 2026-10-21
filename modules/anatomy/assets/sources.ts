/**
 * Registro de procedência e licença das fontes anatômicas.
 * Detalhes, histórico e justificativas: docs/LICENCAS-ANATOMIA.md.
 */
export interface AnatomySource {
  id: string;
  name: string;
  author: string;
  origin: string;
  url: string;
  licenseUrl: string;
  license: string;
  /** Texto de atribuição exigido pelo licenciante. */
  attribution: string;
  /** Licença sob a qual o Instituto distribui os GLB derivados. */
  derivativesLicense: string;
  commercialUse: string;
  shareAlike: string;
  modifications: string[];
  notes: string[];
  verifiedAt: string;
}

export const SOURCES: Record<string, AnatomySource> = {
  "bodyparts3d-4.0": {
    id: "bodyparts3d-4.0",
    name: "BodyParts3D, versão 4.0 (árvore IS-A, OBJ com redução de 99%)",
    author: "Database Center for Life Science (DBCLS), Japão",
    origin:
      "Modelos poligonais de um corpo adulto masculino de referência, segmentados por conceito da Foundational Model of Anatomy (FMA). Mitsuhashi N. et al., Nucleic Acids Res. 2009;37:D782–5. DOI 10.18908/lsdba.nbdc00837-000.",
    url: "https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html",
    licenseUrl: "https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html",
    license: "Creative Commons Atribuição 4.0 Internacional (CC BY 4.0), vigente desde 27/02/2025",
    attribution: "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International",
    derivativesLicense: "CC BY-SA 4.0 (escolha conservadora — ver notas)",
    commercialUse: "Permitido pela CC BY 4.0, com atribuição.",
    shareAlike:
      "A CC BY 4.0 não exige. Os cabeçalhos dos OBJ ainda trazem o aviso antigo (CC BY-SA 2.1 JP); por isso os GLB derivados são distribuídos sob CC BY-SA 4.0, compatível com as duas leituras.",
    modifications: [
      "Conversão de eixos e unidades (mm, Z superior → m, Y superior).",
      "Simplificação de malhas acima do limite de triângulos de cada camada (meshoptimizer).",
      "Recorte da pele (FMA7163) à caixa de cada região.",
      "Normais suaves recalculadas, quantização e compressão EXT_meshopt_compression.",
      "Cores por camada (a fonte não tem texturas).",
      "Movimentos por rotação rígida de segmentos ósseos em torno de eixos calculados na própria malha.",
    ],
    notes: [
      "Página de licença verificada em 21/10/2026: CC BY 4.0, 'Last updated: 2025/02/27'.",
      "Os arquivos OBJ baixados em 21/10/2026 ainda contêm no cabeçalho o texto da licença anterior (CC BY-SA 2.1 Japan).",
      "A CC BY 4.0 proíbe medidas técnicas que restrinjam os direitos de quem recebe os modelos: os GLB públicos não devem ser criptografados.",
      "Se os vídeos produzidos no estúdio são adaptações sujeitas a compartilhamento pela mesma licença não foi confirmado — recomenda-se revisão jurídica e atribuição na descrição dos vídeos.",
    ],
    verifiedAt: "2026-10-21",
  },
};
