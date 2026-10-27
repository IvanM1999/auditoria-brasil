import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, ShieldCheck, RefreshCw, AlertTriangle, FileWarning, MinusCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CARGOS, PORTAIS, portaisParaCargo, esferaLabel } from "@/lib/audit";
import { formatDateTime } from "@/lib/format";
import PoliticianPhoto from "@/components/PoliticianPhoto";
import Provenance from "@/components/portal/Provenance";
import ReportIssueButton from "@/components/portal/ReportIssueButton";
import EmptyState from "@/components/portal/EmptyState";

function StatusBadge({ status }) {
  const map = {
    validado: { label: "Validado", cls: "border-accent/40 text-accent", icon: ShieldCheck },
    atencao: { label: "Atenção", cls: "border-chart-5/50 text-foreground", icon: AlertTriangle },
    falha: { label: "Falha de fonte", cls: "border-destructive/40 text-destructive", icon: AlertTriangle },
    nao_verificado: { label: "Não verificado", cls: "border-border text-muted-foreground", icon: MinusCircle },
  };
  const m = map[status] || map.nao_verificado;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] font-semibold rounded-sm ${m.cls}`}>
      <Icon className="w-3 h-3" aria-hidden="true" strokeWidth={2} /> {m.label}
    </span>
  );
}

function FieldRow({ label, value }) {
  const ausente = !value;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-1 sm:gap-4 px-5 py-3 border-b border-border/60 last:border-b-0">
      <dt className="text-[11px] uppercase tracking-[0.1em] font-bold text-muted-foreground">{label}</dt>
      <dd className={`text-sm ${ausente ? "text-muted-foreground italic" : "text-foreground"}`}>
        {ausente ? "Não consta no registro consultado" : value}
      </dd>
    </div>
  );
}

export default function PoliticoPerfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const c = await base44.entities.Candidate.get(id);
        setCandidate(c);
        setNotFound(false);
      } catch (e) {
        setCandidate(null);
        setNotFound(true);
      }
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    const meta = document.createElement("meta");
    if (notFound) {
      meta.name = "prerender-status-code";
      meta.content = "404";
      document.head.appendChild(meta);
    }
    return () => { if (meta.parentNode) meta.parentNode.removeChild(meta); };
  }, [notFound]);

  async function verifySources() {
    setChecking(true);
    setCheckError("");
    try {
      const res = await base44.functions.invoke("verifyCandidateSources", { candidate_id: candidate.id });
      const data = res?.data || res;
      if (!data?.ok) throw new Error(data?.error || "Não foi possível verificar agora");
      const updated = await base44.entities.Candidate.get(id);
      setCandidate(updated);
    } catch (err) {
      setCheckError(err?.response?.data?.error || err.message || "Falha ao verificar as fontes");
    }
    setChecking(false);
  }

  if (loading) return <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-24 text-center text-sm text-muted-foreground">Carregando registro oficial…</div>;

  if (!candidate) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20">
        <EmptyState title="Registro não encontrado">
          Este perfil não existe ou foi removido. A ausência de registro não equivale a ausência de fato —
          consulte as fontes oficiais.
        </EmptyState>
        <div className="flex justify-center mt-6">
          <Link to="/politicos" className="text-sm font-semibold text-accent">Voltar para políticos</Link>
        </div>
      </div>
    );
  }

  const cargo = CARGOS[candidate.cargo] || { label: candidate.cargo, corporate: candidate.cargo };
  const portals = portaisParaCargo(candidate.cargo).map((k) => PORTAIS[k]).filter(Boolean);
  const validacao = candidate.validacao || { status: "nao_verificado" };

  const ausentes = [
    !candidate.foto_url && "foto oficial",
    !candidate.numero && "número de urna",
    !candidate.partido && "partido",
    !candidate.situacao_oficial && "situação da candidatura na fonte",
    !candidate.id_origem && "identificador de origem",
  ].filter(Boolean);

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 md:py-14">
      <button onClick={() => navigate(-1)} className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Voltar
      </button>

      {/* Cabeçalho */}
      <header className="grid md:grid-cols-[1.5fr_0.5fr] gap-8 pb-8 border-b border-border">
        <div className="flex gap-6 items-start">
          <PoliticianPhoto candidate={candidate} size="lg" />
          <div className="min-w-0">
            <span className="text-[11px] uppercase tracking-[0.14em] text-accent font-bold">{cargo.corporate}</span>
            <h1 className="font-display text-[clamp(26px,3.4vw,42px)] leading-[1.08] tracking-tight mt-1.5">{candidate.nome}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-sm text-muted-foreground">
              {candidate.numero && <span className="font-mono">{candidate.numero}</span>}
              {candidate.partido && <><span>·</span><span className="font-semibold text-foreground">{candidate.partido}</span></>}
              <span>·</span><span>{cargo.label}</span>
              <span>·</span><span>{esferaLabel(candidate.esfera_gov)}</span>
              {candidate.estado && <><span>·</span><span>{candidate.estado}</span></>}
              {candidate.pleito && <><span>·</span><span>pleito {candidate.pleito}</span></>}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <StatusBadge status={validacao.status} />
              {candidate.situacao_oficial && (
                <span className="text-[10px] uppercase tracking-[0.1em] font-semibold border border-border px-2 py-1 rounded-sm text-muted-foreground">
                  Fonte: {candidate.situacao_oficial}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <ReportIssueButton
            registroTipo="politico"
            registroId={candidate.id}
            registroTitulo={candidate.nome}
            referenciaInicial={candidate.fonte_url || ""}
          />
        </div>
      </header>

      <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-10 mt-10">
        <div className="flex flex-col gap-10">
          {/* Identificação */}
          <section aria-labelledby="ident-titulo">
            <h2 id="ident-titulo" className="font-display text-2xl mb-3">Identificação no registro oficial</h2>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Somente dados cadastrais publicados pela fonte. Este portal não gera texto, avaliação ou
              conclusão sobre pessoas.
            </p>
            <dl className="bg-card hairline">
              <FieldRow label="Nome completo" value={candidate.nome} />
              <FieldRow label="Número de urna" value={candidate.numero} />
              <FieldRow label="Partido" value={candidate.partido} />
              <FieldRow label="Cargo" value={cargo.label} />
              <FieldRow label="Esfera" value={esferaLabel(candidate.esfera_gov)} />
              {candidate.cidade && <FieldRow label="Município" value={candidate.cidade} />}
              {candidate.estado && <FieldRow label="Estado (UF)" value={candidate.estado} />}
              <FieldRow label="Pleito" value={candidate.pleito} />
              <FieldRow label="Situação na fonte" value={candidate.situacao_oficial} />
              <FieldRow label="Identificador de origem" value={candidate.id_origem} />
              <FieldRow label="Método de obtenção" value={candidate.metodo} />
            </dl>
            <Provenance
              fonte={candidate.fonte_nome}
              url={candidate.fonte_url}
              data={candidate.data_consulta || candidate.updated_date}
              metodo={candidate.metodo}
            />
          </section>

          {/* Validação */}
          <section aria-labelledby="valid-titulo">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h2 id="valid-titulo" className="font-display text-2xl">Validação das fontes</h2>
              <button
                type="button"
                onClick={verifySources}
                disabled={checking}
                className="inline-flex items-center gap-2 border border-border px-3 py-2 text-[11px] font-semibold rounded-sm hover:bg-muted disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} aria-hidden="true" />
                {checking ? "Verificando…" : "Verificar fontes agora"}
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              A verificação consulta as fontes oficiais e registra a disponibilidade real de cada uma. Ela não
              altera dados cadastrais.
            </p>

            {validacao.verificado_em && (
              <p className="text-[11px] text-muted-foreground mb-3">
                Última verificação: {formatDateTime(validacao.verificado_em)}
              </p>
            )}

            {checkError && (
              <div className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-xs text-destructive mb-3 rounded-sm" role="alert">
                {checkError}
              </div>
            )}

            {validacao.detalhes?.length ? (
              <ul className="bg-card hairline divide-y divide-border">
                {validacao.detalhes.map((d) => (
                  <li key={d.url} className="flex items-center justify-between gap-3 px-4 py-3">
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-xs text-secondary hover:underline truncate">
                      {d.url}
                    </a>
                    <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap ${d.ok ? "text-accent" : "text-destructive"}`}>
                      {d.ok ? `OK · ${d.status}` : d.status ? `HTTP ${d.status}` : "sem resposta"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-muted/40 border border-border px-4 py-3 text-xs text-muted-foreground rounded-sm">
                Nenhuma verificação registrada ainda. Use o botão acima para consultar as fontes oficiais.
                {validacao.erros?.length ? ` Erros anteriores: ${validacao.erros.join("; ")}` : ""}
              </div>
            )}
          </section>

          {/* Ausências */}
          {ausentes.length > 0 && (
            <section aria-labelledby="ausencias-titulo">
              <h2 id="ausencias-titulo" className="font-display text-2xl mb-3">Ausências declaradas</h2>
              <div className="border border-chart-5/40 bg-chart-5/5 px-5 py-4 rounded-sm">
                <p className="text-sm leading-relaxed flex items-start gap-2">
                  <FileWarning className="w-4 h-4 text-chart-5 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    Não há dado confirmado para: <strong>{ausentes.join(", ")}</strong>. Esses campos não são
                    preenchidos por estimativa. A ausência de registro público não equivale a ausência de fato.
                  </span>
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Coluna lateral: onde verificar */}
        <aside className="flex flex-col gap-6">
          <section className="bg-card hairline p-5">
            <h2 className="font-display text-lg mb-1">Onde verificar</h2>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Fontes oficiais recomendadas para este cargo. O portal não substitui o documento original.
            </p>
            <ul className="flex flex-col gap-2">
              {portals.map((p) => (
                <li key={p.url}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 text-xs font-semibold border border-border px-3 py-2.5 rounded-sm hover:bg-muted">
                    <span>{p.label}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-muted/40 border border-border p-5">
            <h2 className="font-display text-lg mb-2">Regras deste perfil</h2>
            <ul className="text-xs text-muted-foreground leading-relaxed space-y-2 list-disc pl-4">
              <li>Nenhum texto gerado por inteligência artificial.</li>
              <li>Nenhuma acusação: apenas o que consta em fonte oficial.</li>
              <li>Falhas e ausências são exibidas, nunca ocultadas.</li>
              <li>Correções passam por conferência na fonte original.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}