# 11. Realizar a revisão editorial e clínica

Todo conteúdo clínico é **provisório** até a revisão de Gilvan Landim ou da
equipe habilitada do Instituto. Hoje: **nenhum** texto, cena, roteiro ou
movimento está aprovado.

## O que revisar

| Item | Arquivo | Campo de status |
| --- | --- | --- |
| Nomes e descrições das estruturas | `modules/anatomy/structures/catalog.ts` | `reviewStatus` (padrão `aguardando-revisao`) |
| Movimentos (amplitudes, aproximações, patela) | `modules/anatomy/kinematics/motions.ts` | `reviewStatus` |
| Cenas (passos, textos públicos, legendas) | `modules/content/scenes.ts` | `clinicalReviewStatus`, `publicationStatus` |
| Roteiros | `modules/content/scripts.ts` | `editorialStatus`, `clinicalReviewStatus` |
| Respostas das perguntas | `modules/content/questions.ts` | revisar junto com a cena |
| Áreas de desconforto | `modules/anatomy/regions.ts` (`painAreas`) | revisar posição e rótulo |

## Checklist do revisor

- [ ] Nenhuma frase associa automaticamente região dolorosa a doença,
      limitação a lesão, estalo a alteração estrutural ou postura a causa.
- [ ] Sem promessa de cura, sem recomendação individual, sem simular exame.
- [ ] Nomes públicos corretos e não enganosos; nome técnico conferido.
- [ ] Movimentos: amplitudes demonstrativas aceitáveis; aproximação da patela
      (70% + contato) e altura da patela na malha de referência avaliadas.
- [ ] Áreas de desconforto identificadas como representação educativa.
- [ ] Qualquer "alteração" mostrada (nenhuma existe hoje) marcada como
      exemplo educativo.

## Como registrar a aprovação

1. Altere o status para `aprovado` no arquivo correspondente.
2. Registre no commit: quem revisou, data e o que foi revisado
   (ex.: `revisao: cena-04 aprovada por Dr. Gilvan Landim em 2026-11-03`).
3. Rode `npm test` — o validador impede cena "publicada" sem aprovação.

## Modo de conteúdo

`NEXT_PUBLIC_CONTENT_MODE`:

- `preview` (padrão): o atlas público mostra o conteúdo pendente **com selo**
  "Em revisão clínica".
- `production`: o atlas público mostra apenas o que estiver `aprovado`
  (cenas, perguntas, movimentos e descrições). O estúdio continua mostrando
  tudo, com selos.

Use `production` na publicação oficial.
