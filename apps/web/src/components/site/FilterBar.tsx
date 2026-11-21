import Link from 'next/link';

type Option = { value: string; label: string };

export function FilterBar({
  label,
  path,
  param,
  current,
  options,
  keep = {},
  hideAll = false,
}: {
  label: string;
  path: string;
  param: string;
  current?: string;
  options: Option[];
  keep?: Record<string, string | undefined>;
  hideAll?: boolean;
}) {
  function href(value?: string) {
    const search = new URLSearchParams();
    for (const [key, item] of Object.entries(keep)) {
      if (item) search.set(key, item);
    }
    if (value) search.set(param, value);
    const text = search.toString();
    return text ? `${path}?${text}` : path;
  }

  return (
    <div className="filters" role="navigation" aria-label={label}>
      <span className="label">{label}</span>
      {hideAll ? null : (
        <Link href={href()} className="chip" aria-current={!current ? 'true' : undefined}>
          All
        </Link>
      )}
      {options.map((option) => (
        <Link key={option.value} href={href(option.value)} className="chip" aria-current={current === option.value ? 'true' : undefined}>
          {option.label}
        </Link>
      ))}
    </div>
  );
}

export function Pager({
  page,
  pages,
  path,
  query,
}: {
  page: number;
  pages: number;
  path: string;
  query: Record<string, string | undefined>;
}) {
  if (!pages || pages <= 1) return null;
  function href(next: number) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) search.set(key, value);
    }
    if (next > 1) search.set('page', String(next));
    const text = search.toString();
    return text ? `${path}?${text}` : path;
  }
  return (
    <nav className="pager" aria-label="Pagination">
      {page > 1 ? <Link href={href(page - 1)} rel="prev">Previous</Link> : <span />}
      <span>
        Page {page} of {pages}
      </span>
      {page < pages ? <Link href={href(page + 1)} rel="next">Next</Link> : <span />}
    </nav>
  );
}
