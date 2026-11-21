type Tone = 'neutral' | 'good' | 'warn' | 'bad' | 'info';

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function statusTone(status?: string): Tone {
  if (!status) return 'neutral';
  if (['published', 'succeeded', 'confirmed', 'registered', 'closed'].includes(status)) return 'good';
  if (['draft', 'pending', 'waitlist', 'in_progress'].includes(status)) return 'warn';
  if (['failed', 'archived', 'cancelled', 'unsubscribed'].includes(status)) return 'bad';
  if (['new', 'online', 'webinar'].includes(status)) return 'info';
  return 'neutral';
}
