# 5. Criar uma cena

As cenas ficam em `modules/content/scenes.ts` e são validadas por
`modules/content/schema.ts` (zod) e `modules/content/validate.ts` (contra os
ativos reais). Um só catálogo alimenta o atlas público ("Entender") e o
Estúdio Gilvan.

## Campos da cena

| Campo | Descrição |
| --- | --- |
| `id`, `number`, `slug`, `title` | identificação (o `slug` nomeia os arquivos gravados) |
| `region` | região temática (agrupamento no estúdio) |
| `modelId` | modelo usado (pode ser de outra região, ex.: sentar e levantar usa o membro inferior) |
| `videoFormat` | um dos 6 formatos de vídeo (doc 06) |
| `initialCamera`, `cameraPresets` | ids das câmeras da região (doc 07) |
| `activeLayers` | camadas ligadas no início de cada passo |
| `animationId`, `animationSpeed` | movimento principal |
| `highlightTargets`, `annotationItems` | estruturas destacadas / anotações principais |
| `scriptId` | roteiro associado (doc 06) |
| `estimatedDuration`, `outputFormat` | duração (s) e formato sugerido |
| `clinicalReviewStatus` | `rascunho` · `aguardando-revisao` · `aprovado` · `reprovado` |
| `publicationStatus` | `proposta` · `pendente-ativos` · `pronta-para-demonstracao` · `publicada` |
| `pendingAssets` | ativos que faltam (obrigatório quando `pendente-ativos`) |
| `coverageNote` | o que a cena **não** mostra (ex.: "sem ligamentos") |
| `steps[]` | passos sincronizados (abaixo) |

## Passos (`steps`)

Cada passo define o estado completo — o player aplica tudo de uma vez a partir
de um estado limpo, então câmera, camadas, destaques, movimento e legenda
ficam sempre sincronizados:

```ts
{
  id: "explicacao",
  label: "Cena 4 · Explicação",
  camera: "lateral",
  layers: { skin: { visible: false }, muscles: { opacity: 0.25 } },
  highlights: ["right_femur", "right_tibia"],
  outline: [],
  isolate: null,
  painArea: null,                       // id de region.painAreas
  motion: { id: "joelho-flexao-extensao", time: 0.25, play: false, speed: 0.6, loop: true },
  title: "…",                           // até 90 caracteres (modo C, abertura/encerramento)
  caption: "…",                         // até 120 caracteres (legenda do vídeo)
  publicText: "…",                      // explicação no atlas público
  talkingPoints: ["…"],                 // apoio para Gilvan (não vai para o vídeo)
  annotations: [{ type: "marcador", structure: "right_patella", text: "Patela", inRecording: true }],
  durationSec: 12,
  pending: "…",                         // se depende de ativo inexistente
}
```

## Validação

`npm test` falha se a cena citar estrutura, câmera, camada, área de
desconforto ou movimento inexistente, se estiver "pronta" com ativos
pendentes, ou "publicada" sem revisão aprovada. O estúdio mostra o resultado
da validação na aba **Info**.

## Situação das 12 cenas iniciais

| # | Cena | Situação dos ativos |
| --- | --- | --- |
| 01 | Levantar o braço | **pendente** (elevação do ombro) |
| 02 | Ombro ao vestir camisa | **pendente** (rotação do ombro) |
| 03 | Por dentro do ombro | pronta |
| 04 | Joelho ao subir escadas (cena de referência) | pronta |
| 05 | Levantar da cadeira (joelho) | pronta |
| 06 | Joelho que estala | pronta |
| 07 | Movimentos da coluna | **pendente** (animação da coluna) |
| 08 | Dor nas costas e causa | pronta |
| 09 | Sentar e levantar (regiões) | pronta, parcial (tronco sem animação) |
| 10 | Quadril na caminhada | pronta |
| 11 | Quadril ao levantar | pronta |
| 12 | Localização da dor no quadril | pronta |

Todas: revisão clínica **pendente**.
