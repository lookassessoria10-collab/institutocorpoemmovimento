# Registro de procedência e licenças dos ativos anatômicos

Última verificação: **21/10/2026**. Toda nova fonte precisa de uma entrada
neste arquivo **antes** de entrar no pipeline.

## 1. Fonte em uso: BodyParts3D 4.0 (DBCLS)

| Campo | Valor |
| --- | --- |
| Autor | Database Center for Life Science (DBCLS), Japão |
| Origem | Malhas poligonais de um corpo adulto masculino de referência, segmentadas por conceito da Foundational Model of Anatomy (FMA). Mitsuhashi N. et al., *Nucleic Acids Res.* 2009;37:D782–5 (PMID 18835852). DOI do banco: 10.18908/lsdba.nbdc00837-000 |
| Arquivo baixado | `isa_BP3D_4.0_obj_99.zip` (142.903.898 bytes) + `isa_element_parts.txt`, `isa_inclusion_relation_list.txt`, `isa_parts_list_e.txt` — https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/ |
| Licença vigente | **CC BY 4.0** — página oficial https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html ("Last updated: 2025/02/27") |
| Licença anterior | CC BY-SA 2.1 Japan (snapshot de 05/07/2022 da mesma página). Os cabeçalhos dos arquivos OBJ baixados em 21/10/2026 **ainda trazem esse texto antigo**. |
| Atribuição exigida | `BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International` |
| Uso comercial/institucional | Permitido pela CC BY 4.0 (com atribuição e indicação de modificações). |
| Compartilhamento pela mesma licença | Não exigido pela CC BY 4.0. **Escolha conservadora:** os GLB derivados são distribuídos sob **CC BY-SA 4.0**, o que atende tanto à licença vigente quanto à leitura antiga (CC BY-SA 2.1 JP permite adaptações sob versão posterior com os mesmos elementos). |
| Redistribuição | Permitida. A CC 4.0 proíbe medidas técnicas que restrinjam quem recebe: **não criptografar os GLB públicos**. Compressão (meshopt) é permitida. |
| Alteração e animação | Permitidas, com indicação das mudanças (ver abaixo). |

### Modificações feitas (indicação exigida pela CC BY 4.0)

1. Conversão de eixos e unidades (mm, Z superior → metros, Y superior; rotação própria, sem espelhamento).
2. Simplificação (meshoptimizer) apenas das malhas acima do limite de triângulos da camada.
3. Pele (FMA7163) recortada por planos de altura/linha média e reduzida ao pedaço conectado mais próximo da articulação da região.
4. Normais suaves recalculadas, quantização e compressão `EXT_meshopt_compression`.
5. Cores por camada (a fonte não tem texturas).
6. Movimentos: rotação rígida de segmentos ósseos em torno de eixos calculados na própria malha.

Nenhuma estrutura foi criada, deformada ou deslocada.

### Onde a atribuição aparece

- Página pública `/creditos` (texto exato, licenças, modificações, hash de cada arquivo).
- Rodapé de todas as páginas públicas.
- Campo `asset.copyright` de cada GLB.
- Legenda das imagens estáticas (`/anatomy/previews/*`).
- Recomendação para vídeos: incluir na descrição do post
  "Modelos 3D: BodyParts3D, © DBCLS, CC BY 4.0 (modificado)".

### Pendências jurídicas (não confirmadas)

- Se vídeos renderizados a partir dos modelos são adaptações sujeitas a
  compartilhamento pela mesma licença: **não confirmado** — recomenda-se
  revisão jurídica. A atribuição na descrição resolve a exigência de crédito.
- Termos de uso gerais do NBDC (PDF) não puderam ser lidos na verificação.

## 2. Fontes avaliadas e NÃO usadas

| Fonte | Licença | Motivo de não usar (por enquanto) |
| --- | --- | --- |
| Z-Anatomy (github.com/Z-Anatomy, LluisV/Z-Anatomy) | CC BY-SA 4.0 (partes com BY-NC-SA e BY-NC: ouvido interno, rim) | Derivado do BodyParts3D; distribuído como .blend/.fbx grandes; tornaria todos os derivados BY-SA e exigiria triagem das partes NC. Candidato para ligamentos (ACL, PCL, meniscos, lábios) — **não confirmado** que as malhas existam nos FBX. |
| NIH 3D (3d.nih.gov) | Varia por modelo (CC0, CC BY, BY-NC-SA…) | Nenhum modelo multicamada (osso + músculo + ligamento) encontrado para joelho, ombro, quadril ou coluna. O "Knee, Male, Right" (HRA, CC BY 4.0) traz só ossos, cartilagem e menisco, em outro referencial. |
| Open Anatomy — SPL Knee Atlas | 3D Slicer License, parte B | Melhor fonte para ligamentos/meniscos/cartilagem do joelho, mas é outro indivíduo (RM), sem pele, em VTK e em outro referencial: exige registro ao BodyParts3D. Se usado, manter como ativo separado com aviso próprio da licença Slicer. |
| Complete Anatomy, BioDigital | Proprietárias | Não podem ser copiados sem licença. |

**Não misturar** malhas de versões diferentes do BodyParts3D (3.0 e 4.0): a
release 4.0 deslocou partes do esqueleto. O espelho do GitHub
(Kevin-Mattheus-Moerman/BodyParts3D) é da versão 3.0.

## 3. Arquivos publicados

A lista atual (nome, tamanho, SHA-256, estruturas) é gerada pelo pipeline em
`modules/anatomy/assets/manifests/*.json` e exibida em `/creditos`. Os testes
(`npm test`) conferem que cada GLB publicado corresponde ao hash do manifesto.

## 4. Marca e fontes tipográficas

- Logotipos Instituto Landim: arquivos oficiais fornecidos (`public/brand/landim-*.png`)
  e os logotipos horizontais publicados na campanha (`public/brand/campanha-logo-*.png`).
  As versões `*-recorte.png` são os mesmos arquivos sem as margens transparentes.
- Fontes Outfit, Fraunces e Great Vibes: SIL Open Font License, via Google Fonts (`next/font`).
