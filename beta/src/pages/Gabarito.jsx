import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Trophy } from "lucide-react";
import { useLocation } from "@/lib/useLocation";
import { loadCandidates, groupByCargo } from "@/lib/candidates";
import { fetchMediaIndex } from "@/lib/evaluations";
import { CARGOS, PLEITO_ORDER, esferaLabel } from "@/lib/audit";
import ScoreBadge from "@/components/ScoreBadge";
import AlertPill from "@/components/AlertPill";

export default function Gabarito() {
  const { location } = useLocation();
  const [candidates, setCandidates] = useState(null);
  const [media, setMedia] = useState({});

  useEffect(() => {
    if (!location) { setCandidates(null); return; }
    (async () => {
      const [cands, idx] = await Promise.all([loadCandidates(location), fetchMediaIndex()]);
      setCandidates(cands);
      setMedia(idx);
    })();
  }, [location]);

  if (!location) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-24">
        <div className="max-w-md mx-auto text-center flex flex-col items-center gap-4">
          <MapPin className="w-8 h-8 text-accent" strokeWidth={1.5} />
          <h2 className="font-display text-3xl">Configure seu pleito</h2>
          <p className="text-muted-foreground">Informe sua cidade e estado na página inicial para montar seu gabarito de votação.</p>
          <Link to="/" className="text-accent font-semibold text-sm uppercase tracking-[0.1em]">Ir para o início</Link>
        </div>
      </div>
    );
  }

  if (!candidates) {
    return <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-32 text-center text-muted-foreground">Compilando o gabarito…</div>;
  }

  const groups = groupByCargo(candidates);
  const ordered = PLEITO_ORDER.filter((c) => groups[c]?.length);

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
      <div className="grid md:grid-cols-[300px_1fr] gap-12 pb-8 border-b border-border items-baseline">
        <span className="font-display italic text-muted-foreground flex items-center gap-2"><Trophy className="w-4 h-4" /> Gabarito de Votação</span>
        <div>
          <h2 className="font-display text-4xl md:text-5xl tracking-tight">Os melhores candidatos, cargo a cargo.</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Ordenados pela média da comunidade. Alertas de improbidade e reprovação em tribunais de contas são destacados.
            <span className="block mt-1 text-xs uppercase tracking-[0.1em]">{location.cidade} · {location.estado}</span>
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-16">
        {ordered.map((cargoKey) => {
          const cargo = CARGOS[cargoKey];
          const list = (groups[cargoKey] || [])
            .map((c) => ({ c, m: media[c.id]?.media ?? null, count: media[c.id]?.count ?? 0 }))
            .sort((a, b) => (b.m ?? -1) - (a.m ?? -1));

          return (
            <section key={cargoKey}>
              <div className="flex items-baseline justify-between border-b border-border pb-4 mb-6">
                <div>
                  <h3 className="font-display text-2xl">{cargo.label}</h3>
                  <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground mt-1">{cargo.corporate} · {esferaLabel(cargo.esfera_gov)}</p>
                </div>
                <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{list.length} candidato{list.length > 1 ? "s" : ""}</span>
              </div>

              {list.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8">Nenhum candidato importado para este cargo.</p>
              ) : (
                <div className="bg-card hairline debossed">
                  {list.map(({ c, m, count }, i) => (
                    <Link
                      key={c.id}
                      to={`/candidato/${c.id}`}
                      className="grid grid-cols-[40px_1fr_auto] md:grid-cols-[60px_2fr_1.4fr_auto_auto] items-center gap-4 px-5 md:px-8 py-5 border-b border-border/60 last:border-b-0 hover:bg-muted/40 transition-colors"
                    >
                      <span className="font-display text-2xl text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      <div className="min-w-0">
                        <div className="font-display text-xl truncate">{c.nome}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span className="font-mono">{c.numero}</span><span>·</span>
                          <span className="font-semibold text-foreground">{c.partido}</span>
                          {c.mandatario && <><span>·</span><span>mandatário</span></>}
                        </div>
                      </div>
                      <div className="hidden md:block text-xs text-muted-foreground leading-snug">{c.bio}</div>
                      <div className="hidden md:flex flex-col items-end gap-1.5">
                        {c.alertas?.length > 0 && <AlertPill alerta={c.alertas[0]} />}
                        {count > 0 && <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{count} aval.</span>}
                      </div>
                      <div className="flex items-center gap-3 justify-self-end">
                        <ScoreBadge nota={m} />
                        <ArrowRight className="w-4 h-4 text-foreground/40" strokeWidth={1.5} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}