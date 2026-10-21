# 1. Inserir um novo modelo anatômico

O pipeline converte os arquivos oficiais do BodyParts3D 4.0 em um GLB por
região. Ele é reprodutível: os dados brutos ficam em `data/raw/` (fora do Git)
e podem ser baixados de novo a qualquer momento.

## Passo a passo

1. **Baixar a fonte** (uma vez por máquina, ~143 MB):

   ```bash
   npm run anatomy:fetch
   ```

   Salva os arquivos em `data/raw/bodyparts3d-4.0/`, registra o SHA-256 de
   cada download em `_downloads.json` e extrai os 2.234 OBJ.

2. **Escolher as estruturas.** Cada arquivo da fonte (`FJxxxx.obj`) corresponde
   a um conceito FMA. Procure pelo nome em inglês em
   `data/raw/bodyparts3d-4.0/isa_element_parts.txt`
   (colunas: FMA ID · nome · arquivo FJ). Exemplo:
   `FMA24474  right femur  FJ3365`.
   Arquivos com sufixo `M` são as cópias espelhadas do lado esquerdo.

3. **Declarar a região** em `scripts/anatomy/regions.config.mjs`:

   ```js
   {
     id: "elbow",            // mesmo id usado em modules/anatomy/types.ts
     file: "elbow-right",    // prefixo do GLB
     title: "Cotovelo direito",
     side: "right",
     structures: [
       { fj: "FJ3368", segment: "braco" },     // right humerus
       { fj: "FJxxxx", segment: "antebraco" }, // conferir na lista oficial
     ],
     skin: { margin: 0.04, medialLimitX: 0 }, // ou null (sem pele)
     budget: { bones: 12000, muscles: 7000, skin: 30000 },
     focus: "elbow-axis",   // eixo calculado em joints.mjs (ou null)
     joints: [],
   }
   ```

   - `segment`: segmento rígido usado por movimentos (deixe vazio se não houver).
   - `budget`: limite de triângulos por estrutura em cada camada.
   - `skin`: recorte da pele por altura e linha média (ver doc 03).

4. **Gerar o GLB e o manifesto**:

   ```bash
   npm run anatomy:build -- elbow
   ```

   Saída: `public/anatomy/elbow-right.<hash>.glb` e
   `modules/anatomy/assets/manifests/elbow-right.json` (estruturas, FMA IDs,
   camadas, centros, eixos, limitações, SHA-256). O build falha se algum FJ não
   existir na lista oficial.

5. **Registrar o modelo** em `modules/anatomy/assets/registry.ts`
   (`MODELS` e `REGION_MODEL`).

6. **Configurar a região** em `modules/anatomy/regions.ts`: troque o
   `status` para `"disponivel"`, preencha `modelId`, textos, câmeras (doc 07)
   e áreas de desconforto.

7. **Nomear as estruturas** em `modules/anatomy/structures/catalog.ts` (doc 02).

8. **Testar**: `npm test` confere hash dos arquivos, identificadores FMA/FJ e
   nomes em português para todas as estruturas.

9. **Gerar imagens estáticas** (capa da região e alternativa sem WebGL) —
   ver "Imagens de prévia" no README.

## Regras

- Uma fonte nova só entra depois de registrada em `docs/LICENCAS-ANATOMIA.md`.
- Não misture versões diferentes do BodyParts3D (3.0 × 4.0).
- Se uma estrutura não existe na fonte, ela **não** é modelada à mão para
  "completar" o atlas: registre a limitação no manifesto (`regionLimitations`
  no script de build) e deixe a camada indisponível.
