import { Button } from './Button';

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      {body ? <p className="lede">{body}</p> : null}
      {actionHref && actionLabel ? (
        <Button href={actionHref} variant="secondary">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
