# 7. Configurar a câmera

As câmeras de cada região ficam em `modules/anatomy/regions.ts`
(`cameraPresets`). Convenção dos modelos: metros, +Y superior, +Z anterior,
+X à esquerda do corpo — a face **lateral** de estruturas do lado direito fica
em −X.

```ts
{ id: "lateral", label: "Lateral", view: "lateral", target: "focus", radius: 0.16 }
{ id: "geral", label: "Perna inteira", view: "oblique", target: { point: [-0.075, 0.45, 0.08] },
  radius: 0.5, extent: [0.2, 0.52] }
{ id: "lombar", label: "Parte de baixo das costas", view: "oblique",
  target: { structure: "fourth_lumbar_vertebra" }, radius: 0.12, azimuthDeg: 160, elevationDeg: 8 }
```

| Campo | Descrição |
| --- | --- |
| `view` | `anterior`, `posterior`, `lateral`, `medial`, `superior`, `inferior`, `oblique` |
| `target` | `"focus"` (centro articular calculado), `{ point }` ou `{ structure }` (centro da estrutura no manifesto) |
| `radius` | raio que precisa caber no quadro (enquadramento por esfera) |
| `extent` | meia-largura × meia-altura: enquadramento por retângulo, melhor para estruturas altas no formato vertical |
| `azimuthDeg`, `elevationDeg` | ajuste fino da direção |

## Comportamento

- A distância é recalculada para a **proporção do quadro** (9:16, 16:9, 1:1
  no estúdio; tela inteira no atlas). Trocar o formato reenquadra a cena sem
  recortar uma cena horizontal.
- Transições: interpolação esférica em torno do alvo (a câmera não atravessa
  o modelo), duração configurável no estúdio (0–3 s, aba **Câmera**).
- Movimento reduzido do sistema: transições instantâneas.
- Limites: distância mínima/máxima e área de deslocamento presas ao modelo.
- Gestos: arrastar gira; botão direito ou dois dedos move; roda ou pinça
  aproxima. Botões de vista, zoom, centralizar, desfazer e restaurar também
  estão disponíveis (acessíveis por teclado e toque).

## Ids especiais

- `geral` é usado por "Centralizar" e "Restaurar".
- `movimento` (quando existe) é a câmera escolhida ao selecionar um movimento.
- As cenas citam câmeras pelo id; o validador falha se o id não existir.
