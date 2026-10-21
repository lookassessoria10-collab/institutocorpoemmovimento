# 3. Configurar camadas

## Classificação (pipeline)

A camada de cada estrutura vem da árvore IS-A da FMA
(`LAYER_CONCEPTS` em `scripts/anatomy/build-region-models.mjs`):

| Camada | Conceitos FMA |
| --- | --- |
| `skin` — Aparência externa | FMA7163 skin |
| `joints` — Discos e cartilagens | FMA10446 intervertebral disk, FMA55107 cartilage organ |
| `ligaments` — Ligamentos | FMA21496 ligament organ |
| `tendons` — Tendões e fáscias | FMA9721 tendon |
| `bones` — Ossos | FMA5018 bone organ, FMA10483 zone of bone organ |
| `muscles` — Músculos | FMA5022 muscle organ, FMA85453 head of muscle organ, FMA10474 zone of muscle organ, FMA32558 musculature |

Exceções explícitas (com justificativa) ficam em `LAYER_OVERRIDES`
(ex.: trato iliotibial → tendões e fáscias; partes do trapézio que a árvore
IS-A só classifica como "organ zone").

## Camadas disponíveis

`availableLayers(manifest)` lista apenas camadas com estruturas reais no
modelo. As demais aparecem desativadas, com o motivo
(`UNAVAILABLE` em `modules/atlas/RegionExplorer.tsx`, ex.: "A fonte não inclui
ligamentos do joelho"). **Nunca** simule uma camada inexistente mudando cores.

## Pele

- Recortada por planos (altura da região e, se houver, limite medial), com
  corte exato dos triângulos — bordas retas, como um corte de atlas.
- Fica só o pedaço conectado mais próximo do centro articular da região
  (evita mão/antebraço pendurados ao lado do quadril).
- Estruturas cujo centro está dentro do recorte recebem `coveredBySkin` no
  manifesto. Com a pele opaca, elas e todos os músculos/tendões não são
  desenhados — na fonte, algumas superfícies internas atravessam a pele.
- Na coluna não há pele (o recorte do tronco seria o próprio dorso inteiro).

## Transparência progressiva

O botão ✦ do painel de camadas leva cada camada externa a 35% e depois a
oculta, de fora para dentro, usando só camadas reais. A ordem de desenho
(`LAYER_RENDER_ORDER`) garante que camadas translúcidas externas sejam
desenhadas por último.

## Cores

`modules/anatomy/viewer/materials.ts` — convenções educativas sóbrias (a
fonte não tem texturas). Ajuste ali, não no GLB.
