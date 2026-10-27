import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, MapPin, RefreshCw, Award, Info, ArrowRight, Sparkles } from "lucide-react";
import { useLocation } from "@/lib/useLocation";
import { loadCandidates, groupByCargo } from "@/lib/candidates";
import { fetchMediaIndex } from "@/lib/evaluations";
import { PLEITO_ORDER, CARGOS, classificacao, esferaLabel } from "@/lib/audit";
import { generateVotingDossierPDF } from "@/lib/pdf";
import { base44 } from "@/api/base44Client";
import ScoreBadge from "@/components/ScoreBadge";
import AlertPill from "@/components/AlertPill";

export default function DossiêVoto() {
  const { location } = useLocation();
  const [candidates, setCandidates] = useState([]);
  const [media, setMedia] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  async function load() {
    if (!location) { setLoading(false); return; }
    setLoading(true);
    const [cands, med] = await Promise.all([loadCandidates(location), fetchMediaIndex()]);
    setCandidates(cands);
    setMedia(med);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [location?.estado, location?.cidade]);

  async function reextract() {
    if (!location) return;
    setSyncing(true);
    try {
      await base44.functions.invoke("fetchTSECandidates", {
        estado: location.estado,
        cidade: location.cidade,
        refresh: true,
      });
    } catch (e) {}
    setSyncing(false);
    load();
  }

  if (!location) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <MapPin className="w-8 h-8 text-accent mx-auto mb-4" strokeWidth={1.5} />
        <h1 className="font-display text-3xl mb-3">Configure seu pleito</h1>
        <p className="text-muted-foreground mb-6">
          Informe sua cidade e estado na página inicial para compilarmos seu dossiê de voto com os candidatos reais do seu pleito.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 bg-accent text-primary-foreground px-6 py-3 text-sm font-semibold">
          Ir para o início <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <div className="w-8 h-8 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Compilando seu dossiê de voto…</p>
      </div>
    );
  }

  const groups = groupByCargo(candidates);
  const selections = PLEITO_ORDER.filter((c) => groups[c]?.length).map((cargo) => {
    const list = (groups[cargo] || []).slice().sort(
      (a, b) => (media[b.id]?.media ?? -1) - (media[a.id]?.media ?? -1)
    );
    const top = list[0];
    return { cargo, candidate: top, media: media[top.id] };
  });

  return (
    <div>
      {/* header */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-14 md:py-20">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-primary-foreground/70 mb-4">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} /> Geração automática
          </div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-4">Meu Dossiê de Voto</h1>
          <p className="text-primary-foreground/80 max-w-2xl leading-relaxed">
            Compilação automática dos melhores candidatos por cargo para {location.cidade} · {location.estado},
            ordenados pela média das avaliações da comunidade. Um roteiro de votação consciente nas Eleições Gerais 2026.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <button
              onClick={() => selections.length && generateVotingDossierPDF(location, selections)}
              disabled={!selections.length}
              className="inline-flex items-center gap-2 bg-highlight text-primary px-6 py-3 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Download className="w-4 h-4" strokeWidth={2} /> Baixar Dossiê de Voto (PDF)
            </button>
            <button
              onClick={reextract}
              disabled={syncing}
              className="inline-flex items-center gap-2 border border-primary-foreground/30 text-primary-foreground px-5 py-3 text-sm font-semibold hover:bg-primary-foreground/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} strokeWidth={1.8} />
              {syncing ? "Reextraindo…" : "Reextrair candidatos com IA"}
            </button>
          </div>
        </div>
      </section>

      {/* selections */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
        {selections.length === 0 ? (
          <div className="text-center py-20">
            <Info className="w-8 h-8 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="font-display text-2xl mb-2">Ainda não há candidatos carregados</h2>
            <p className="text-muted-foreground mb-6">
              Use "Reextrair candidatos com IA" para buscar as candidaturas oficiais do seu estado nas fontes do TSE.
            </p>
            <button onClick={reextract} disabled={syncing} className="inline-flex items-center gap-2 bg-accent text-primary-foreground px-6 py-3 text-sm font-semibold">
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} strokeWidth={1.8} /> {syncing ? "Buscando…" : "Buscar candidatos agora"}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {selections.map((s) => {
              const cargo = CARGOS[s.cargo];
              return (
                <div key={s.cargo} className="bg-card hairline p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.14em] text-accent font-bold">{cargo?.label}</div>
                      <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{esferaLabel(cargo?.esfera_gov)} · {cargo?.corporate}</div>
                    </div>
                    <Award className="w-5 h-5 text-accent" strokeWidth={1.5} />
                  </div>
                  <Link to={`/candidato/${s.candidate.id}`} className="flex items-start justify-between gap-4 group">
                    <div className="min-w-0">
                      <h3 className="font-display text-xl leading-tight group-hover:text-accent transition-colors">{s.candidate.nome}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {s.candidate.partido || "—"} · {s.candidate.numero || "—"}
                        {s.candidate.mandatario ? " · mandatário" : ""}
                      </p>
                    </div>
                    <ScoreBadge score={s.media?.media ?? null} size="md" />
                  </Link>
                  {s.candidate.alertas?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {s.candidate.alertas.slice(0, 2).map((a) => <AlertPill key={a} alert={a} />)}
                    </div>
                  )}
                  {s.candidate.bio && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{s.candidate.bio}</p>}
                  {s.candidate.fonte_url && (
                    <a href={s.candidate.fonte_url} target="_blank" rel="noreferrer" className="text-xs text-secondary underline underline-offset-2 truncate">
                      Fonte oficial: {s.candidate.fonte_url}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* disclaimer */}
        <div className="mt-12 border border-border bg-muted/40 p-6 flex gap-3">
          <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ferramenta de auxílio e conscientização de voto. Os dados de candidaturas são extraídos das fontes oficiais
            do TSE (Dados Abertos e DivulgaCandContas) por uma camada de IA pública. As notas são médias das avaliações
            da comunidade e não constituem recomendação partidária. Sempre confira as fontes oficiais antes de votar.
          </p>
        </div>
      </section>
    </div>
  );
}