# Arquitetura de IA redundante

Este documento define uma evolução segura para o beta de apoio, sem transformar modelos em profissionais de saúde, direito ou farmácia. Modelos locais e projetos open source podem apoiar organização, resumo e busca, mas decisões clínicas, jurídicas e de crise precisam de fontes verificáveis e encaminhamento humano.

## Proposta de componentes

### 1. Dupla de resposta

- Dois endpoints substituíveis, configurados por ambiente, por exemplo Ollama em servidor próprio e vLLM ou llama.cpp em outro nó.
- Um adaptador comum envia somente o contrato mínimo definido em `beta/ai-support-contract.md`.
- O orquestrador aplica timeout, limite de tamanho, cancelamento e circuit breaker por provedor.
- A segunda rota assume apenas quando a primeira falhar tecnicamente. Uma resposta não é considerada correta só por ter sido retornada.

### 2. Memória local

- O navegador mantém o histórico e oferece exclusão explícita.
- Dois resumidores independentes recebem uma janela limitada e devolvem apenas fatos, preferências e pendências estruturadas.
- O servidor nunca deve receber o histórico integral por padrão; o resumo só sai do dispositivo com consentimento.
- Divergências entre resumos devem reduzir a confiança e pedir confirmação ao usuário, não ser resolvidas por votação cega.

### 3. Controle de conteúdo

- Um verificador determinístico roda antes e depois do modelo: esquema, tamanho, URLs permitidas, palavras de crise e instruções perigosas.
- Um segundo verificador open source pode fazer classificação de risco e tentativa de detecção de alucinação, sempre como sinal de bloqueio ou revisão, nunca como autorização clínica.
- A saída só é exibida se passar pelas duas camadas e não contrariar o contrato.
- Em falha, retornar uma mensagem fixa de segurança e canais humanos, sem mostrar texto não validado.

## Projetos para avaliação

- **Ollama**, **llama.cpp** e **vLLM**: execução local ou em infraestrutura própria, sem exigir chave de API paga.
- **LiteLLM**: gateway e fallback entre provedores; deve ficar atrás da política de dados do projeto e não receber segredos no frontend.
- **Guardrails AI** ou validação própria com JSON Schema: estrutura e limites de saída; não substitui revisão de segurança.
- **Microsoft Presidio**: possível detecção de dados pessoais antes do envio, sujeito a testes em português.
- **Open WebUI**: interface opcional para operação interna, não deve ser exposta como camada de segurança do produto.

Esses projetos são pontos de partida técnicos. Antes de adoção, conferir licença, manutenção, modelo escolhido, requisitos de hardware, política de telemetria e desempenho em português.

## Papéis que não devem ser simulados

O sistema pode consultar acervo de fontes de médicos, psicólogos, psiquiatras, neurologistas, farmacêuticos ou advogados, mas deve apresentar a fonte e o limite da informação. Não deve afirmar que uma IA é qualquer desses profissionais, emitir diagnóstico, indicar medicação, definir conduta jurídica ou substituir atendimento.

## Configuração inicial sugerida

```text
AI_PROVIDER_PRIMARY_URL=http://ollama-primary:11434
AI_PROVIDER_SECONDARY_URL=http://ollama-secondary:11434
AI_MODEL_PRIMARY=nome-do-modelo-testado
AI_MODEL_SECONDARY=nome-do-modelo-testado
AI_REQUEST_TIMEOUT_MS=12000
AI_MAX_OUTPUT_CHARS=4000
AI_DATA_MODE=local-only
```

Nenhuma dessas variáveis deve conter segredo no bundle do navegador. O Render deve receber os valores no ambiente do serviço, com nós privados ou endpoints protegidos por rede. “Chave pública” não é requisito de segurança: se um provedor exigir segredo, ele permanece apenas no backend.

## Critérios antes de produção

1. Testes de contrato para resposta válida, resposta truncada, JSON inválido, timeout e indisponibilidade de cada provedor.
2. Testes adversariais para crise, automutilação, abuso, medicação, diagnóstico, prompt injection e dados pessoais.
3. Métricas sem texto bruto: latência, provedor, motivo de fallback, resultado dos validadores e consentimento.
4. Revisão humana de amostras e procedimento claro para bloquear um modelo ou provedor.
5. Teste de restauração do SQLite do Render e política de retenção antes de persistir qualquer memória.