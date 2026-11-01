export default function PoliticianPhoto({ candidate, size = 'md' }) {
  const dimension = size === 'lg' ? 'h-24 w-24' : size === 'sm' ? 'h-12 w-12' : 'h-16 w-16';
  const initials = String(candidate?.nome || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  if (candidate?.foto_url) {
    return (
      <img
        src={candidate.foto_url}
        alt={`Foto de ${candidate.nome}`}
        loading="lazy"
        referrerPolicy="no-referrer"
        className={`${dimension} shrink-0 rounded-sm object-cover bg-muted`}
      />
    );
  }

  return (
    <span
      aria-label={`Foto indisponível para ${candidate?.nome || 'este registro'}`}
      className={`${dimension} shrink-0 inline-flex items-center justify-center rounded-sm bg-muted font-display text-xl text-muted-foreground`}
    >
      {initials}
    </span>
  );
}
