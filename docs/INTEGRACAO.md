# Integração com Movimentos de Volta e Histórias de Volta

## Arquitetura do ecossistema

| Módulo | Papel | Publicação |
| --- | --- | --- |
| Histórias de Volta | campanha e experiências reais | institutolandimhistorias.vercel.app |
| Movimentos de Volta | biblioteca de movimentos + câmera (adaptação do Moveo) | ainda não publicada |
| **Corpo em Movimento** | atlas anatômico + Estúdio Gilvan | projeto Vercel próprio (este) |

O Moveo original (UORT, moveo-omega.vercel.app) **não foi alterado**. O
Corpo em Movimento reaproveita a mesma stack (Next.js 14.2.35, React 18,
Tailwind 3.4, zustand, vitest), o padrão de configuração central
(`config/app.ts`) e os mesmos identificadores de região
(`shoulder`, `knee`, `spine`), acrescentando `hip`.

## Links profundos

Abrir uma região, cena ou estrutura diretamente:

```
/atlas/joelho
/atlas/joelho?cena=cena-04            # abre a cena no passo 1
/atlas/joelho?cena=cena-04&passo=3    # passo (0 = primeiro)
/atlas/ombro?estrutura=right_supraspinatus
/atlas/coluna?vista=lombar-lateral
/atlas/quadril?camada=bones
```

Atalho com os ids usados no Moveo (redireciona preservando os parâmetros):

```
/r/shoulder   → /atlas/ombro
/r/knee       → /atlas/joelho
/r/spine      → /atlas/coluna
/r/hip        → /atlas/quadril
/r/elbow      → /atlas   (região ainda sem modelo: nunca leva a página inexistente)
```

Parâmetros inválidos são ignorados (a página abre normalmente). Cenas em
modo `production` só abrem se aprovadas.

## No Movimentos de Volta (sugestão, não aplicada)

Quando o Movimentos de Volta tiver sua publicação, adicione no `config/app.ts`
dele a URL do atlas e um botão na tela de resultado/preparação de cada região:

```tsx
// ex.: modules/knee/components/screens/ResultsScreen.tsx (Movimentos de Volta)
<a href={`${ATLAS_URL}/r/knee?cena=cena-04&origem=movimentos`}>Entenda o que acontece no joelho</a>
```

Mapeamento sugerido movimento → cena:

| Movimento (Moveo) | Abrir |
| --- | --- |
| Ombro: flexão/abdução | `/r/shoulder?cena=cena-01` (cena com animação pendente) ou `/r/shoulder?cena=cena-03` |
| Joelho: flexão/extensão, agachamento | `/r/knee?cena=cena-04` |
| Joelho: sentar e levantar | `/r/knee?cena=cena-05` |
| Coluna: flexão, inclinação | `/r/spine?cena=cena-08` (a cena 07 depende de animação pendente) |

E defina `NEXT_PUBLIC_MOVIMENTOS_URL` aqui para que os links de volta
apareçam no atlas (por região, usando as rotas `/assessment/<regiao>` do Moveo).

## Na campanha Histórias de Volta

Links sugeridos nos depoimentos (ex.: "Voltar a mover o braço" →
`/atlas/ombro`; "Voltar a se movimentar" → `/atlas/joelho?cena=cena-04`).
O atlas já aponta de volta para a campanha (links "Histórias de Volta").
