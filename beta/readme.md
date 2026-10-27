Use this repository to run and edit the app locally, then publish changes back through Base44.

Any change pushed to the repo will also be reflected in the Base44 Builder.

## Prerequisites

1. Clone the repository using the project's Git URL.
2. Navigate to the project directory.
3. Install dependencies: `npm install`.
4. Install the Base44 CLI: `npm install -g base44@latest`.

See the [Base44 CLI docs](https://docs.base44.com/developers/references/cli/get-started/overview) if you want to run Base44 commands directly.

## Run Locally

Run the full local development environment from the project root:

```bash
npm run dev
```

`npm run dev` inicia a API local e o frontend Vite. Use a URL impressa pelo comando.

For example, when the Base44 project config includes a `serveCommand`, `base44 dev` can launch the frontend too:

```json5
{
  "site": {
    "serveCommand": "npm run dev"
  }
}
```

In a Base44 project this lives in `base44/config.jsonc`.

## Run Only The Frontend

Se quiser executar somente o frontend contra uma API já hospedada, rode:

```bash
npm run dev
```

Abra a URL local impressa pelo Vite.

## Administração

O login administrativo está disponível em `/site/adm` e `/adm`. As credenciais
vêm exclusivamente de `ADMIN_EMAIL` e `ADMIN_PASSWORD` no ambiente do servidor.
Após o login, o painel de blog fica em `/admin/blog`. Artigos são persistidos no
SQLite definido por `DATABASE_PATH`; rascunhos e artigos arquivados não aparecem
no blog público.

## Apoio com IA

O endpoint `/api/beta/support` usa provedores Ollama ou OpenAI-compatible
configurados somente no backend. `AI_PROVIDER_PRIMARY_URL` é tentado primeiro e
`AI_PROVIDER_SECONDARY_URL` assume em caso de falha. Os modelos padrão são
`llama3.2:3b` e `qwen2.5:3b`, com timeout de 12 segundos, entrada de 4.000
caracteres e saída de 4.000 caracteres. Sem provedores configurados, o sistema
usa a orientação local. O beta exige consentimento e bloqueia sinais de risco
para encaminhamento humano.

Os endpoints de modelo não devem ser variáveis `VITE_*`. Em produção, use
serviços privados do Render ou infraestrutura própria. Consulte
`docs/beta/ai-redundancy-architecture.md` antes de habilitar modelos.

As variáveis abaixo são compatibilidade legada e não são necessárias para o backend Node/SQLite atual:

```bash
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

`VITE_BASE44_APP_ID` identifica o app legado e `VITE_BASE44_APP_BASE_URL` aponta
para sua API hospedada quando esse modo for realmente necessário.

## Publish Your Changes

After pushing your changes to git, open the Base44 dashboard and publish the app:

```bash
base44 dashboard open
```

## Docs & Support

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Base44 CLI command reference: [https://docs.base44.com/developers/references/cli/commands/introduction](https://docs.base44.com/developers/references/cli/commands/introduction)

Support: [https://app.base44.com/support](https://app.base44.com/support)
