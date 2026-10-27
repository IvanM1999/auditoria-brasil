import { useEffect, useMemo, useState } from "react";
import { GraduationCap, ExternalLink, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/portal/PageHeader";
import EmptyState from "@/components/portal/EmptyState";

const TIPOS = [
  { value: "", label: "Todos" },
  { value: "curso", label: "Cursos" },
  { value: "acervo", label: "Acervos digitais" },
  { value: "livro", label: "Livros e bibliotecas" },
  { value: "portal", label: "Portais oficiais" },
  { value: "documento", label: "Documentos" },
];

const ACESSO = {
  livre: "Acesso livre",
  restrito: "Acesso restrito",
  hospedado: "Conteúdo hospedado",
};

export default function Educacao() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Resource.list("ordem", 200);
        setResources(Array.isArray(list) ? list : []);
      } catch (e) {
        setResources([]);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => (tipo ? resources.filter((r) => r.tipo === tipo) : resources),
    [resources, tipo]
  );

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 md:py-14">
      <PageHeader
        kicker="Acervo · Formação"
        title="Educação e biblioteca"
        description="Cursos, acervos digitais, bibliotecas e portais oficiais recomendados para estudar política, transparência e história do Brasil. Cada recurso declara a instituição responsável, a licença e o link de origem — o portal não hospeda conteúdo de terceiros."
      />

      <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filtrar recursos por tipo">
        {TIPOS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTipo(t.value)}
            aria-pressed={tipo === t.value}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-sm border transition-colors ${tipo === t.value ? "bg-accent text-accent-foreground border-accent" : "border-border hover:bg-muted"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">Carregando recursos…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Nenhum recurso neste filtro">
          Selecione outro tipo de recurso.
        </EmptyState>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <li key={r.id} className="bg-card hairline p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-[0.12em] text-secondary font-bold">{r.tipo}</span>
                <span className="text-[10px] text-muted-foreground border border-border px-2 py-0.5 rounded-sm">
                  {ACESSO[r.acesso] || r.acesso}
                </span>
              </div>
              <h2 className="font-display text-lg leading-tight">
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent inline-flex items-start gap-1.5">
                  {r.titulo}
                  <ExternalLink className="w-3.5 h-3.5 mt-1 shrink-0" aria-hidden="true" />
                </a>
              </h2>
              {r.descricao && <p className="text-sm text-muted-foreground leading-relaxed">{r.descricao}</p>}
              <div className="mt-auto pt-3 border-t border-border/60 text-[11px] text-muted-foreground space-y-0.5">
                {r.instituicao && <div><span className="font-semibold text-foreground">{r.instituicao}</span></div>}
                {r.autor && <div>Autor: {r.autor}</div>}
                {r.licenca && <div>Licença: {r.licenca}</div>}
                {r.tema && <div>Tema: {r.tema}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-12" aria-labelledby="govbr-titulo">
        <h2 id="govbr-titulo" className="font-display text-2xl mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent" aria-hidden="true" strokeWidth={1.8} /> Por que priorizar fontes gov.br
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Fontes governamentais publicam documentos com autoria institucional, data e condições de uso
          declaradas. Isso permite verificar a informação na origem, o que é essencial para um acervo público.
          Sempre confira a licença e as condições de uso de cada acervo antes de reutilizar o conteúdo.
        </p>
      </section>
    </div>
  );
}