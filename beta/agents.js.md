# AGENTS.md

## Contexto do projeto

Este repositório contém o AuditVoto: frontend React/Vite, API Node.js e banco
SQLite. Preserve as convenções existentes e mantenha alterações focadas.

## Arquivos principais

- `src/`: frontend React.
- `src/api/localApi.js`: cliente da API local.
- `src/api/base44Client.js`: adaptador HTTP para as entidades e funções eleitorais
  ainda hospedadas no Base44.
- `server/server.js`: API, autenticação local, SQLite e serving do build.
- `render.yaml`: Blueprint Render na raiz do repositório.

## Desenvolvimento e deploy

- Use `npm ci` para instalar as dependências do lockfile.
- Use `npm run dev` na pasta `beta` para iniciar a API e o frontend.
- Execute `npm run build` e `npm run lint` antes de concluir mudanças no app.
- Para publicar arquivos em commits e pushes individuais, use
  `npm run publish:files -- arquivo1 arquivo2` na pasta `beta`.
- O Render executa `npm ci --include=dev`, `npm run build` e `npm start` a
  partir de `beta`; a instalação inclui ferramentas de build mesmo com
  `NODE_ENV=production`.
- O Blueprint do Render usa o plano gratuito e SQLite efêmero em
  `/tmp/auditoria-brasil/app.sqlite`; não trate dados locais como duráveis.
  Persistência de produção exige migrar para um banco externo persistente.
- As sessões e os dados eleitorais ainda dependem do Base44 configurado por
  `VITE_BASE44_APP_ID` e `VITE_BASE44_APP_BASE_URL`.
- Mantenha segredos e URLs privados de provedores somente no backend. Variáveis
  `VITE_*` são incluídas no build do navegador e não podem conter segredos.

## Migração Base44

O SDK Base44 foi removido. As chamadas HTTP ao Base44 só permanecem para
entidades e funções eleitorais sem implementação local. Não adicione novas
dependências Base44; prefira migrar essas operações para a API local com dados
e comportamento equivalentes antes de remover a compatibilidade existente.
