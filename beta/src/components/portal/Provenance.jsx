import { ExternalLink } from 'lucide-react';
import { formatDateTime } from '@/lib/format';

export default function Provenance({ fonte, url, data }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span>Fonte: {fonte || 'não informada'}</span>
      {data && <span>Consulta: {formatDateTime(data) || data}</span>}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-secondary hover:underline"
        >
          Ver origem <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
