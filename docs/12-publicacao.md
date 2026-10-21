# 12. Publicar uma nova versão (Vercel)

Este módulo é um **projeto Vercel próprio**. Ele não altera nem substitui a
publicação do Moveo/UORT (moveo-omega.vercel.app) nem a da campanha
(institutolandimhistorias.vercel.app).

## Primeira publicação

1. Crie um repositório novo (ex.: `corpo-em-movimento`) e envie este projeto.
   `data/raw/` não é versionado; os GLB em `public/anatomy/` **são** (o build
   na Vercel não roda o pipeline).
2. Em vercel.com/new, importe o repositório **como projeto novo**
   (framework Next.js, comandos padrão).
3. Variáveis de ambiente (Settings › Environment Variables), **sem** o prefixo
   `NEXT_PUBLIC_` nas do estúdio:

   | Variável | Valor |
   | --- | --- |
   | `STUDIO_PASSWORD_HASH` | gerado por `npm run studio:hash-password -- "senha-forte"` |
   | `STUDIO_SESSION_SECRET` | gerado pelo mesmo comando (≥ 32 caracteres) |
   | `STUDIO_SESSION_HOURS` | opcional (padrão 12) |
   | `NEXT_PUBLIC_CONTENT_MODE` | `production` na publicação oficial (doc 11) |
   | `NEXT_PUBLIC_MOVIMENTOS_URL` | URL do Movimentos de Volta, quando existir |
   | `NEXT_PUBLIC_HISTORIAS_URL` | opcional (padrão: página da campanha) |

4. Deploy.

## Segurança do estúdio

- `middleware.ts` protege `/estudio/*` no servidor; a página do estúdio
  verifica a sessão de novo antes de renderizar.
- Senha guardada só como hash scrypt; sessão em cookie `HttpOnly`,
  `Secure`, `SameSite=Strict`, assinado com HMAC-SHA256 e com validade.
- **Sem as duas variáveis, o estúdio fica bloqueado em produção** (página
  "acesso não configurado"). Em desenvolvimento, sem senha, abre só em
  `localhost`.
- Login: atraso fixo e limite de tentativas por instância. Para reforçar,
  ative uma regra de **rate limit** em Vercel › Firewall para
  `/api/estudio/login`, e/ou **Vercel Authentication / Password Protection**
  só para deploys de preview.
- Trocar a senha: gere um novo hash e um novo segredo (o segredo novo invalida
  todas as sessões abertas) e faça redeploy.
- Gravações nunca são enviadas ao servidor. Câmera e microfone só são
  permitidos em `/estudio` (`Permissions-Policy`); o atlas público os bloqueia.

## Checklist antes de publicar

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

- [ ] Conteúdo revisado conforme doc 11 e `NEXT_PUBLIC_CONTENT_MODE=production`.
- [ ] Página `/creditos` conferida (atribuição BodyParts3D).
- [ ] Estúdio testado com senha no domínio publicado (HTTPS é necessário para
      câmera e microfone).

## Domínio

Sugestão: um subdomínio do Instituto (ex.: `corpo.institutolandim.com.br`)
apontado para este projeto em Settings › Domains — sem mexer nos domínios dos
outros projetos.

## Atualizar modelos

Rode o pipeline localmente (`npm run anatomy:build`), confira com `npm test`
e faça commit dos novos GLB e manifestos. Os nomes dos GLB levam o hash do
conteúdo, então o cache longo (`immutable`) nunca serve um arquivo antigo.
