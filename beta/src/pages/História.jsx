import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatPeriodo } from "@/lib/format";
import PageHeader from "@/components/portal/PageHeader";
import EmptyState from "@/components/portal/EmptyState";

export default function Historia() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.HistoricalEvent.list("ordem", 200);
        setEvents(Array.isArray(list) ? list : []);
      } catch (e) {
        setEvents([]);
      }
      setLoading(false);
    })();
  }, []);

  const periodos = useMemo(() => {
    const set = [];
    for (const e of events) if (e.periodo && !set.includes(e.periodo)) set.push(e.periodo);
    return set;
  }, [events]);

  const filtered = useMemo(
    () => (periodo ? events.filter((e) => e.periodo === periodo) : events),
    [events, periodo]
  );

  const grupos = useMemo(() => {
    const g = {};
    for (const e of filtered) {
      const k = e.periodo || "Outros";
      g[k] = g[k] || [];
      g[k].push(e);
    }
    return g;
  }, [filtered]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 md:py-14">
      <PageHeader
        kicker="Acervo · História"
        title="História política do Brasil"
        description="Fichas com fatos individualizados, datas e documentos. Cada registro separa evidência documental de interpretação historiográfica e declara o seu recorte — o acervo é publicado por etapas."
      />

      {periodos.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filtrar por período">
          <button
            type="button"
            onClick={() => setPeriodo("")}
            aria-pressed={periodo === ""}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-sm border transition-colors ${periodo === "" ? "bg-accent text-accent-foreground border-accent" : "border-border hover:bg-muted"}`}
          >
            Todos os períodos
          </button>
          {periodos.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriodo(p)}
              aria-pressed={periodo === p}
              className={`text-[11px] font-semibold px-3 py-1.5 rounded-sm border transition-colors ${periodo === p ? "bg-accent text-accent-foreground border-accent" : "border-border hover:bg-muted"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">Carregando acervo…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="Acervo em preparação">
          Nenhuma ficha publicada neste recorte ainda. O acervo histórico é liberado por etapas, com fontes
          verificadas.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-12">
          {Object.entries(grupos).map(([periodoNome, list]) => (
            <section key={periodoNome} aria-labelledby={`per-${periodoNome}`}>
              <div className="flex items-baseline justify-between border-b border-border pb-3 mb-5">
                <h2 id={`per-${periodoNome}`} className="font-display text-2xl">{periodoNome}</h2>
                <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{list.length} ficha{list.length === 1 ? "" : "s"}</span>
              </div>
              <ul className="grid md:grid-cols-2 gap-4">
                {list.map((e) => (
                  <li key={e.id}>
                    <Link to={`/historia/${e.id}`} className="group bg-card hairline p-5 flex flex-col gap-2 h-full hover:border-accent transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase tracking-[0.12em] text-secondary font-bold">
                          {formatPeriodo(e.data_inicio, e.data_fim) || e.periodo}
                        </span>
                        {e.categoria && (
                          <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground border border-border px-2 py-0.5 rounded-sm">
                            {e.categoria}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-xl leading-tight">{e.titulo}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{e.resumo}</p>
                      <span className="mt-auto pt-2 text-[11px] font-semibold text-accent inline-flex items-center gap-1.5">
                        Abrir ficha <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-12 leading-relaxed border-t border-border pt-4">
        <strong>Recorte declarado:</strong> este acervo não é exaustivo. Cada ficha informa as fontes e as
        divergências conhecidas. Onde há debate historiográfico, o portal apresenta as datas e os documentos —
        não uma conclusão política.
      </p>
    </div>
  );
}