import Link from 'next/link';

type Variant = 'primary' | 'donate' | 'secondary' | 'ghost';

const variantClass: Record<Variant, string> = {
  primary: 'btn btn-primary',
  donate: 'btn btn-donate',
  secondary: 'btn btn-secondary',
  ghost: 'btn btn-ghost',
};

type Common = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

type ButtonAsButton = Common & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = Common & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className'>;

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const variant = props.variant ?? 'primary';
  const className = `${variantClass[variant]} ${props.className ?? ''}`.trim();

  if ('href' in props && props.href) {
    const { href, children, variant: _variant, className: _className, ...rest } = props;
    if (href.startsWith('/')) {
      return (
        <Link href={href} className={className} {...rest}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }

  const buttonProps = props as ButtonAsButton;
  const { children, variant: _variant, className: _className, type = 'button', ...rest } = buttonProps;
  return (
    <button type={type} className={className} {...rest}>
      {children}
    </button>
  );
}
