import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, FileText, GitCompare, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatPeriodo } from "@/lib/format";
import EmptyState from "@/components/portal/EmptyState";
import ReportIssueButton from "@/components/portal/ReportIssueButton";

export default function HistoriaFicha() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const e = await base44.entities.HistoricalEvent.get(id);
        setEvent(e);
        setNotFound(false);
      } catch (err) {
        setEvent(null);
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

  if (loading) return <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-24 text-center text-sm text-muted-foreground">Carregando ficha…</div>;

  if (!event) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20">
        <EmptyState title="Ficha não encontrada">Este registro não existe ou foi removido do acervo.</EmptyState>
        <div className="flex justify-center mt-6">
          <Link to="/historia" className="text-sm font-semibold text-accent">Voltar ao acervo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 md:px-12 py-10 md:py-14">
      <button onClick={() => navigate(-1)} className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Voltar
      </button>

      <header className="border-b border-border pb-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] uppercase tracking-[0.12em]">
          <span className="text-accent font-bold">{event.periodo}</span>
          <span className="text-muted-foreground">{formatPeriodo(event.data_inicio, event.data_fim)}</span>
          {event.categoria && (
            <span className="text-muted-foreground border border-border px-2 py-0.5 rounded-sm">{event.categoria}</span>
          )}
        </div>
        <h1 className="font-display text-[clamp(28px,4vw,44px)] leading-[1.08] tracking-tight mt-3">{event.titulo}</h1>
        <div className="mt-5">
          <ReportIssueButton registroTipo="historia" registroId={event.id} registroTitulo={event.titulo} />
        </div>
      </header>

      <section className="mt-8" aria-labelledby="fato-titulo">
        <h2 id="fato-titulo" className="font-display text-2xl mb-3">Registro factual</h2>
        <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-line">{event.resumo}</p>
      </section>

      {event.evidencias?.length > 0 && (
        <section className="mt-10" aria-labelledby="evid-titulo">
          <h2 id="evid-titulo" className="font-display text-2xl mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" aria-hidden="true" strokeWidth={1.8} /> Documentos e evidências
          </h2>
          <ul className="bg-card hairline divide-y divide-border">
            {event.evidencias.map((ev) => (
              <li key={ev.url || ev.titulo} className="px-5 py-4">
                <a href={ev.url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-3 group">
                  <span>
                    <span className="block text-sm font-semibold group-hover:text-accent">{ev.titulo}</span>
                    {ev.instituicao && <span className="block text-xs text-muted-foreground mt-0.5">{ev.instituicao}</span>}
                  </span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {event.divergencias?.length > 0 && (
        <section className="mt-10" aria-labelledby="div-titulo">
          <h2 id="div-titulo" className="font-display text-2xl mb-3 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-chart-5" aria-hidden="true" strokeWidth={1.8} /> Divergências e interpretações
          </h2>
          <div className="border border-chart-5/40 bg-chart-5/5 p-5 rounded-sm">
            <ul className="space-y-4">
              {event.divergencias.map((d) => (
                <li key={d.tema}>
                  <div className="text-sm font-semibold">{d.tema}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">{d.descricao}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {event.cobertura && (
        <section className="mt-10" aria-labelledby="cob-titulo">
          <h2 id="cob-titulo" className="font-display text-2xl mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-muted-foreground" aria-hidden="true" strokeWidth={1.8} /> Cobertura desta ficha
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{event.cobertura}</p>
        </section>
      )}

      <div className="mt-12 border-t border-border pt-5 text-xs text-muted-foreground leading-relaxed">
        Este registro separa <strong>evidência documental</strong> de <strong>interpretação</strong>. Quando há
        debate entre historiadores, o portal informa a divergência e não apresenta uma conclusão como fato
        estabelecido.
      </div>
    </div>
  );
}