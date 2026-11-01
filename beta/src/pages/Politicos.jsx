import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, DownloadCloud, Users, ChevronDown, Loader2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CARGOS, esferaLabel } from "@/lib/audit";
import PageHeader from "@/components/portal/PageHeader";
import EmptyState from "@/components/portal/EmptyState";
import PoliticianPhoto from "@/components/PoliticianPhoto";

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const ESFERAS = [
  { value: "", label: "Todas as esferas" },
  { value: "federal", label: "Federal" },
  { value: "estadual", label: "Estadual" },
  { value: "municipal", label: "Municipal" },
];
const CARGOS_OPCOES = [
  { value: "", label: "Todos os cargos" },
  ...Object.entries(CARGOS).map(([value, c]) => ({ value, label: c.label })),
];

function SituacaoTag({ situacao }) {
  const map = {
    ativo: { label: "Ativa na fonte", cls: "border-accent/40 text-accent" },
    inapto: { label: "Inapta na fonte", cls: "border-destructive/40 text-destructive" },
    renunciado: { label: "Renúncia/cassação", cls: "border-border text-muted-foreground" },
  };
  const m = map[situacao] || map.ativo;
  return <span className={`text-[10px] uppercase tracking-[0.1em] font-semibold border px-2 py-0.5 rounded-sm ${m.cls}`}>{m.label}</span>;
}

export default function Politicos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [esfera, setEsfera] = useState("");
  const [cargo, setCargo] = useState("");
  const [estado, setEstado] = useState("");
  const [busca, setBusca] = useState("");
  const [termo, setTermo] = useState("");

  const [ano, setAno] = useState("2022");
  const [ufImport, setUfImport] = useState("SC");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setTermo(busca.trim()), 350);
    return () => clearTimeout(t);
  }, [busca]);

  const query = useMemo(() => {
    const q = {};
    if (esfera) q.esfera_gov = esfera;
    if (cargo) q.cargo = cargo;
    if (estado) q.estado = estado;
    if (termo) q.nome = { $regex: termo, $options: "i" };
    return q;
  }, [esfera, cargo, estado, termo]);

  async function loadPage(reset) {
    setLoading(true);
    try {
      const page = await base44.entities.Candidate.filter(query, {
        sort: "nome",
        limit: 24,
        ...(reset ? {} : cursor ? { cursor } : {}),
      });
      const list = page?.items || [];
      setItems((prev) => (reset ? list : [...prev, ...list]));
      setCursor(page?.next_cursor || null);
      setHasMore(!!page?.has_more);
    } catch (e) {
      if (reset) setItems([]);
    }
    setLoading(false);
  }

  useEffect(() => { loadPage(true); /* eslint-disable-next-line */ }, [query]);

  async function runImport(e) {
    e.preventDefault();
    setImporting(true);
    setImportError("");
    setImportResult(null);
    try {
      const res = await base44.functions.invoke("importTseCandidates", { ano, uf: ufImport });
      const data = res?.data || res;
      if (!data?.ok) throw new Error(data?.error || "A fonte não retornou dados");
      setImportResult(data);
      await loadPage(true);
    } catch (err) {
      setImportError(err?.response?.data?.error || err.message || "Falha ao consultar a fonte oficial");
    }
    setImporting(false);
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 md:py-14">
      <PageHeader
        kicker="Acervo · Pessoas"
        title="Políticos"
        description="Perfis com dados cadastrais oficiais. Cada campo declara a fonte e a data da consulta; campos sem confirmação são exibidos como ausentes, nunca preenchidos por estimativa."
      />

      {/* Filtros */}
      <section aria-label="Filtros de consulta" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="relative lg:col-span-2">
          <label htmlFor="busca" className="sr-only">Buscar por nome</label>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="busca"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome"
            className="w-full bg-card border border-border pl-9 pr-3 py-2.5 text-sm rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="f-esfera" className="sr-only">Esfera</label>
          <select id="f-esfera" value={esfera} onChange={(e) => setEsfera(e.target.value)} className="w-full bg-card border border-border px-3 py-2.5 text-sm rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {ESFERAS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-cargo" className="sr-only">Cargo</label>
          <select id="f-cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} className="w-full bg-card border border-border px-3 py-2.5 text-sm rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {CARGOS_OPCOES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="f-uf" className="sr-only">Estado</label>
          <select id="f-uf" value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full bg-card border border-border px-3 py-2.5 text-sm rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">Todos os estados</option>
            {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </div>
      </section>

      {/* Atualização sob demanda */}
      <details className="bg-card hairline mb-8 group">
        <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <DownloadCloud className="w-4 h-4 text-accent" aria-hidden="true" strokeWidth={1.8} />
            Atualizar dados da fonte oficial (TSE)
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" aria-hidden="true" />
        </summary>
        <div className="px-5 pb-5 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            A importação consulta diretamente o arquivo de candidaturas publicado pelo TSE. Cada linha é
            validada; registros inválidos são rejeitados e reportados. Nesta versão não há rotina diária
            automática — a atualização ocorre quando solicitada.
          </p>
          <form onSubmit={runImport} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="imp-ano" className="text-[10px] uppercase tracking-[0.1em] font-bold text-muted-foreground">Pleito</label>
              <select id="imp-ano" value={ano} onChange={(e) => setAno(e.target.value)} className="bg-background border border-border px-3 py-2 text-sm rounded-sm">
                <option value="2022">2022 · Gerais</option>
                <option value="2024">2024 · Municipais</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="imp-uf" className="text-[10px] uppercase tracking-[0.1em] font-bold text-muted-foreground">Estado</label>
              <select id="imp-uf" value={ufImport} onChange={(e) => setUfImport(e.target.value)} className="bg-background border border-border px-3 py-2 text-sm rounded-sm">
                {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <button type="submit" disabled={importing} className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2.5 text-xs font-bold rounded-sm disabled:opacity-50">
              {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <DownloadCloud className="w-3.5 h-3.5" aria-hidden="true" />}
              {importing ? "Consultando o TSE…" : "Importar agora"}
            </button>
          </form>

          <div aria-live="polite" className="mt-4">
            {importError && (
              <div className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-xs text-destructive flex items-start gap-2 rounded-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{importError}. Nenhum dado foi inventado ou gravado.</span>
              </div>
            )}
            {importResult && (
              <div className="border border-border bg-muted/40 px-4 py-3 text-xs rounded-sm leading-relaxed">
                <div className="font-semibold mb-1">Consulta concluída em {importResult.fonte?.arquivo}</div>
                <div className="text-muted-foreground">
                  {importResult.totais?.importados} importados · {importResult.totais?.ja_existentes} já existentes ·{" "}
                  {importResult.totais?.rejeitados} rejeitados de {importResult.totais?.linhas_no_arquivo} linhas.
                </div>
                <div className="text-muted-foreground mt-1">{importResult.cobertura}</div>
              </div>
            )}
          </div>
        </div>
      </details>

      {/* Lista */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">Carregando registros oficiais…</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum registro encontrado"
          action={<span className="text-xs text-muted-foreground">Use a atualização oficial acima para importar candidaturas do TSE.</span>}
        >
          Não há registros que correspondam aos filtros. A ausência de registro não significa ausência de
          candidatura — significa que a fonte ainda não foi importada para este recorte.
        </EmptyState>
      ) : (
        <>
          <div className="text-xs text-muted-foreground mb-3">
            {items.length} registro{items.length === 1 ? "" : "s"} exibido{items.length === 1 ? "" : "s"} nesta página
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((c) => (
              <li key={c.id}>
                <Link to={`/politicos/${c.id}`} className="group bg-card hairline p-5 flex flex-col gap-3 h-full hover:border-accent transition-colors">
                  <div className="flex gap-4">
                    <PoliticianPhoto candidate={c} size="md" />
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase tracking-[0.12em] text-accent font-bold">
                        {CARGOS[c.cargo]?.corporate || CARGOS[c.cargo]?.label || c.cargo}
                      </span>
                      <h2 className="font-display text-lg leading-tight mt-1">{c.nome}</h2>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-2">
                        <span className="font-mono">{c.numero}</span>
                        <span>·</span>
                        <span className="font-semibold text-foreground">{c.partido}</span>
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mt-1">
                        {esferaLabel(c.esfera_gov)}{c.estado ? ` · ${c.estado}` : ""}{c.pleito ? ` · ${c.pleito}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <SituacaoTag situacao={c.situacao} />
                    {c.validacao?.status === "validado" && (
                      <span className="text-[10px] uppercase tracking-[0.1em] text-accent font-semibold">validado</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => loadPage(false)}
                className="border border-border px-5 py-2.5 text-xs font-semibold rounded-sm hover:bg-muted"
              >
                Carregar mais registros
              </button>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-muted-foreground mt-10 leading-relaxed border-t border-border pt-4">
        <strong>Cobertura:</strong> registros importados dos arquivos oficiais de candidatura do TSE. A base é
        ampliada por etapas e por estado. Dados financeiros, bens declarados e processos não fazem parte deste
        recorte e devem ser consultados nas fontes oficiais indicadas em cada perfil.
      </p>
    </div>
  );
}