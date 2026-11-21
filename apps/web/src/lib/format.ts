const SPECIAL: Record<string, string> = {
  ndis: 'NDIS',
  pdf: 'PDF',
  'in-person': 'In person',
  one_off: 'One-off',
  in_progress: 'In progress',
  'tip-sheet': 'Tip sheet',
  'webinar-recording': 'Webinar recording',
  'self-paced': 'Self-paced',
  act: 'ACT',
  nsw: 'NSW',
  nt: 'NT',
  qld: 'QLD',
  sa: 'SA',
  tas: 'TAS',
  vic: 'VIC',
  wa: 'WA',
};

export function labelize(value: string) {
  const key = value.toLowerCase();
  if (SPECIAL[key]) return SPECIAL[key];
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatAUD(cents: number) {
  const amount = Number.isFinite(cents) ? cents / 100 : 0;
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
}

export function formatSydneyDate(value: string | Date | undefined | null, withTime = true) {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(date);
}

function sydneyParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'shortOffset',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return { get };
}

export function isoToSydneyInput(value: unknown) {
  if (!value) return '';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  const { get } = sydneyParts(date);
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

export function sydneyInputToIso(value: string) {
  if (!value) return '';
  const [datePart, timePart] = value.split('T');
  if (!datePart || !timePart) return '';
  const probe = new Date(`${datePart}T${timePart}:00+11:00`);
  const { get } = sydneyParts(probe);
  const tz = get('timeZoneName');
  const match = tz.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!match) return new Date(`${datePart}T${timePart}:00+10:00`).toISOString();
  const hours = match[2].padStart(2, '0');
  const minutes = (match[3] || '00').padStart(2, '0');
  return new Date(`${datePart}T${timePart}:00${match[1]}${hours}:${minutes}`).toISOString();
}

export function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}
