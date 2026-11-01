import { classificacao } from '@/lib/audit';

const toneClasses = {
  good: 'border-accent/40 text-accent',
  ok: 'border-secondary/40 text-secondary',
  warn: 'border-chart-5/50 text-foreground',
  bad: 'border-destructive/40 text-destructive',
  muted: 'border-border text-muted-foreground',
};

export default function ScoreBadge({ nota, score, size = 'md' }) {
  const value = nota ?? score ?? null;
  const status = classificacao(value);
  const label = value == null ? 'Sem nota' : `${Math.round(value)} / 100`;

  return (
    <span
      className={`inline-flex flex-col items-center border rounded-sm px-2.5 py-1 ${toneClasses[status.tone] || toneClasses.muted} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}
      aria-label={value == null ? 'Candidato sem avaliações' : `${label}, ${status.label}`}
    >
      <strong className="font-display leading-tight">{value == null ? '—' : Math.round(value)}</strong>
      <span className="text-[9px] uppercase tracking-[0.08em]">{status.label}</span>
    </span>
  );
}
