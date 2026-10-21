# 6. Cadastrar um roteiro

Arquivo: `modules/content/scripts.ts` (validado por `script` em `schema.ts`).
Cada cena aponta para um roteiro (`scriptId`) e o roteiro aponta de volta
(`sceneId`) — o teste confere a ligação.

## Campos

| Campo | Uso |
| --- | --- |
| `theme` | tema do vídeo |
| `hook` | gancho inicial (primeira frase) |
| `everydayContext` | situação cotidiana de partida |
| `structuresToShow` | estruturas a mostrar (em linguagem simples) |
| `suggestedMovement` | movimento sugerido (ou "pendente") |
| `supportText` | frases de apoio, na ordem |
| `visualGuidance` | orientação de câmera/camadas por passo |
| `closing` | encerramento |
| `durationSec` | faixa sugerida, ex.: `[40, 50]` |
| `videoFormat` | um dos 6 formatos abaixo |
| `editorialStatus` | `rascunho` · `aguardando-revisao-clinica` · `aprovado` · `gravado` · `publicado` |
| `clinicalReviewStatus` | revisão clínica (doc 11) |
| `notes` | alertas para a gravação |

## Formatos de vídeo

1. **O que acontece aqui dentro?** — região apresentada em camadas.
2. **Por dentro do movimento** — atividade cotidiana por animação.
3. **A dor está aqui. Mas por quê?** — área de desconforto + mecanismos gerais.
4. **Isso é normal?** — dúvida comum, sem afirmações absolutas.
5. **Você faz esse movimento todos os dias** — gesto simples como ponto de partida.
6. **Entenda em 30 segundos** — curto e direto.

## No estúdio

A aba **Roteiro** (coluna esquerda) mostra o roteiro da cena e os pontos de
fala do passo atual. Nada dessa aba entra no vídeo.
