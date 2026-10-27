import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CARGOS } from "@/lib/audit";
import Provenance from "@/components/portal/Provenance";
import EmptyState from "@/components/portal/EmptyState";
import ReportIssueButton from "@/components/portal/ReportIssueButton";
import PoliticianPhoto from "@/components/PoliticianPhoto";

export default function PartidoPerfil() {
  const { sigla } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState(null);
  const [politicians, setPoliticians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const found = await base44.entities.Party.filter({ sigla: decodeURIComponent(sigla) });
        const p = (found || [])[0] || null;
        setParty(p);
        if (p) {
          const names = [p.sigla, p.nome].filter(Boolean);
          const page = await base44.entities.Candidate.filter(
            { partido: { $in: names } },
            { sort: "nome", limit: 60 }
          );
          setPoliticians(page?.items || []);
        }
      } catch (e) {
        setParty(null);
      }
      setLoading(false);
    })();
  }, [sigla]);

  if (loading) return <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-24 text-center text-sm text-muted-foreground">Carregando partido…</div>;

  if (!party) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20">
        <EmptyState title="Partido não encontrado">
          Não há registro com esta sigla no acervo atual.
        </EmptyState>
        <div className="flex justify-center mt-6">
          <Link to="/partidos" className="text-sm font-semibold text-accent">Ver todos os partidos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 md:py-14">
      <button onClick={() => navigate(-1)} className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Voltar
      </button>

      <header className="grid md:grid-cols-[1.5fr_0.5fr] gap-8 pb-8 border-b border-border">
        <div>
          <span className="text-[11px] uppercase tracking-[0.14em] text-accent font-bold">Organização partidária</span>
          <h1 className="font-display text-[clamp(30px,4vw,50px)] leading-none tracking-tight mt-2">{party.sigla}</h1>
          <p className="text-lg text-muted-foreground mt-2">{party.nome}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
            {party.numero_eleitoral && <span>Número eleitoral: <strong className="text-foreground">{party.numero_eleitoral}</strong></span>}
            {party.fundacao && <span>Fundação/registro: <strong className="text-foreground">{party.fundacao}</strong></span>}
          </div>
        </div>
        <div className="md:items-end flex flex-col gap-2">
          <ReportIssueButton registroTipo="partido" registroId={party.id} registroTitulo={party.nome} referenciaInicial={party.registro_tse_url || ""} />
        </div>
      </header>

      <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-10 mt-10">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="sobre-titulo">
            <h2 id="sobre-titulo" className="font-display text-2xl mb-3">Registro</h2>
            <dl className="bg-card hairline">
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 px-5 py-3 border-b border-border/60">
                <dt className="text-[11px] uppercase tracking-[0.1em] font-bold text-muted-foreground">Sigla</dt>
                <dd className="text-sm">{party.sigla}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 px-5 py-3 border-b border-border/60">
                <dt className="text-[11px] uppercase tracking-[0.1em] font-bold text-muted-foreground">Denominação</dt>
                <dd className="text-sm">{party.nome}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 px-5 py-3 border-b border-border/60">
                <dt className="text-[11px] uppercase tracking-[0.1em] font-bold text-muted-foreground">Número eleitoral</dt>
                <dd className="text-sm">{party.numero_eleitoral || <span className="italic text-muted-foreground">Não consta no registro consultado</span>}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 px-5 py-3">
                <dt className="text-[11px] uppercase tracking-[0.1em] font-bold text-muted-foreground">Declaração programática</dt>
                <dd className="text-sm">{party.espectro_declarado || <span className="italic text-muted-foreground">Não consta no registro consultado</span>}</dd>
              </div>
            </dl>
            <Provenance fonte={party.fontes?.[0]?.label || "TSE"} url={party.registro_tse_url || party.fontes?.[0]?.url} data={party.data_consulta} />
          </section>

          <section aria-labelledby="politicos-titulo">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <h2 id="politicos-titulo" className="font-display text-2xl">Políticos vinculados</h2>
              <span className="text-xs text-muted-foreground">{politicians.length} no recorte atual</span>
            </div>
            {politicians.length === 0 ? (
              <div className="bg-card hairline p-6 flex items-start gap-3">
                <Users className="w-5 h-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Nenhum político deste partido foi importado para o recorte atual. Importe candidaturas na
                  seção <Link to="/politicos" className="text-accent font-semibold">Políticos</Link> para
                  vincular registros.
                </p>
              </div>
            ) : (
              <ul className="grid sm:grid-cols-2 gap-3">
                {politicians.map((c) => (
                  <li key={c.id}>
                    <Link to={`/politicos/${c.id}`} className="bg-card hairline p-4 flex gap-3 hover:border-accent transition-colors">
                      <PoliticianPhoto candidate={c} size="sm" />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm leading-tight">{c.nome}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {CARGOS[c.cargo]?.label || c.cargo}{c.estado ? ` · ${c.estado}` : ""}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="bg-card hairline p-5">
            <h2 className="font-display text-lg mb-3">Fontes</h2>
            <ul className="flex flex-col gap-2">
              {party.registro_tse_url && (
                <li>
                  <a href={party.registro_tse_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 text-xs font-semibold border border-border px-3 py-2.5 rounded-sm hover:bg-muted">
                    Registro no TSE <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                  </a>
                </li>
              )}
              {party.site_oficial && (
                <li>
                  <a href={party.site_oficial} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 text-xs font-semibold border border-border px-3 py-2.5 rounded-sm hover:bg-muted">
                    Site oficial <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                  </a>
                </li>
              )}
              {party.fontes?.map((f) => (
                <li key={f.url}>
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 text-xs font-semibold border border-border px-3 py-2.5 rounded-sm hover:bg-muted">
                    {f.label} <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
          {party.cobertura && (
            <section className="bg-muted/40 border border-border p-5">
              <h2 className="font-display text-lg mb-2">Cobertura</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">{party.cobertura}</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}