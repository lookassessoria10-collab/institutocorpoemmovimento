# 4. Adicionar uma animação

## Princípio

Os movimentos são **rotações rígidas de segmentos ósseos** em torno de eixos
calculados na própria malha do BodyParts3D. Não há rig de personagem genérico,
nem deformação de músculos ou pele: essas camadas são ocultadas
automaticamente enquanto a pose não é a neutra, com aviso na tela.

## Eixos disponíveis (scripts/anatomy/joints.mjs)

| Eixo | Método | Resultado no modelo |
| --- | --- | --- |
| `knee-tea` | Eixo transepicondilar: pontos mais proeminentes medial e lateral dos 12% distais do fêmur (aproximação usual do eixo de flexão; Churchill et al., 1998) | largura epicondilar 81,5 mm |
| `hip-center` | Centro da cabeça do fêmur por ajuste de esfera (mínimos quadrados, refinamento iterativo) | raio 22,8 mm · resíduo 0,8 mm |
| `shoulder-gh` | Centro da cabeça do úmero por ajuste de esfera | raio 22,5 mm · resíduo 1,3 mm |

O eixo do joelho guarda também a **tabela de contato patelofemoral**: para
cada ângulo de giro da patela, o deslocamento radial que mantém a mesma folga
mínima entre patela e fêmur medida em repouso (evita a patela flutuar ou
atravessar o fêmur).

## Movimentos implementados (modules/anatomy/kinematics/motions.ts)

| id | Modelo | Amplitude demonstrativa | Referência |
| --- | --- | --- | --- |
| `joelho-flexao-extensao` | joelho | 0° → 90° → 0° | AAOS 1965 (0–135°) |
| `sentar-levantar` | joelho (com pelve) | quadril e joelho 90° → 0° | AAOS 1965 |
| `quadril-flexao` | quadril | 0° → 90° → 0° | AAOS 1965 (0–120°) |
| `quadril-caminhada` | quadril | +30° ↔ −10° | Perry & Burnfield, 2010 |
| `quadril-sentar-levantar` | quadril | 90° → 0° | AAOS 1965 |

Todos com `reviewStatus: "aguardando-revisao"`.

### Aproximações declaradas

- Joelho com eixo único: não reproduz rolamento/deslizamento nem a rotação
  automática final.
- Patela: gira **70% do ângulo da tíbia** (proporção provisória, a validar) e
  usa a tabela de contato.
- Na malha de referência, a distância entre o polo inferior da patela e a
  tuberosidade da tíbia é curta (~22 mm): a altura da patela deve ser
  avaliada na revisão clínica.
- Sentar e levantar: pelve fixa na tela; tronco e tornozelo não representados.

## Movimentos pendentes (`PENDING_MOTIONS`)

- Elevação e rotação do ombro: exigem cadeia clavícula–escápula–úmero com
  ritmo escapuloumeral validado.
- Flexão/extensão da coluna: exige distribuição segmentar entre vértebras e
  deformação dos discos.

Ficam visíveis como "Em preparação" — nunca como demonstração concluída.

## Como adicionar

1. Se precisar de um eixo novo, implemente em `joints.mjs` com método
   documentado e indicador de qualidade (raio/resíduo/largura) e inclua o id
   em `joints` da região. Rode `npm run anatomy:build -- <regiao>`.
2. Marque o `segment` das estruturas que se movem em `regions.config.mjs`.
3. Declare o movimento em `motions.ts`:

   ```ts
   {
     id: "cotovelo-flexao",
     region: "elbow",
     modelId: "elbow-right",
     title: "Dobrar o cotovelo",
     publicDescription: "…",
     durationSec: 4,
     tracks: [{
       joint: "elbow-axis", axis: "primary", direction: 1,
       segments: ["antebraco"],
       keyframes: [{ t: 0, deg: 0 }, { t: 0.5, deg: 120 }, { t: 1, deg: 0 }],
       label: "Flexão do cotovelo",
     }],
     hiddenLayersWhileMoving: ["skin", "muscles", "tendons", "ligaments"],
     rangeNote: "Amplitude demonstrativa …, menor que a referência (…).",
     references: ["…fonte da amplitude…"],
     limitations: ["…"],
     reviewStatus: "aguardando-revisao",
   }
   ```

   - Trilhas são compostas na ordem proximal → distal (quadril antes do joelho).
   - `direction` ajusta o sinal para que ângulos positivos correspondam ao
     movimento nomeado (conferir nos testes).
   - **Não invente amplitudes**: use valores ≤ referência citada.
4. Escreva um teste em `modules/anatomy/__tests__/kinematics.test.ts` que
   confira a direção do movimento no modelo real.
5. Só marque `aprovado` depois da revisão clínica/anatômica registrada (doc 11).
