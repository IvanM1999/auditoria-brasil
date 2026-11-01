import { ExternalLink } from 'lucide-react';

export default function ReportIssueButton({
  registroTipo,
  registroId,
  registroTitulo,
  referenciaInicial,
}) {
  const title = `Correção: ${registroTitulo || registroTipo || 'registro'}`;
  const details = [
    'Tipo de registro: ' + (registroTipo || 'não informado'),
    'Identificador: ' + (registroId || 'não informado'),
    'Registro: ' + (registroTitulo || 'não informado'),
    'Fonte informada: ' + (referenciaInicial || 'não informada'),
    'Descreva o problema e inclua uma fonte pública verificável:',
  ].join('\n');
  const href = `https://github.com/IvanM1999/auditoria-brasil/issues/new?${new URLSearchParams({
    title,
    body: details,
  })}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs font-semibold hover:border-accent hover:text-accent"
    >
      Reportar erro ou fonte quebrada
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}
