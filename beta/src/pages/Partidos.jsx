import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Building2, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/portal/PageHeader";
import EmptyState from "@/components/portal/EmptyState";

export default function Partidos() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Party.list("ordem", 200);
        setParties(Array.isArray(list) ? list : []);
      } catch (e) {
        setParties([]);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const t = busca.trim().toLowerCase();
    if (!t) return parties;
    return parties.filter((p) =>
      `${p.sigla} ${p.nome} ${p.numero_eleitoral || ""}`.toLowerCase().includes(t)
    );
  }, [parties, busca]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 md:py-14">
      <PageHeader
        kicker="Acervo · Organizações"
        title="Partidos políticos"
        description="Identificação e registro eleitoral dos partidos, com link para a fonte oficial e para os políticos vinculados. O portal não classifica partidos por ideologia própria — apenas reproduz declarações publicadas e documentos de registro."
      />

      <div className="relative max-w-md mb-8">
        <label htmlFor="busca-partido" className="sr-only">Buscar partido</label>
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          id="busca-partido"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por sigla ou nome"
          className="w-full bg-card border border-border pl-9 pr-3 py-2.5 text-sm rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">Carregando partidos…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Building2} title="Nenhum partido encontrado">
          Ajuste a busca. O registro é ampliado por etapas a partir das fontes oficiais.
        </EmptyState>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <li key={p.id} className="bg-card hairline p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-2xl leading-none">{p.sigla}</div>
                  <div className="text-xs text-muted-foreground mt-1">{p.nome}</div>
                </div>
                {p.numero_eleitoral && (
                  <span className="font-mono text-sm text-muted-foreground border border-border px-2 py-1 rounded-sm">
                    {p.numero_eleitoral}
                  </span>
                )}
              </div>
              {p.espectro_declarado && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  Declaração programática: {p.espectro_declarado}
                </p>
              )}
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                <Link to={`/partidos/${encodeURIComponent(p.sigla)}`} className="text-[11px] font-bold text-accent border border-accent/40 px-3 py-1.5 rounded-sm hover:bg-accent/5">
                  Ver políticos vinculados
                </Link>
                {p.registro_tse_url && (
                  <a href={p.registro_tse_url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
                    Registro TSE <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground mt-10 leading-relaxed border-t border-border pt-4">
        <strong>Cobertura:</strong> identificação partidária com base no registro do TSE. A listagem de
        políticos vinculados depende dos registros de candidatura já importados para cada estado.
      </p>
    </div>
  );
}