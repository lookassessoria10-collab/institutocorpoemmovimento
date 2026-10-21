# Corpo em Movimento · Instituto Landim

Atlas anatômico interativo (público) e **Estúdio Gilvan** (produção de vídeos,
acesso restrito), integrados à campanha **Histórias de Volta**. Um único
sistema anatômico alimenta as duas experiências.

> Conteúdo educativo. Não realiza diagnóstico. Todos os textos clínicos estão
> **aguardando revisão** da equipe do Instituto (docs/11-revisao-editorial.md).

## Como rodar

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # 43 testes (conteúdo × ativos, cinemática, gravação, autenticação)
npm run typecheck && npm run lint && npm run build
```

Sem senha configurada, o estúdio (`/estudio`) abre **apenas** em localhost no
modo de desenvolvimento. Para testar com senha, copie `.env.example` para
`.env.local` e gere os valores com `npm run studio:hash-password -- "senha"`.

Os modelos 3D já estão em `public/anatomy/`. Para regenerá-los a partir da
fonte oficial: `npm run anatomy:fetch` e `npm run anatomy:build`.

## Rotas

| Rota | Conteúdo |
| --- | --- |
| `/` | Entrada: esqueleto real em destaque, regiões, perguntas, como funciona |
| `/atlas` | Seleção de regiões (Ombro, Joelho, Coluna, Quadril; demais "em preparação") |
| `/atlas/[regiao]` | Exploração: camadas, estruturas, movimentos, cenas, áreas de desconforto |
| `/perguntas` | "O que você quer entender melhor?" |
| `/creditos` | Procedência, licenças e modificações dos modelos |
| `/estudio` | Estúdio Gilvan (protegido) · `/estudio/entrar` login |
| `/r/[regiao]` | Atalho para integração com o Movimentos de Volta (ids do Moveo) |

## Arquitetura

```
app/                         rotas (Next.js App Router)
config/app.ts                marca, links, contatos oficiais, modo de conteúdo
middleware.ts                proteção de /estudio/* (servidor)
modules/
  anatomy/                   SISTEMA ANATÔMICO COMPARTILHADO
    assets/                  registry (modelos) · sources (licenças) · manifests/*.json (gerados)
    structures/catalog.ts    nomes técnico/público, descrições (revisáveis)
    kinematics/              movimentos (motions.ts) e solver (solve.ts)
    camera/framing.ts        vistas anatômicas e enquadramento por proporção
    viewer/                  R3F: AnatomyStage, AnatomyModel, CameraDirector, luzes, projeção
    ui/                      painéis reutilizados pelo atlas e pelo estúdio
    regions.ts               regiões, câmeras, áreas de desconforto
    store.ts                 estado do visualizador (camadas, seleção, destaques, animação…)
  content/                   cenas, roteiros, perguntas, presets (zod) + validador + player
  atlas/                     telas públicas
  studio/                    Estúdio Gilvan: composição, formatos, modos, gravação, presets
  auth/                      sessão assinada (HMAC) e verificação de senha (scrypt)
  brand/ ui/                 marca e componentes visuais
scripts/anatomy/             pipeline BodyParts3D → GLB (fetch, build, eixos articulares)
scripts/studio/              gerador de hash da senha do estúdio
public/anatomy/              GLB (meshopt) + imagens estáticas renderizadas dos modelos
docs/                        guias 01–12, licenças, integração
```

Stack: a mesma do Moveo (Next.js 14.2.35, React 18.3, Tailwind 3.4, zustand,
vitest), mais Three.js 0.170, React Three Fiber 8, Drei 9 e zod. Pipeline com
glTF-Transform + meshoptimizer.

## Modelos

Fonte única: **BodyParts3D 4.0** (DBCLS), CC BY 4.0 — atribuição
"BodyParts3D, © The Database Center for Life Science licensed under CC
Attribution 4.0 International". Derivados distribuídos sob CC BY-SA 4.0.
Detalhes e fontes avaliadas: [docs/LICENCAS-ANATOMIA.md](docs/LICENCAS-ANATOMIA.md).

| Modelo | Estruturas | Camadas reais | Tamanho |
| --- | --- | --- | --- |
| Joelho direito (coxa, perna e pelve) | 28 | pele, músculos, tendões/fáscias, ossos | 0,69 MB |
| Quadril (pelve e coxa direita) | 31 | pele, músculos, tendões/fáscias, discos, ossos | 0,67 MB |
| Ombro direito | 32 | pele, músculos, ossos | 0,75 MB |
| Coluna (C1–sacro, costelas, discos) | 104 | músculos, discos, ossos | 1,59 MB |
| Esqueleto completo (tela de entrada) | 203 | ossos | 0,99 MB |

Limitações principais: sem ligamentos, meniscos, cartilagem articular e
lábios; músculos e pele não se deformam (ficam ocultos durante movimentos);
um único corpo de referência.

## Imagens de prévia

`public/anatomy/previews/*.webp` (capas das regiões e alternativa sem WebGL)
foram renderizadas a partir dos próprios GLB no navegador. Ao trocar um modelo,
gere-as de novo com as mesmas vistas (capa: `geral` com pele a 28%; prévias:
`frente` e `lateral` sem pele).

## Documentação

1. [Inserir um novo modelo](docs/01-inserir-modelo.md)
2. [Mapear estruturas](docs/02-mapear-estruturas.md)
3. [Configurar camadas](docs/03-configurar-camadas.md)
4. [Adicionar uma animação](docs/04-animacoes.md)
5. [Criar uma cena](docs/05-criar-cena.md)
6. [Cadastrar um roteiro](docs/06-cadastrar-roteiro.md)
7. [Configurar a câmera](docs/07-configurar-camera.md)
8. [Preparar um vídeo](docs/08-preparar-video.md)
9. [Exportar uma gravação](docs/09-exportar-gravacao.md)
10. [Marca e identidade](docs/10-marca-e-identidade.md)
11. [Revisão editorial](docs/11-revisao-editorial.md)
12. [Publicação](docs/12-publicacao.md)
- [Integração com o ecossistema](docs/INTEGRACAO.md) · [Licenças](docs/LICENCAS-ANATOMIA.md) · [Relatório de entrega](docs/RELATORIO-ENTREGA.md)
