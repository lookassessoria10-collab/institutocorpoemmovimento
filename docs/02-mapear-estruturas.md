# 2. Mapear as estruturas

## Identificadores

Cada nó do GLB tem:

| Campo | Exemplo | Origem |
| --- | --- | --- |
| `id` (nome do nó) | `right_patella` | gerado do nome oficial em inglês |
| FMA ID | `FMA24486` | `isa_element_parts.txt` |
| Arquivo BodyParts3D | `FJ3381` | nome do OBJ |
| Camada | `bones` | classe IS-A da FMA (doc 03) |

O nome em inglês é o **conceito mais específico** que contém o arquivo,
calculado pela árvore IS-A oficial (`isa_inclusion_relation_list.txt`) — ver
`scripts/anatomy/lib-parts.mjs`. Nenhum identificador é digitado à mão.

Quando a fonte usa o mesmo conceito para dois arquivos (ex.: conjuntos da
linha média, original + espelhado), o pipeline acrescenta `__right_side` ou
`__left_side` conforme a posição real (X < 0 = direito) e o nome técnico
indica "lado identificado pela posição no modelo".

Caso especial documentado: `FJ3211` aparece na fonte apenas como
"intervertebral disk" (sem nível). Pela geometria, fica entre T12 e L1 — e é
assim que o catálogo o identifica, deixando claro que o nível vem da posição.

## Textos (catálogo)

`modules/anatomy/structures/catalog.ts`, por `id`:

```ts
right_patella: {
  technicalPt: "Patela direita",                       // Terminologia Anatômica
  publicName: "Patela · osso da frente do joelho",     // linguagem cotidiana
  description: "Pequeno osso na frente do joelho…",    // 1–2 frases
  keywords: ["rótula"],                                 // busca
},
```

Séries (vértebras, discos, costelas, músculos da coluna) são traduzidas por
tabela fixa a partir do nome oficial, na mesma função.

### Regras para o nome público

- Deve ser anatomicamente correto e não induzir interpretação errada
  (ex.: "articulação glenoumeral" → "articulação do ombro").
- O nome técnico continua visível em letra menor e nos dados internos.
- Sem diagnóstico, causa de dor ou promessa nas descrições.
- Estrutura sem tradução aparece com o nome oficial em inglês e status
  `rascunho` — os testes falham se isso acontecer em um modelo regional.

Todos os textos começam como `aguardando-revisao` (doc 11).
