import { useEffect, useState, useMemo } from "react";
import { Search, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocation } from "@/lib/useLocation";
import { loadCandidates } from "@/lib/candidates";
import { fetchMediaIndex } from "@/lib/evaluations";
import { CARGOS, PLEITO_ORDER, esferaLabel } from "@/lib/audit";
import CandidateCard from "@/components/CandidateCard";

export default function Candidatos() {
  const { location } = useLocation();
  const [candidates, setCandidates] = useState(null);
  const [media, setMedia] = useState({});
  const [cargoFilter, setCargoFilter] = useState("todos");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!location) { setCandidates(null); return; }
    (async () => {
      const [cands, idx] = await Promise.all([loadCandidates(location), fetchMediaIndex()]);
      setCandidates(cands);
      setMedia(idx);
    })();
  }, [location]);

  const cargosPresentes = useMemo(() => {
    if (!candidates) return [];
    const set = new Set(candidates.map((c) => c.cargo));
    return PLEITO_ORDER.filter((c) => set.has(c));
  }, [candidates]);

  const filtered = useMemo(() => {
    if (!candidates) return [];
    return candidates
      .filter((c) => cargoFilter === "todos" || c.cargo === cargoFilter)
      .filter((c) => !query || c.nome.toLowerCase().includes(query.toLowerCase()) || c.partido.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (media[b.id]?.media ?? -1) - (media[a.id]?.media ?? -1));
  }, [candidates, cargoFilter, query, media]);

  if (!location) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-24">
        <div className="max-w-md mx-auto text-center flex flex-col items-center gap-4">
          <MapPin className="w-8 h-8 text-accent" strokeWidth={1.5} />
          <h2 className="font-display text-3xl">Configure seu pleito</h2>
          <p className="text-muted-foreground">Informe sua cidade e estado na página inicial.</p>
          <Link to="/" className="text-accent font-semibold text-sm uppercase tracking-[0.1em]">Ir para o início</Link>
        </div>
      </div>
    );
  }

  if (!candidates) return <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-32 text-center text-muted-foreground">Carregando candidatos…</div>;

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
      <div className="grid md:grid-cols-[300px_1fr] gap-12 pb-8 border-b border-border items-baseline">
        <span className="font-display italic text-muted-foreground">Candidatos do pleito</span>
        <div>
          <h2 className="font-display text-4xl md:text-5xl tracking-tight">Inspecione cada ficha.</h2>
          <p className="text-muted-foreground mt-3">{location.cidade} · {location.estado}</p>
        </div>
      </div>

      {/* controles */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mt-8 mb-10">
        <div className="flex items-center gap-2 border-b border-border flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou partido…"
            className="bg-transparent py-2.5 w-full focus:outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCargoFilter("todos")}
            className={`text-[10px] uppercase tracking-[0.12em] font-semibold px-3 py-2 border transition-colors ${cargoFilter === "todos" ? "border-accent text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}
          >Todos</button>
          {cargosPresentes.map((ck) => (
            <button
              key={ck}
              onClick={() => setCargoFilter(ck)}
              className={`text-[10px] uppercase tracking-[0.12em] font-semibold px-3 py-2 border transition-colors ${cargoFilter === ck ? "border-accent text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}
            >{CARGOS[ck].short}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">Nenhum candidato encontrado para este filtro.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <CandidateCard key={c.id} candidate={c} media={media[c.id]?.media ?? null} avaliacoesCount={media[c.id]?.count ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}