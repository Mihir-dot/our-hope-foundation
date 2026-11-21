import Link from 'next/link';

export function Card({
  children,
  className = '',
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const classes = `card ${href ? 'card-link' : ''} ${className}`.trim();
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return <article className={classes}>{children}</article>;
}
