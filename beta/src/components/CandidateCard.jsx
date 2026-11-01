import { Link } from 'react-router-dom';
import { CARGOS } from '@/lib/audit';
import PoliticianPhoto from '@/components/PoliticianPhoto';
import ScoreBadge from '@/components/ScoreBadge';
import AlertPill from '@/components/AlertPill';

export default function CandidateCard({ candidate, media, avaliacoesCount = 0 }) {
  const cargo = CARGOS[candidate.cargo];
  return (
    <article className="bg-card hairline p-5 flex flex-col gap-4">
      <Link to={`/candidato/${candidate.id}`} className="flex items-start gap-4 group">
        <PoliticianPhoto candidate={candidate} size="md" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl leading-tight group-hover:text-accent">{candidate.nome}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {cargo?.label || candidate.cargo} · {candidate.partido || 'Partido não informado'}
          </p>
        </div>
        <ScoreBadge nota={media} size="sm" />
      </Link>
      <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
        <div className="flex flex-wrap gap-1.5">
          {(candidate.alertas || []).slice(0, 2).map((alerta) => (
            <AlertPill key={alerta} alerta={alerta} />
          ))}
        </div>
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {avaliacoesCount} aval.
        </span>
      </div>
    </article>
  );
}
