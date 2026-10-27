import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CARGOS, CRITERIOS, KPIS, CHECKLIST_LEGISLATIVO, PORTAIS, portaisParaCargo, esferaLabel, notaSintetica, classificacao } from "@/lib/audit";

const STEPS = ["Critérios", "Indicadores", "Revisão"];

export default function Avaliacao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [step, setStep] = useState(0);
  const [notas, setNotas] = useState({});
  const [kpis, setKpis] = useState({});
  const [checklist, setChecklist] = useState({});
  const [alertas, setAlertas] = useState([]);
  const [comentario, setComentario] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const c = await base44.entities.Candidate.get(id);
        setCandidate(c);
        // pré-marca alertas do próprio candidato
        setAlertas(c.alertas || []);
      } catch (e) { setCandidate(null); }
    })();
  }, [id]);

  if (!candidate) return <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-32 text-center text-muted-foreground">Carregando…</div>;

  const cargo = CARGOS[candidate.cargo];
  const isLegislativo = candidate.tipo === "legislativo";
  const kpiDefs = KPIS[candidate.esfera_gov] || [];
  const checklistDefs = CHECKLIST_LEGISLATIVO;
  const portals = portaisParaCargo(candidate.cargo).map((k) => PORTAIS[k]).filter(Boolean);

  const synth = notaSintetica({ notas, kpis, checklist, esfera_gov: candidate.esfera_gov, tipo: candidate.tipo, alertas });

  function toggleAlerta(a) {
    setAlertas((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  }

  async function submit() {
    setSaving(true); setError(null);
    try {
      const payload = {
        candidato_id: candidate.id,
        candidato_nome: candidate.nome,
        cargo: candidate.cargo,
        esfera_gov: candidate.esfera_gov,
        tipo: candidate.tipo,
        cidade: candidate.cidade,
        estado: candidate.estado,
        notas,
        kpis: isLegislativo ? {} : kpis,
        checklist: isLegislativo ? checklist : {},
        nota_sintetica: synth,
        alertas,
        comentario,
      };
      await base44.entities.Evaluation.create(payload);
      navigate(`/candidato/${candidate.id}`);
    } catch (e) {
      setError(e.message || "Erro ao salvar avaliação");
    }
    setSaving(false);
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-12 md:py-16">
      <Link to={`/candidato/${candidate.id}`} className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground flex items-center gap-2 mb-8">
        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.8} /> {candidate.nome}
      </Link>

      <div className="pb-8 border-b border-border">
        <span className="text-[11px] uppercase tracking-[0.14em] text-accent font-semibold">{cargo.corporate}</span>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight mt-2">Auditoria do Candidato</h1>
        <p className="text-muted-foreground mt-3">{candidate.nome} · {cargo.label} · {esferaLabel(candidate.esfera_gov)}</p>
      </div>

      {/* progress */}
      <div className="flex items-center gap-4 mt-8 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-3 flex-1">
            <button onClick={() => setStep(i)} className={`flex items-center gap-3 ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
              <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-display ${i === step ? "border-accent bg-accent text-primary-foreground" : i < step ? "border-accent text-accent" : "border-border"}`}>{i + 1}</span>
              <span className="text-[11px] uppercase tracking-[0.1em] font-semibold">{s}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-accent" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* STEP 0 — Critérios */}
      {step === 0 && (
        <div className="flex flex-col gap-6">
          {CRITERIOS.map((c) => (
            <div key={c.key} className="bg-card hairline debossed p-7">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-2xl">{c.label}</h3>
                <span className="font-display text-3xl text-accent">{notas[c.key] != null ? notas[c.key].toFixed(1) : "—"}<span className="text-lg text-muted-foreground">/10</span></span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{c.desc}</p>
              <input
                type="range" min={0} max={10} step={0.5}
                value={notas[c.key] ?? 0}
                onChange={(e) => setNotas({ ...notas, [c.key]: Number(e.target.value) })}
                className="w-full mt-5 accent-[hsl(var(--accent))]"
              />
              <div className="flex justify-between text-[10px] uppercase tracking-[0.1em] text-muted-foreground mt-1">
                <span>0 · Inaceitável</span><span>5 · Aceitável</span><span>10 · Exemplar</span>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 bg-accent text-primary-foreground px-6 py-3 text-[11px] uppercase tracking-[0.12em] font-semibold hover:opacity-90">
              Próximo <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 1 — Indicadores */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          {isLegislativo ? (
            <>
              <div className="bg-card hairline debossed p-7">
                <h3 className="font-display text-2xl">Checklist do Conselheiro</h3>
                <p className="text-sm text-muted-foreground mt-2">Marque se o candidato cumpre cada critério de um bom conselheiro de administração.</p>
              </div>
              {checklistDefs.map((c) => (
                <div key={c.key} className="bg-card hairline debossed p-6">
                  <div className="font-semibold">{c.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">Auditar em: {c.portal}</div>
                  <div className="flex gap-2 mt-4">
                    {[{ v: "cumpre", l: "Cumpre" }, { v: "parcial", l: "Parcial" }, { v: "nao", l: "Não cumpre" }].map((o) => (
                      <button
                        key={o.v}
                        onClick={() => setChecklist({ ...checklist, [c.key]: o.v })}
                        className={`flex-1 py-2.5 text-[11px] uppercase tracking-[0.1em] font-semibold border transition-colors ${checklist[c.key] === o.v ? (o.v === "cumpre" ? "border-accent bg-accent/10 text-accent" : o.v === "parcial" ? "border-chart-5 bg-chart-5/10" : "border-destructive bg-destructive/5 text-destructive") : "border-border text-muted-foreground hover:text-foreground"}`}
                      >{o.l}</button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="bg-card hairline debossed p-7">
                <h3 className="font-display text-2xl">Painel de KPIs — {esferaLabel(candidate.esfera_gov)}</h3>
                <p className="text-sm text-muted-foreground mt-2">Insira os valores reais dos indicadores consultados nos portais oficiais. O app calcula a nota automaticamente.</p>
              </div>
              {kpiDefs.map((k) => (
                <div key={k.key} className="bg-card hairline debossed p-6">
                  <div className="flex items-baseline justify-between">
                    <div className="font-semibold">{k.label}</div>
                    <span className="text-[10px] uppercase tracking-[0.1em] text-accent">{k.hint}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Auditar em: {k.portal}</div>
                  <div className="mt-4">
                    {k.type === "select" ? (
                      <div className="flex gap-2">
                        {k.options.map((o) => (
                          <button
                            key={o.value}
                            onClick={() => setKpis({ ...kpis, [k.key]: o.value })}
                            className={`flex-1 py-2.5 text-xs border transition-colors ${kpis[k.key] === o.value ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}
                          >{o.label}</button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-3 border-b border-border py-1 max-w-xs">
                        <input
                          type="number"
                          step={k.step || (k.type === "percent" ? 1 : 0.01)}
                          value={kpis[k.key] ?? ""}
                          onChange={(e) => setKpis({ ...kpis, [k.key]: e.target.value === "" ? "" : Number(e.target.value) })}
                          placeholder="0"
                          className="bg-transparent font-display text-2xl w-24 focus:outline-none focus:border-accent"
                        />
                        <span className="text-muted-foreground text-sm">{k.unit}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* alertas */}
          <div className="bg-card hairline debossed p-7">
            <h3 className="font-display text-2xl flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" strokeWidth={1.8} /> Alertas de Integridade</h3>
            <p className="text-sm text-muted-foreground mt-2">Registros que equivalem a demissão por justa causa no mercado corporativo.</p>
            <div className="flex flex-col gap-3 mt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={alertas.includes("improbidade")} onChange={() => toggleAlerta("improbidade")} className="mt-1 accent-destructive" />
                <div>
                  <div className="font-semibold text-sm">Improbidade Administrativa</div>
                  <div className="text-xs text-muted-foreground">Limita a nota sintética a 30/100.</div>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={alertas.includes("tce_reprovado")} onChange={() => toggleAlerta("tce_reprovado")} className="mt-1 accent-chart-5" />
                <div>
                  <div className="font-semibold text-sm">Reprovação em Tribunal de Contas</div>
                  <div className="text-xs text-muted-foreground">Parecer desfavorável do TCU/TCE.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(0)} className="inline-flex items-center gap-2 border border-border px-6 py-3 text-[11px] uppercase tracking-[0.12em] font-semibold hover:bg-muted">
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.8} /> Anterior
            </button>
            <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 bg-accent text-primary-foreground px-6 py-3 text-[11px] uppercase tracking-[0.12em] font-semibold hover:opacity-90">
              Revisar <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — Revisão */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          <div className="bg-card hairline debossed p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Nota sintética calculada</span>
              <div className="font-display text-6xl text-accent leading-none mt-2">
                {synth ?? "—"}<span className="text-2xl text-muted-foreground">/100</span>
              </div>
              {synth != null && <span className="text-sm text-muted-foreground mt-2 block">{classificacao(synth).label}</span>}
            </div>
            <div className="text-sm text-muted-foreground max-w-sm">
              <p>60% da média dos critérios (0–10) + 40% dos indicadores {isLegislativo ? "(checklist)" : "(KPIs)"}.</p>
              {alertas.includes("improbidade") && <p className="text-destructive font-semibold mt-2">Improbidade ativa: nota limitada a 30.</p>}
            </div>
          </div>

          <div className="bg-card hairline debossed p-7">
            <h3 className="font-display text-xl">Comentário (opcional)</h3>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              placeholder="Registre evidências, fontes consultadas ou observações…"
              className="w-full mt-3 bg-transparent border border-border p-3 text-sm focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="bg-card hairline debossed p-7">
            <h3 className="font-display text-xl mb-3">Fontes consultadas</h3>
            <div className="flex flex-wrap gap-2">
              {portals.map((p) => (
                <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs border border-border px-3 py-2 hover:bg-muted">{p.label}</a>
              ))}
            </div>
          </div>

          {error && <div className="border border-destructive/40 bg-destructive/5 text-destructive px-4 py-3 text-sm">{error}</div>}

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 border border-border px-6 py-3 text-[11px] uppercase tracking-[0.12em] font-semibold hover:bg-muted">
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.8} /> Anterior
            </button>
            <button onClick={submit} disabled={saving} className="inline-flex items-center gap-2 bg-accent text-primary-foreground px-6 py-3 text-[11px] uppercase tracking-[0.12em] font-semibold hover:opacity-90 disabled:opacity-50">
              {saving ? "Salvando…" : <>Publicar avaliação <Check className="w-3.5 h-3.5" strokeWidth={1.8} /></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}