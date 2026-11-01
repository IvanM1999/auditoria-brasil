const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' });
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value) {
  const date = parseDate(value);
  return date ? dateTimeFormatter.format(date) : '';
}

export function formatPeriodo(start, end) {
  const format = (value) => {
    if (!value) return '';
    const yearOnly = String(value).match(/^\d{4}$/);
    if (yearOnly) return yearOnly[0];
    const date = parseDate(value);
    return date ? dateFormatter.format(date) : String(value);
  };

  const first = format(start);
  const last = format(end);
  if (!first) return last;
  if (!last || first === last) return first;
  return `${first} – ${last}`;
}
