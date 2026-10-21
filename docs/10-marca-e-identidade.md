# 10. Atualizar marcas e identidade

## Origem da identidade

- **Logotipos oficiais** (arquivos entregues pelo Instituto): `public/brand/landim-*.png`.
  Roxo da marca medido no arquivo: `#29183D`; dourado: `#D6B469`.
- **Campanha Histórias de Volta** (institutolandimhistorias.vercel.app, consultada
  em 21/10/2026): creme `#FBF7F1`, roxo `#3D1153` (escala 50–950), ouro
  `#D6B469`, fontes **Outfit** (texto/títulos), **Fraunces** (serifa editorial)
  e **Great Vibes** (assinatura em script, como em "de Volta").
- "Corpo em Movimento" **não tem logotipo próprio**: é composto
  tipograficamente pelo mesmo recurso da campanha (Outfit bold + palavra em
  script dourado) — `modules/brand/Wordmark.tsx`.

## Onde trocar

| O quê | Arquivo |
| --- | --- |
| Cores (tokens Tailwind) | `tailwind.config.ts` (`landim.*`, `palco.*`, `clinico.*`) |
| Fundo do palco 3D (tela **e** vídeo) | `modules/anatomy/viewer/background.ts` |
| Logotipos usados no cabeçalho e na assinatura do vídeo | `config/app.ts` → `brand` |
| Fontes | `app/layout.tsx` (`next/font/google`) |
| Contatos, links, responsável técnico | `config/app.ts` → `contact`, `links` |
| Avisos institucionais | `config/app.ts` → `copy` |

## Regras

- Use apenas dados oficiais (fonte atual: rodapé da página da campanha).
  Não acrescente especialidades, registros ou contatos sem fonte oficial.
- Os arquivos `*-recorte.png` são os oficiais sem margem transparente; não
  edite cores ou proporções do logotipo.
- O link "Movimentos de Volta" só vira link quando `NEXT_PUBLIC_MOVIMENTOS_URL`
  estiver definido (doc 12) — até lá aparece como "em breve".
