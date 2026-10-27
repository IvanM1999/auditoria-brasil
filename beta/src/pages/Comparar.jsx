import { useEffect, useState, useMemo } from "react";
import { MapPin, X, Plus, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocation } from "@/lib/useLocation";
import { loadCandidates } from "@/lib/candidates";
import { fetchMediaIndex } from "@/lib/evaluations";
import { CARGOS, CRITERIOS, KPIS, CHECKLIST_LEGISLATIVO, esferaLabel, classificacao } from "@/lib/audit";
import ScoreBadge from "@/components/ScoreBadge";
import AlertPill from "@/components/AlertPill";

export default function Comparar() {
  const { location } = useLocation();
  const [candidates, setCandidates] = useState(null);
  const [media, setMedia] = useState({});
  const [selected, setSelected] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!location) { setCandidates(null); return; }
    (async () => {
      const [cands, idx] = await Promise.all([loadCandidates(location), fetchMediaIndex()]);
      setCandidates(cands);
      setMedia(idx);
    })();
  }, [location]);

  const selectedCands = useMemo(
    () => selected.map((id) => candidates?.find((c) => c.id === id)).filter(Boolean),
    [selected, candidates]
  );

  function toggle(id) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  }

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

  if (!candidates) return <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-32 text-center text-muted-foreground">Carregando…</div>;

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
      <div className="grid md:grid-cols-[300px_1fr] gap-12 pb-8 border-b border-border items-baseline">
        <span className="font-display italic text-muted-foreground">Comparação lado a lado</span>
        <div>
          <h2 className="font-display text-4xl md:text-5xl tracking-tight">Decida com evidência.</h2>
          <p className="text-muted-foreground mt-3">Selecione até 3 candidatos para comparar critério por critério. {location.cidade} · {location.estado}</p>
        </div>
      </div>

      {/* selector chips */}
      <div className="flex flex-wrap items-center gap-3 mt-8">
        {selectedCands.map((c) => (
          <div key={c.id} className="flex items-center gap-2 border border-accent/40 bg-accent/5 px-3 py-2">
            <span className="font-display text-sm">{c.nome}</span>
            <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{CARGOS[c.cargo].short}</span>
            <button onClick={() => toggle(c.id)}><X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" strokeWidth={1.8} /></button>
          </div>
        ))}
        {selected.length < 3 && (
          <button onClick={() => setPickerOpen((v) => !v)} className="flex items-center gap-2 border border-dashed border-border px-4 py-2 text-[11px] uppercase tracking-[0.1em] font-semibold text-muted-foreground hover:text-foreground hover:border-accent">
            <Plus className="w-3.5 h-3.5" strokeWidth={1.8} /> Adicionar candidato
          </button>
        )}
      </div>

      {pickerOpen && (
        <div className="mt-4 bg-card hairline debossed p-5 max-h-80 overflow-auto">
          <div className="flex flex-col gap-1">
            {candidates.map((c) => (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                disabled={selected.length >= 3 && !selected.includes(c.id)}
                className="flex items-center justify-between gap-4 px-3 py-2.5 text-left hover:bg-muted disabled:opacity-40"
              >
                <div>
                  <div className="font-display text-base">{c.nome}</div>
                  <div className="text-xs text-muted-foreground">{CARGOS[c.cargo].label} · {c.partido}</div>
                </div>
                {selected.includes(c.id) && <Check className="w-4 h-4 text-accent" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* comparison table */}
      {selectedCands.length > 0 ? (
        <div className="mt-10 bg-card hairline debossed overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold p-5 w-48">Critério</th>
                {selectedCands.map((c) => (
                  <th key={c.id} className="text-left p-5 align-bottom">
                    <Link to={`/candidato/${c.id}`} className="font-display text-xl hover:text-accent block">{c.nome}</Link>
                    <div className="text-xs text-muted-foreground mt-1">{CARGOS[c.cargo].short} · {c.partido}</div>
                    <div className="mt-2"><ScoreBadge nota={media[c.id]?.media ?? null} size="sm" /></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* nota sintética */}
              <tr className="border-b border-border/60 bg-muted/30">
                <td className="p-5 font-display text-base">Nota sintética</td>
                {selectedCands.map((c) => (
                  <td key={c.id} className="p-5 font-display text-3xl text-accent">{media[c.id]?.media != null ? Math.round(media[c.id].media) : "—"}</td>
                ))}
              </tr>
              {/* critérios */}
              {CRITERIOS.map((cr) => (
                <tr key={cr.key} className="border-b border-border/60">
                  <td className="p-5 text-sm font-semibold">{cr.label}</td>
                  {selectedCands.map((c) => {
                    const v = media[c.id]?.porCriterio?.[cr.key];
                    return <td key={c.id} className="p-5 font-display text-xl">{v != null ? v.toFixed(1) : "—"}<span className="text-sm text-muted-foreground">/10</span></td>;
                  })}
                </tr>
              ))}
              {/* alertas */}
              <tr className="border-b border-border/60">
                <td className="p-5 text-sm font-semibold">Alertas</td>
                {selectedCands.map((c) => (
                  <td key={c.id} className="p-5">
                    <div className="flex flex-col gap-1.5">
                      {(c.alertas || []).map((a) => <AlertPill key={a} alerta={a} />)}
                      {(!c.alertas || c.alertas.length === 0) && <span className="text-xs text-muted-foreground">Nenhum</span>}
                    </div>
                  </td>
                ))}
              </tr>
              {/* mandato */}
              <tr>
                <td className="p-5 text-sm font-semibold">Mandatário</td>
                {selectedCands.map((c) => (
                  <td key={c.id} className="p-5 text-sm text-muted-foreground">{c.mandatario ? "Sim" : "Não"}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted-foreground py-16 text-center">Adicione candidatos para iniciar a comparação.</p>
      )}
    </div>
  );
}