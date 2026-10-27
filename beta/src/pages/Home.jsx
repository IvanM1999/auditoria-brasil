import { Link } from "react-router-dom";
import {
  Users, Building2, BookOpen, GraduationCap, FileText, ArrowRight,
  ShieldCheck, FileSearch, Link2, MailCheck, Landmark, ScrollText,
} from "lucide-react";
import { Image } from "@/components/ui/image";

const CONGRESSO_IMG = "https://media.base44.com/images/public/6ac00c5d4dd8bd2bf9718750/884bbf45d_generated_image.png";

const SECTIONS = [
  { to: "/politicos", icon: Users, kicker: "Pessoas", title: "Políticos", desc: "Perfis com dados cadastrais, cargos e mandatos, cada campo ligado à fonte oficial e à data da consulta." },
  { to: "/partidos", icon: Building2, kicker: "Organizações", title: "Partidos", desc: "Identificação, registro eleitoral e os políticos vinculados, com documentos de origem." },
  { to: "/historia", icon: BookOpen, kicker: "Acervo", title: "História política", desc: "Fichas com fatos individualizados, datas, documentos e divergências entre fontes — evidência separada de interpretação." },
  { to: "/educacao", icon: GraduationCap, kicker: "Formação", title: "Educação e biblioteca", desc: "Cursos, acervos digitais e bibliotecas públicas recomendadas, com instituição, licença e link de origem." },
  { to: "/documentacao", icon: FileText, kicker: "Institucional", title: "Documentação", desc: "Metodologia, limites, política de correções, privacidade e a atuação da DestinyServicesBR&TI." },
];

const PILARES = [
  { icon: Landmark, title: "Fonte oficial", desc: "Cada registro aponta para o documento ou base pública que o sustenta, com URL e data de consulta." },
  { icon: ShieldCheck, title: "Validação", desc: "Formato, identidade, período e origem são verificados. Falhas e divergências são exibidas, não escondidas." },
  { icon: Link2, title: "Proveniência", desc: "Nenhum campo é preenchido por inferência. Sem dado confirmado, o registro exibe a ausência." },
  { icon: MailCheck, title: "Correção pública", desc: "Qualquer pessoa pode sinalizar erro ou fonte quebrada; o estado do reporte fica visível." },
];

const DESTAQUES = [
  { to: "/historia", tag: "Império · 1822", title: "Independência do Brasil", desc: "A ruptura com Portugal e a formação do Estado imperial, com documentos e datas." },
  { to: "/historia", tag: "República · 1889", title: "Proclamação da República", desc: "O fim da monarquia e a instalação da República, com a Constituição de 1891." },
  { to: "/historia", tag: "Nova República · 1988", title: "Constituição Cidadã", desc: "A Assembleia Constituinte e o marco jurídico vigente, com o texto integral." },
];

const FONTES = [
  { label: "Portal da Transparência", url: "https://www.portaldatransparencia.gov.br/" },
  { label: "Dados Abertos do TSE", url: "https://dadosabertos.tse.jus.br/" },
  { label: "Câmara dos Deputados", url: "https://www.camara.leg.br/" },
  { label: "Senado Federal", url: "https://www12.senado.leg.br/" },
  { label: "Tribunal de Contas da União", url: "https://portal.tcu.gov.br/" },
  { label: "SICONFI", url: "https://siconfi.tesouro.gov.br/siconfi/" },
];

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <Image src={CONGRESSO_IMG} alt="" fittingType="fill" className="w-full h-full" />
          <div className="absolute inset-0 bg-primary/50" />
        </div>
        <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-highlight font-bold">
              <ScrollText className="w-4 h-4" aria-hidden="true" /> Portal documental · Brasil
            </span>
            <h1 className="font-display text-[clamp(32px,4.6vw,56px)] leading-[1.06] tracking-tight mt-4">
              Transparência política com fonte, data e nenhuma opinião.
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/85 leading-relaxed mt-5 max-w-2xl">
              Um acervo público que organiza dados e documentos oficiais sobre políticos, partidos e
              história do Brasil. Todo registro indica de onde veio, quando foi consultado e o que não
              foi possível confirmar.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-7">
              <Link to="/politicos" className="inline-flex items-center gap-2 bg-highlight text-primary px-6 py-3 text-sm font-bold hover:opacity-90 transition-opacity rounded-sm">
                Consultar políticos <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link to="/documentacao" className="inline-flex items-center gap-2 border border-primary-foreground/40 px-6 py-3 text-sm font-semibold hover:bg-primary-foreground/10 transition-colors rounded-sm">
                Metodologia e limites
              </Link>
            </div>
            <p className="text-[11px] uppercase tracking-[0.1em] text-primary-foreground/60 mt-6">
              Sem narrativa automática · Sem juízo político · Somente registros verificáveis
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÕES */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-16" aria-labelledby="secoes-titulo">
        <div className="pb-6 mb-8 border-b border-border">
          <span className="text-[11px] uppercase tracking-[0.14em] text-accent font-bold">01 / Navegação</span>
          <h2 id="secoes-titulo" className="font-display text-3xl md:text-4xl tracking-tight mt-2">
            Cinco formas de consultar o acervo.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SECTIONS.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="group bg-card hairline p-6 flex flex-col gap-3 hover:border-accent focus-visible:border-accent transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-accent" aria-hidden="true" strokeWidth={1.8} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.14em] text-secondary font-bold">{s.kicker}</span>
              <h3 className="font-display text-xl leading-tight">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              <span className="mt-auto pt-2 text-[11px] font-semibold text-accent inline-flex items-center gap-1.5">
                Acessar <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* COMO TRATAMOS OS DADOS */}
      <section className="bg-muted/30 border-y border-border" aria-labelledby="metodo-titulo">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
          <div className="pb-6 mb-8 border-b border-border">
            <span className="text-[11px] uppercase tracking-[0.14em] text-accent font-bold">02 / Método</span>
            <h2 id="metodo-titulo" className="font-display text-3xl md:text-4xl tracking-tight mt-2">
              Como cada dado é tratado.
            </h2>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PILARES.map((p, i) => (
              <li key={p.title} className="bg-card hairline p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p.icon className="w-5 h-5 text-accent" aria-hidden="true" strokeWidth={1.8} />
                  <span className="font-display text-2xl text-border">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="font-display text-lg leading-tight">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* DESTAQUES DO ACERVO */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-16" aria-labelledby="acervo-titulo">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6 mb-8 border-b border-border">
          <div>
            <span className="text-[11px] uppercase tracking-[0.14em] text-accent font-bold">03 / Acervo</span>
            <h2 id="acervo-titulo" className="font-display text-3xl md:text-4xl tracking-tight mt-2">
              Recorte inicial da história política.
            </h2>
          </div>
          <Link to="/historia" className="text-sm font-semibold text-accent inline-flex items-center gap-1.5">
            Ver o acervo completo <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {DESTAQUES.map((d) => (
            <Link key={d.title} to={d.to} className="group bg-card hairline p-6 flex flex-col gap-2 hover:border-accent transition-colors">
              <span className="text-[10px] uppercase tracking-[0.14em] text-secondary font-bold">{d.tag}</span>
              <h3 className="font-display text-xl leading-tight">{d.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
              <span className="mt-2 text-[11px] font-semibold text-accent inline-flex items-center gap-1.5">
                Abrir ficha <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
          O acervo é publicado por etapas. O recorte atual não representa a totalidade da história política
          brasileira; a cobertura de cada período é declarada em cada ficha.
        </p>
      </section>

      {/* FONTES OFICIAIS */}
      <section className="bg-primary text-primary-foreground" aria-labelledby="fontes-titulo">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4 pb-6 mb-6 border-b border-primary-foreground/20">
            <div>
              <span className="text-[11px] uppercase tracking-[0.14em] text-highlight font-bold">04 / Fontes</span>
              <h2 id="fontes-titulo" className="font-display text-3xl md:text-4xl tracking-tight mt-2">
                Onde os dados são verificados.
              </h2>
            </div>
            <p className="text-xs text-primary-foreground/60 max-w-sm">
              Sempre consulte o documento original. O portal organiza referências, não substitui a fonte.
            </p>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FONTES.map((f) => (
              <li key={f.url}>
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 border border-primary-foreground/20 px-4 py-3.5 hover:bg-primary-foreground/10 transition-colors rounded-sm">
                  <span className="text-sm font-semibold">{f.label}</span>
                  <Link2 className="w-4 h-4 text-primary-foreground/60" aria-hidden="true" strokeWidth={1.8} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* COBERTURA / LIMITES */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-16" aria-labelledby="limites-titulo">
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 items-start">
          <div>
            <span className="text-[11px] uppercase tracking-[0.14em] text-accent font-bold">05 / Transparência</span>
            <h2 id="limites-titulo" className="font-display text-3xl md:text-4xl tracking-tight mt-2">
              O que este portal não faz.
            </h2>
            <p className="text-muted-foreground leading-relaxed mt-4">
              A confiança em um acervo público depende de declarar seus limites. Estas são as regras
              editoriais do projeto — e elas valem para todo o conteúdo.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link to="/documentacao#metodologia" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 text-xs font-bold rounded-sm hover:opacity-90">
                <FileSearch className="w-3.5 h-3.5" aria-hidden="true" /> Ler a metodologia
              </Link>
              <Link to="/documentacao#correcoes" className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-xs font-bold rounded-sm hover:bg-muted">
                Política de correções
              </Link>
            </div>
          </div>
          <ul className="bg-card hairline divide-y divide-border">
            {[
              "Não gera textos, conclusões ou acusações sobre pessoas por meio de inteligência artificial.",
              "Não classifica políticos como bons ou ruins e não emite juízo partidário.",
              "Não preenche lacunas por inferência: quando não há dado confirmado, o campo informa a ausência.",
              "Não promete completude histórica nem atualização em tempo real nesta versão.",
              "Não substitui a leitura do documento oficial; toda referência aponta para a fonte primária.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 px-5 py-4">
                <ShieldCheck className="w-4 h-4 text-accent mt-0.5 shrink-0" aria-hidden="true" strokeWidth={1.8} />
                <span className="text-sm leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}