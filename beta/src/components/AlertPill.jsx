const ALERT_LABELS = {
  improbidade: 'Improbidade',
  contas_reprovadas: 'Contas reprovadas',
  reprovacao_tce: 'Reprovação em tribunal de contas',
};

export default function AlertPill({ alerta, alert }) {
  const value = alerta ?? alert;
  const label = ALERT_LABELS[value] || String(value || 'Alerta');
  return (
    <span className="inline-flex items-center border border-destructive/35 bg-destructive/5 px-2 py-1 text-[10px] font-semibold text-destructive rounded-sm">
      {label}
    </span>
  );
}
