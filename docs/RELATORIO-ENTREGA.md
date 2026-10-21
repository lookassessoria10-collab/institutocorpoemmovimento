# Relatório de entrega — Corpo em Movimento (v0.1.0, 21/10/2026)

## 1. Arquitetura

Projeto Next.js **independente** (`Downloads/corpo-em-movimento`), com a mesma
stack e convenções do Moveo (Next 14.2.35, React 18.3, Tailwind 3.4, zustand,
vitest, `config/app.ts` central, ids de região `shoulder/knee/spine`).
Nenhum projeto publicado foi alterado (Moveo/UORT e campanha intactos). Um
único sistema anatômico (`modules/anatomy`) alimenta o atlas público e o
Estúdio Gilvan; o conteúdo editorial (`modules/content`) é um catálogo único
validado contra os ativos. Detalhes: README e docs/INTEGRACAO.md.

## 2. Modelos

- **Fonte:** BodyParts3D 4.0 (DBCLS) — **CC BY 4.0** desde 27/02/2025 (licença
  verificada na página oficial); os OBJ ainda trazem o aviso antigo CC BY-SA
  2.1 JP, por isso os derivados são distribuídos sob CC BY-SA 4.0.
- **Identificadores reais:** cada estrutura tem FMA ID + arquivo FJ da fonte.
- **Gerados:** joelho (28 estruturas), quadril (31), ombro (32), coluna (104),
  esqueleto completo (203). 0,7–1,6 MB cada (meshopt).
- **Limitações:** sem ligamentos, meniscos, cartilagem articular, lábios e
  cápsulas (camadas indisponíveis, com aviso); músculos e pele estáticos;
  um corpo de referência; na fonte algumas superfícies atravessam a pele
  (tratado na exibição); patela da malha de referência baixa em relação à tíbia
  (para revisão clínica).
- Avaliadas e não usadas: Z-Anatomy, NIH 3D, SPL Knee Atlas (motivos em
  docs/LICENCAS-ANATOMIA.md).

## 3. Regiões funcionais

Ombro, Joelho, Coluna e Quadril — todas com modelo real, rotação, zoom,
deslocamento limitado, foco automático em estrutura, vistas
frente/lateral/posterior (e medial/superior quando aplicável), camadas reais,
seleção de estruturas, destaques, áreas de desconforto e textos. Pescoço,
cotovelo, punho, mãos, tornozelo e pés: estrutura pronta, "em preparação".

## 4. Animações

| Movimento | Situação |
| --- | --- |
| Joelho: dobrar e esticar (0–90°) | implementado · aguardando revisão |
| Sentar → em pé (quadril + joelho, cadeia) | implementado · aguardando revisão |
| Quadril: flexão (0–90°) | implementado · aguardando revisão |
| Quadril na caminhada (+30°/−10°) | implementado · aguardando revisão |
| Quadril ao levantar da cadeira | implementado · aguardando revisão |
| Elevação e rotação do ombro | **pendente** (cadeia escapulotorácica) |
| Flexão/extensão da coluna | **pendente** (modelo segmentar) |

Eixos calculados na malha: transepicondilar (81,5 mm), centro da cabeça do
fêmur (raio 22,8 mm, resíduo 0,8 mm), centro da cabeça do úmero (22,5 mm).
Patela: 70% do ângulo da tíbia (provisório) + contato patelofemoral calculado.
Controles: reproduzir, pausar, reiniciar, velocidade 0,25/0,5/1×, ciclo,
linha do tempo com avanço manual, posição inicial.

## 5. Atlas público

Entrada com esqueleto real em rotação lenta; seleção de regiões com imagens
renderizadas dos modelos; exploração (camadas com opacidade e transparência
progressiva, busca de estruturas, isolar/ocultar/destacar, ficha com nome
público e técnico); movimentos; cenas passo a passo; "O que você quer entender
melhor?" (6 perguntas); áreas de desconforto com aviso educativo; links para
Histórias de Volta e contato; créditos; alternativa estática sem WebGL;
movimento reduzido respeitado; celular com painel inferior.

## 6. Estúdio Gilvan

Acesso restrito real (hash scrypt + cookie HMAC, middleware + verificação na
página); colunas recolhíveis; biblioteca de cenas e roteiros; busca;
movimentos; camadas; câmera com presets da cena e duração de transição;
anotações (marcador, seta, área ancorados em 3D; legenda fixa; destaque,
contorno, transparência, isolar, desfazer), cada uma marcada para entrar ou
não no vídeo; formatos 9:16, 16:9 e 1:1 com área segura e reenquadramento;
modos A/B/C; webcam (círculo, janela, lado a lado); textos e assinatura;
roteiro automático por passos; modo apresentação; presets prontos e salvos
(exportar/importar JSON); diagnóstico de validação; atalhos de teclado.

## 7. Gravação

Canvas de composição na resolução de saída (mesma função da prévia) +
`MediaRecorder` + microfone; contagem regressiva, indicador, cronômetro,
prévia, download local, tratamento de erros e liberação das streams.

**Testado** no Chromium 152 (navegador do app, Windows 11): gravação no estúdio
→ MP4 H.264 (`avc1.640028`), 1080×1920, 3,93 s, quadros com anatomia
conferidos; teste isolado também gravou WebM VP9/VP8. **Não testados:**
captura real de microfone e webcam (bloqueadas no navegador de teste; só o
caminho de permissão negada foi verificado), Chrome/Edge desktop, Safari,
Firefox. Alternativa documentada: modo apresentação + OBS. Conversão
WebM→MP4 explícita (FFmpeg), sem renomear arquivos.

## 8. Cenas (12)

Prontas para demonstração (ativos completos, revisão clínica pendente): 03,
04 (cena de referência de 45 s), 05, 06, 08, 09 (parcial: tronco sem
animação), 10, 11, 12. **Pendentes de ativos:** 01, 02 (animação do ombro) e
07 (animação da coluna) — configuradas, com passos marcados como pendentes.

## 9. Integração

Links profundos `/atlas/<regiao>?cena=&passo=&estrutura=&vista=&camada=` e
atalho `/r/<id-do-moveo>`; links para Histórias de Volta e contato oficial;
Movimentos de Volta aparece como "em breve" até `NEXT_PUBLIC_MOVIMENTOS_URL`
ser definido (não há link para página inexistente). Sugestão de botões no
Movimentos de Volta em docs/INTEGRACAO.md (não aplicada no Moveo).

## 10. Atualização

Novos modelos: docs 01–03 (pipeline reprodutível). Movimentos: doc 04.
Cenas e roteiros: docs 05–06 (edição em arquivos estruturados, validados).
Câmeras: doc 07. Não foi criado editor visual público.

## 11. Testes executados

| Verificação | Resultado |
| --- | --- |
| `tsc --noEmit` | sem erros |
| `next lint` | sem avisos |
| `vitest` | **43/43** (conteúdo × ativos, cinemática nos modelos reais, enquadramento, layout dos 3 formatos × 3 modos, formatos de gravação, sessão e senha, hash dos GLB, nomes em português) |
| `next build` | 14 rotas, sem erros |
| Produção sem senha | `/estudio` bloqueado mesmo em localhost |
| Produção com senha | login, senha errada, cookie HttpOnly, cookie adulterado, redirecionamento aberto bloqueado, logout — todos conferidos; nenhum segredo no bundle |
| Visual (navegador) | 4 regiões, camadas, movimentos (45°/90°, sentar), estúdio nos modos A e C, celular 375×812 sem rolagem horizontal |

## 12. Publicação

Projeto Vercel **novo**, variáveis `STUDIO_PASSWORD_HASH` e
`STUDIO_SESSION_SECRET` (sem elas o estúdio fica bloqueado em produção),
`NEXT_PUBLIC_CONTENT_MODE=production` após a revisão clínica. Passo a passo
em docs/12-publicacao.md. Nada foi publicado nem versionado em Git ainda.

## Pendências para a equipe

1. Revisão clínica de textos, cenas, roteiros e movimentos (doc 11).
2. Ativos de ligamentos/meniscos (avaliar SPL Knee Atlas ou Z-Anatomy) e
   animações de ombro e coluna.
3. Testes de gravação com microfone/webcam reais e em Safari/Firefox.
4. Revisão jurídica sobre licença de vídeos derivados (CC BY-SA).
5. Criar o repositório e o projeto Vercel.
