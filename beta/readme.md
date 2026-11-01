# AuditVoto

Aplicação React/Vite com uma API Node.js e banco SQLite. O projeto pode ser
executado localmente ou publicado como um serviço web no Render.

## Requisitos

- Node.js 22.
- npm.

## Desenvolvimento local

Na pasta `beta`:

```bash
npm ci
npm run dev
```

O comando inicia a API e o Vite; o proxy encaminha `/api` para a API local.

## Publicar atualizações por arquivo

O publicador cria um commit e faz push ao GitHub para cada arquivo, em sequência.
Execute da pasta `beta`, com a branch atual sincronizada com `origin` e sem
alterações previamente staged:

```bash
npm run publish:files -- index.html readme.md src/App.jsx
```

Cada arquivo é enviado separadamente com uma mensagem como `Update index.html`.
Se um commit ou push falhar, o processo para sem avançar para os próximos
arquivos; um commit local cujo push falhou é informado para envio manual.
O comando usa a autenticação Git já configurada no computador e não armazena
tokens. Como o Render está com deploy automático, cada push pode iniciar um
deploy separado.

## Deploy no Render

O Blueprint está em [`../render.yaml`](../render.yaml), na raiz do repositório.
Ele define `beta` como diretório do serviço; os comandos `npm ci --include=dev`,
`npm run build` e `npm start` são executados dentro desse diretório. A API serve
o build do frontend e as rotas `/api` no mesmo serviço.

Após alterar o Blueprint, sincronize-o no painel do Render. Confirme que Build
Command está como `npm ci --include=dev && npm run build` e Start Command como
`npm start`; configurações antigas do painel podem continuar substituindo os
comandos do Blueprint.

O Blueprint usa o plano gratuito e grava o SQLite em
`/tmp/auditoria-brasil/app.sqlite`; não requer disco persistente. O filesystem
do plano gratuito é efêmero: os dados locais do SQLite são perdidos quando o
serviço reinicia, volta de uma suspensão ou recebe um novo deploy. O Render
suspende serviços gratuitos após 15 minutos sem tráfego, e a retomada pode
demorar cerca de um minuto. Use essa configuração para demonstrações e testes,
nunca como armazenamento durável de produção. Para manter dados entre deploys,
migre o SQLite para um banco externo persistente antes de depender dos recursos
locais de administração.

Configure no painel do Render:

- `JWT_SECRET` é gerado pelo Blueprint. Se o servidor iniciar com `JWT_SECRET is required`, sincronize o Blueprint no Render para aplicar essa variável ao serviço existente ou defina `JWT_SECRET` em Environment no painel e faça um novo deploy. Use um valor aleatório forte; não o publique nem use uma variável `VITE_*`.
- `VITE_BASE44_APP_ID`: ID do app Base44 que ainda hospeda autenticação, entidades e funções eleitorais; obrigatório para esses recursos.
- `VITE_BASE44_APP_BASE_URL`: opcional; origem HTTPS da API Base44 (padrão `https://base44.app`).
- `AI_PROVIDER_PRIMARY_URL` e `AI_PROVIDER_SECONDARY_URL`: opcionais; URLs dos provedores compatíveis.
- `ADMIN_EMAIL` e `ADMIN_PASSWORD`: credenciais administrativas; o Blueprint gera uma senha inicial.

As credenciais e URLs de provedores de IA não devem ser publicadas em variáveis
`VITE_*`. O ID e a origem Base44 são configurações públicas necessárias ao
frontend. Não configure token de usuário como variável de build.

## Integrações e limites atuais

- Login, cadastro, recuperação de senha e dados eleitorais ainda usam o Base44 por chamadas HTTP.
- O backend local mantém a API de apoio, SQLite e funções administrativas.
- Políticos, partidos, história, recursos educacionais, avaliações e funções de
  importação/verificação continuam no Base44. O pacote SDK foi removido; o
  frontend usa chamadas HTTP compatíveis para essas entidades/funções.
- Para remover Base44 por completo, ainda é necessário migrar essas entidades e
  funções para o backend local. Sem `VITE_BASE44_APP_ID`, essas consultas mostram
  erro de configuração em vez de consultar uma API implícita.
- Login social depende de o provedor estar habilitado no app Base44.
- Reportes de correção abrem uma issue pré-preenchida no GitHub; é necessário
  concluir o envio no GitHub.

O SQLite requer um único serviço Node. Não aumente o número de instâncias sem
migrar o banco para um serviço compartilhado.
