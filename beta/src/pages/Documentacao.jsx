import { Link } from "react-router-dom";
import { ShieldCheck, Scale, Eye, Accessibility, Building2, ExternalLink, AlertCircle, FileCheck } from "lucide-react";
import PageHeader from "@/components/portal/PageHeader";

function Section({ id, icon: Icon, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-border pb-10 mb-10 last:border-b-0" aria-labelledby={`${id}-titulo`}>
      <h2 id={`${id}-titulo`} className="font-display text-2xl md:text-3xl mb-4 flex items-center gap-2.5">
        <Icon className="w-5 h-5 text-accent" aria-hidden="true" strokeWidth={1.8} />
        {title}
      </h2>
      <div className="text-sm md:text-[15px] leading-relaxed text-foreground/90 space-y-4 max-w-3xl [&_a]:text-secondary [&_a]:font-semibold [&_a]:underline-offset-2 hover:[&_a]:underline">
        {children}
      </div>
    </section>
  );
}

export default function Documentacao() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-10 md:py-14">
      <PageHeader
        kicker="Institucional"
        title="Documentação do projeto"
        description="Apresentação, metodologia, limites, política de correções, privacidade e acessibilidade. Esta página é o contrato editorial do portal com o leitor."
      />

      <nav aria-label="Índice da documentação" className="bg-card hairline p-5 mb-10">
        <div className="text-[10px] uppercase tracking-[0.12em] font-bold text-muted-foreground mb-3">Nesta página</div>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
          {[
            ["#projeto", "Apresentação do projeto"],
            ["#metodologia", "Metodologia e proveniência"],
            ["#limites", "Limites e cobertura"],
            ["#correcoes", "Política de correções"],
            ["#privacidade", "Privacidade e LGPD"],
            ["#acessibilidade", "Acessibilidade e idiomas"],
            ["#empresa", "DestinyServicesBR&TI"],
          ].map(([href, label]) => (
            <li key={href}>
              <a href={href} className="text-secondary font-semibold hover:underline">{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <Section id="projeto" icon={Eye} title="Apresentação do projeto">
        <p>
          O <strong>AuditVoto</strong> é um portal documental de transparência política e história do Brasil.
          Ele organiza dados e documentos já publicados por instituições oficiais e indica, em cada registro,
          a fonte e a data da consulta.
        </p>
        <p>
          O objetivo é educacional: ajudar qualquer pessoa a consultar registros verificáveis sobre políticos,
          partidos e momentos da história política brasileira, sem opinião, sem narrativa automática e sem
          conclusões sobre pessoas.
        </p>
        <p>
          O portal não é um órgão público e não representa instituições do Estado. Ele reúne referências e
          aponta para as fontes primárias.
        </p>
      </Section>

      <Section id="metodologia" icon={FileCheck} title="Metodologia e proveniência">
        <p>Cada registro do portal segue quatro etapas:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li><strong>Fonte oficial:</strong> o dado é obtido de uma base ou documento público identificável.</li>
          <li><strong>Validação:</strong> formato, identidade, período e origem são conferidos. Linhas que não passam nas regras são rejeitadas e reportadas.</li>
          <li><strong>Proveniência:</strong> o registro guarda a URL da fonte, o método de obtenção e o instante da consulta.</li>
          <li><strong>Divergência explícita:</strong> quando as fontes discordam, a divergência é exibida — não se escolhe um valor silenciosamente.</li>
        </ol>
        <p>
          A importação de candidaturas usa os arquivos de <strong>Dados Abertos do TSE</strong>
          {" "}(<a href="https://dadosabertos.tse.jus.br/" target="_blank" rel="noopener noreferrer">dadosabertos.tse.jus.br</a>).
          Cada linha importada recebe um identificador de origem (SQ_CANDIDATO), a data da consulta e o
          resultado da validação.
        </p>
        <p className="border-l-2 border-accent pl-4 bg-accent/5 py-2">
          <strong>Regra editorial:</strong> o portal não usa inteligência artificial como fonte primária e não
          gera textos, avaliações, acusações ou conclusões sobre pessoas.
        </p>
      </Section>

      <Section id="limites" icon={AlertCircle} title="Limites e cobertura">
        <ul className="list-disc pl-5 space-y-2">
          <li>O acervo é publicado <strong>por etapas</strong> e não é exaustivo. Cada seção declara o recorte atual.</li>
          <li>Não há rotina automática de atualização diária nesta versão: a consulta é feita sob demanda.</li>
          <li>Campos sem confirmação são exibidos como <em>ausentes</em>. A ausência de registro público não equivale à ausência do fato.</li>
          <li>Dados financeiros, bens declarados e processos não fazem parte do recorte atual; cada perfil indica as fontes oficiais para consultá-los.</li>
          <li>O portal não afirma neutralidade absoluta nem completude histórica; afirma apenas que cada registro declara sua origem e seu recorte.</li>
        </ul>
      </Section>

      <Section id="correcoes" icon={Scale} title="Política de correções">
        <p>
          Qualquer pessoa pode sinalizar erro ou fonte indisponível em um registro, pelo botão
          <strong> “Reportar erro ou fonte quebrada”</strong> disponível nos perfis e nas fichas históricas.
        </p>
        <p>
          O reporte é registrado com o estado <strong>recebido</strong> e não altera dados oficiais
          diretamente. A correção só ocorre após conferência na fonte original, e o estado do reporte fica
          visível no sistema.
        </p>
        <p>
          Correções que alterem um registro são feitas a partir da fonte, preservando a data da nova consulta.
          O portal não aceita pedidos de alteração que não possam ser verificados em fonte pública.
        </p>
      </Section>

      <Section id="privacidade" icon={ShieldCheck} title="Privacidade e LGPD">
        <p>
          O portal trabalha com <strong>minimização de dados</strong>. Na importação de candidaturas são
          desconsiderados dados pessoais sensíveis ou desnecessários, como CPF, e-mail e data de nascimento.
          São mantidos apenas dados públicos de identificação da candidatura.
        </p>
        <p>
          As informações exibidas têm finalidade de transparência pública e educação cívica, com base em
          registros oficiais. Titulares de dados podem solicitar esclarecimento ou correção pelo formulário de
          reporte.
        </p>
        <p>
          Contato opcional informado em um reporte é usado apenas para retorno sobre aquele reporte.
        </p>
      </Section>

      <Section id="acessibilidade" icon={Accessibility} title="Acessibilidade e idiomas">
        <p>
          O portal foi construído para navegação por teclado e leitores de tela, com estrutura semântica,
          link de salto para o conteúdo, foco visível e contraste adequado.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Tamanho do texto:</strong> três níveis no menu “Acessibilidade”.</li>
          <li><strong>Alto contraste:</strong> disponível no mesmo menu.</li>
          <li><strong>Assistência auditiva:</strong> leitura da página em voz alta pela síntese do navegador.</li>
          <li><strong>Idiomas:</strong> o conteúdo original é em português; a tradução para inglês e espanhol é <em>automática</em> (Google Translate) e sempre aponta para o original.</li>
        </ul>
        <p>
          Encontrou uma barreira de acessibilidade? Use o formulário de reporte indicando a página e o
          recurso utilizado.
        </p>
      </Section>

      <Section id="empresa" icon={Building2} title="DestinyServicesBR&TI">
        <p>
          O projeto é mantido pela <strong>DestinyServicesBR&amp;TI</strong>, responsável pela operação e
          manutenção do portal.
        </p>
        <dl className="bg-card hairline divide-y divide-border not-prose">
          {[
            ["Razão social / nome empresarial", "Ivan Montibeller (DestinyServicesBR&TI)"],
            ["CNPJ", "45.609.430/0001-43"],
            ["Data de fundação", "11/03/2022"],
            ["Sede", "Blumenau, Santa Catarina"],
            ["Porte", "Microempresa"],
            ["Situação cadastral", "Ativa na Receita Federal (conforme informação do responsável)"],
            ["Atividade principal", "Comércio varejista especializado de equipamentos e suprimentos de informática"],
            ["Atividades declaradas", "Importação, desenvolvimento mecatrônico e produtos open source"],
          ].map(([k, v]) => (
            <div key={k} className="grid sm:grid-cols-[240px_1fr] gap-1 sm:gap-4 px-4 py-3">
              <dt className="text-[11px] uppercase tracking-[0.1em] font-bold text-muted-foreground">{k}</dt>
              <dd className="text-sm">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="border border-chart-5/40 bg-chart-5/5 px-4 py-3 rounded-sm text-sm">
          <p className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-chart-5 mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              Os dados empresariais acima foram <strong>informados pelo responsável pelo projeto</strong> e
              ainda não foram confrontados com o registro oficial. Confirme-os na fonte pública:
            </span>
          </p>
          <a
            href="https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-secondary"
          >
            Consultar CNPJ na Receita Federal <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
        <p>
          Transparência sobre o desenvolvimento: o portal declara suas fontes, seus limites e seu método, e
          mantém um canal público de correções. Não há vínculo partidário declarado.
        </p>
      </Section>

      <div className="text-xs text-muted-foreground">
        <Link to="/politicos" className="text-secondary font-semibold hover:underline">Consultar políticos</Link>
        {" · "}
        <Link to="/historia" className="text-secondary font-semibold hover:underline">Explorar o acervo histórico</Link>
      </div>
    </div>
  );
}