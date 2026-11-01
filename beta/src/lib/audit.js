// Núcleo de auditoria eleitoral — configurações de cargo, KPIs por esfera e scoring.

export const CARGOS = {
  prefeito: { label: "Prefeito(a)", esfera_gov: "municipal", tipo: "executivo", corporate: "Gerente de Operações (COO Regional)", short: "Prefeito" },
  vereador: { label: "Vereador(a)", esfera_gov: "municipal", tipo: "legislativo", corporate: "Conselheiro — Câmara Municipal", short: "Vereador" },
  governador: { label: "Governador(a)", esfera_gov: "estadual", tipo: "executivo", corporate: "VP de Logística e Supply Chain", short: "Governador" },
  deputado_estadual: { label: "Deputado(a) Estadual", esfera_gov: "estadual", tipo: "legislativo", corporate: "Conselheiro — Assembleia Legislativa", short: "Dep. Estadual" },
  deputado_federal: { label: "Deputado(a) Federal", esfera_gov: "federal", tipo: "legislativo", corporate: "Conselheiro — Câmara dos Deputados", short: "Dep. Federal" },
  senador: { label: "Senador(a)", esfera_gov: "federal", tipo: "legislativo", corporate: "Conselheiro — Senado Federal", short: "Senador" },
  presidente: { label: "Presidente da República", esfera_gov: "federal", tipo: "executivo", corporate: "CEO do Grupo / Holding", short: "Presidente" },
};

// Ordem do pleito (executivo primeiro, depois legislativo)
export const PLEITO_ORDER = ["prefeito", "governador", "presidente", "senador", "deputado_federal", "deputado_estadual", "vereador"];

// Protocolo de Auditoria — 4 passos, notas 0 a 10
export const CRITERIOS = [
  { key: "track_record", label: "Track Record de Entregas", desc: "Gerenciou orçamentos equivalentes com resultados mensuráveis de eficiência?" },
  { key: "integridade", label: "Integridade Jurídica", desc: "Certidões TCU/TCE e Justiça. Improbidade = demissão por justa causa." },
  { key: "transparencia", label: "Checagem no Portal da Transparência", desc: "Para mandatários: cota, assiduidade, emendas. Para legislativo: atuação parlamentar." },
  { key: "coerencia", label: "Coerência da Proposta Financeira", desc: "Plano com impacto orçamentário e fonte de custeio real, sem endividamento irresponsável." },
];

// KPIs por esfera (executivo)
export const KPIS = {
  municipal: [
    { key: "ifgf", label: "Autonomia Fiscal (IFGF)", target: 0.8, op: "gte", type: "number", min: 0, max: 1, step: 0.01, unit: "índice", portal: "Relatórios de Gestão Fiscal / LDO-LOA", hint: "Alvo: IFGF > 0,80" },
    { key: "capex", label: "Taxa de Investimento (CAPEX)", targetMin: 8, targetMax: 12, type: "percent", unit: "%", portal: "Balanço Anual / Execução Orçamentária", hint: "Alvo: 8% a 12% do orçamento em obras/infraestrutura" },
    { key: "pregao", label: "Pregão Eletrônico Transparente", target: 100, op: "gte", type: "percent", unit: "%", portal: "Módulo de Licitações e Contratos", hint: "Alvo: 100% dos processos via pregão eletrônico" },
    { key: "aditivos", label: "Taxa de Aditivos Contratuais", target: 10, op: "lte", type: "percent", unit: "%", portal: "Módulo de Licitações e Contratos", hint: "Alvo: menor taxa possível (≤ 10%)" },
    { key: "racio_pessoal", label: "Rácio Comissionados / Concursados", target: 30, op: "lte", type: "percent", unit: "%", portal: "Consulta de Servidores Comissionados", hint: "Alvo: redução contínua (≤ 30%)" },
  ],
  estadual: [
    { key: "divida_rcl", label: "Dívida Consolidada Líquida / RCL", target: 60, op: "lte", type: "percent", unit: "%", portal: "Relatório de Gestão Fiscal (RGF Estadual)", hint: "Alvo: abaixo de 60% da RCL" },
    { key: "custo_atendimento", label: "Variação do Custo por Atendimento", target: 0, op: "lte", type: "percent", unit: "%", portal: "Execução de Saúde e Segurança (SICONFI)", hint: "Alvo: redução do custo por habitante atendido (≤ 0%)" },
    { key: "leitos_policiamento", label: "Variação de Leitos / Policiamento", target: 0, op: "gte", type: "percent", unit: "%", portal: "Execução de Saúde e Segurança (SICONFI)", hint: "Alvo: aumento das metas (≥ 0%)" },
    { key: "parecer_tce", label: "Parecer do TCE-SC", target: "aprovado_sem_restricoes", type: "select", options: [
      { value: "aprovado_sem_restricoes", label: "Aprovado sem ressalvas graves" },
      { value: "aprovado_com_ressalvas", label: "Aprovado com ressalvas" },
      { value: "reprovado", label: "Reprovado" },
    ], portal: "Relatórios do Tribunal de Contas", hint: "Alvo: aprovado sem ressalvas graves nos últimos 4 anos" },
  ],
  federal: [
    { key: "divida_pib", label: "Dívida Bruta / PIB (trajetória)", target: "decrescente", type: "select", options: [
      { value: "decrescente", label: "Trajetória decrescente" },
      { value: "estavel", label: "Trajetória estável" },
      { value: "crescente", label: "Trajetória crescente" },
    ], portal: "SICONFI / Relatórios do Tesouro Nacional", hint: "Alvo: trajetória estável ou decrescente" },
    { key: "risco_pais", label: "Risco-País (trajetória)", target: "queda", type: "select", options: [
      { value: "queda", label: "Queda do risco soberano" },
      { value: "estavel", label: "Estável" },
      { value: "alta", label: "Alta do risco soberano" },
    ], portal: "Banco Central / Relatórios Financeiros", hint: "Alvo: queda do risco + atração de FDI" },
    { key: "transparencia_emendas", label: "Rastreabilidade de Emendas", target: 100, op: "gte", type: "percent", unit: "%", portal: "Portal da Transparência (CGU / Emendas Parlamentares)", hint: "Alvo: 100% rastreável, execução com projeto técnico aprovado" },
  ],
};

// Checklist do conselheiro (legislativo)
export const CHECKLIST_LEGISLATIVO = [
  { key: "audita_contas", label: "Audita detalhadamente as contas do Executivo", portal: "Tribunal de Contas / Portal da Transparência" },
  { key: "enxuga_maquina", label: "Vota para enxugar a máquina e revogar leis ineficientes", portal: "Diário Oficial / Dados Abertos" },
  { key: "custo_gabinete", label: "Mantém baixo o custo do próprio gabinete (cota, verba indenizatória)", portal: "Portal da Transparência — Cota Parlamentar" },
  { key: "assiduidade", label: "Alta assiduidade nas comissões e plenário", portal: "Dados Abertos da Câmara/Senado/CM" },
  { key: "emendas_rastreaveis", label: "Emendas orçamentárias rastreáveis com beneficiário identificado", portal: "Portal da Transparência — Emendas" },
];

// Portais oficiais de auditoria
export const PORTAIS = {
  transparencia_federal: { label: "Portal da Transparência (CGU)", url: "https://www.portaldatransparencia.gov.br/" },
  siconfi: { label: "SICONFI — Tesouro Nacional", url: "https://siconfi.tesouro.gov.br/siconfi/" },
  tesouro: { label: "Tesouro Nacional", url: "https://www.tesouro.gov.br/" },
  tcu: { label: "Tribunal de Contas da União (TCU)", url: "https://portal.tcu.gov.br/" },
  tce_sc: { label: "TCE de Santa Catarina", url: "https://www.tce.sc.gov.br/" },
  bacen: { label: "Banco Central", url: "https://www.bcb.gov.br/" },
  tse: { label: "TSE — DivulgaCand", url: "https://divulgacandcontas.tse.jus.br/" },
  camara: { label: "Câmara dos Deputados — Dados Abertos", url: "https://www.camara.leg.br/dados-abertos/" },
  senado: { label: "Senado Federal — Dados Abertos", url: "https://www12.senado.leg.br/dados-abertos" },
  transparencia_municipal: { label: "Portal da Transparência Municipal", url: "https://www.portaldatransparencia.gov.br/localidades" },
};

// Portais relevantes por esfera/tipo
export function portaisParaCargo(cargo) {
  const c = CARGOS[cargo];
  if (!c) return [];
  if (c.tipo === "legislativo") {
    if (c.esfera_gov === "federal") return ["transparencia_federal", "tcu", "camara", "senado"];
    if (c.esfera_gov === "estadual") return ["transparencia_federal", "tce_sc"];
    return ["transparencia_municipal", "tce_sc"];
  }
  if (c.esfera_gov === "municipal") return ["transparencia_municipal", "tce_sc", "siconfi"];
  if (c.esfera_gov === "estadual") return ["siconfi", "tce_sc", "tesouro"];
  return ["transparencia_federal", "siconfi", "tesouro", "tcu", "bacen"];
}

// ---- Scoring ----

// Pontua um KPI individual (0-100)
export function scoreKpi(kpi, value) {
  if (value === undefined || value === null || value === "") return null;
  if (kpi.type === "select") {
    const opts = kpi.options.map((o) => o.value);
    const idx = opts.indexOf(value);
    if (idx < 0) return null;
    // primeira opção = melhor (100), última = pior (0), interpolado
    return Math.round(100 * (opts.length - 1 - idx) / (opts.length - 1));
  }
  const v = Number(value);
  if (isNaN(v)) return null;
  if (kpi.op === "gte") {
    // maior ou igual ao target = 100; abaixo penaliza proporcional
    if (v >= kpi.target) return 100;
    return Math.max(0, Math.round((v / kpi.target) * 100));
  }
  if (kpi.op === "lte") {
    // menor ou igual ao target = 100; acima penaliza
    if (v <= kpi.target) return 100;
    const over = v - kpi.target;
    return Math.max(0, Math.round(100 - (over / Math.max(Math.abs(kpi.target), 1)) * 100));
  }
  if (kpi.targetMin !== undefined) {
    // faixa ideal
    if (v >= kpi.targetMin && v <= kpi.targetMax) return 100;
    if (v < kpi.targetMin) return Math.max(0, Math.round((v / kpi.targetMin) * 100));
    const over = v - kpi.targetMax;
    return Math.max(0, Math.round(100 - (over / kpi.targetMax) * 100));
  }
  return null;
}

// Pontuação do painel de KPIs (média dos scores)
export function scoreKpis(esfera_gov, kpis) {
  const defs = KPIS[esfera_gov] || [];
  const scores = defs.map((d) => scoreKpi(d, kpis[d.key])).filter((s) => s !== null);
  if (!scores.length) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// Pontuação do checklist (cumpre=100, parcial=50, nao=0)
export function scoreChecklist(checklist) {
  const vals = Object.values(checklist || {}).filter((v) => v);
  if (!vals.length) return null;
  const map = { cumpre: 100, parcial: 50, nao: 0 };
  const scores = vals.map((v) => map[v] ?? null).filter((s) => s !== null);
  if (!scores.length) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// Nota sintética final (0-100)
export function notaSintetica({ notas, kpis, checklist, esfera_gov, tipo, alertas }) {
  const criterioVals = CRITERIOS.map((c) => Number(notas?.[c.key])).filter((n) => !isNaN(n) && n >= 0);
  const criteriaScore = criterioVals.length
    ? (criterioVals.reduce((a, b) => a + b, 0) / criterioVals.length) * 10
    : null;

  let kpiScore = null;
  if (tipo === "legislativo") {
    kpiScore = scoreChecklist(checklist);
  } else {
    kpiScore = scoreKpis(esfera_gov, kpis);
  }

  let synth = null;
  if (criteriaScore !== null && kpiScore !== null) {
    synth = Math.round(criteriaScore * 0.6 + kpiScore * 0.4);
  } else if (criteriaScore !== null) {
    synth = Math.round(criteriaScore);
  } else if (kpiScore !== null) {
    synth = Math.round(kpiScore);
  }

  // Improbidade = justa causa → teto de 30
  if (alertas?.includes("improbidade") && synth !== null) {
    synth = Math.min(synth, 30);
  }
  return synth;
}

export function classificacao(nota) {
  if (nota === null || nota === undefined) return { label: "Não avaliado", tone: "muted" };
  if (nota >= 80) return { label: "Apto", tone: "good" };
  if (nota >= 60) return { label: "Aceitável", tone: "ok" };
  if (nota >= 40) return { label: "Em risco", tone: "warn" };
  return { label: "Inapto", tone: "bad" };
}

export function esferaLabel(esfera_gov) {
  return { municipal: "Municipal", estadual: "Estadual", federal: "Federal" }[esfera_gov] || esfera_gov;
}