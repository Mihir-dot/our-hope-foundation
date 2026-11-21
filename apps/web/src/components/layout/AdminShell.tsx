'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HopeLogo } from '@/components/brand/HopeLogo';
import { Badge } from '@/components/ui/Badge';
import type { SessionUser } from '@/lib/types';

const NAV: { href: string; label: string; roles: SessionUser['role'][] }[] = [
  { href: '/admin', label: 'Dashboard', roles: ['owner', 'admin', 'editor', 'finance'] },
  { href: '/admin/pages', label: 'Pages', roles: ['owner', 'admin', 'editor'] },
  { href: '/admin/menus', label: 'Menus', roles: ['owner', 'admin', 'editor'] },
  { href: '/admin/programs', label: 'Programs', roles: ['owner', 'admin', 'editor'] },
  { href: '/admin/pathways', label: 'Pathways', roles: ['owner', 'admin', 'editor'] },
  { href: '/admin/events', label: 'Events', roles: ['owner', 'admin', 'editor'] },
  { href: '/admin/resources', label: 'Resources', roles: ['owner', 'admin', 'editor'] },
  { href: '/admin/stories', label: 'Stories', roles: ['owner', 'admin', 'editor'] },
  { href: '/admin/speakers', label: 'Speakers', roles: ['owner', 'admin', 'editor'] },
  { href: '/admin/media', label: 'Media', roles: ['owner', 'admin', 'editor'] },
  { href: '/admin/donations', label: 'Donations', roles: ['owner', 'admin', 'finance'] },
  { href: '/admin/enquiries', label: 'Enquiries', roles: ['owner', 'admin'] },
  { href: '/admin/subscribers', label: 'Subscribers', roles: ['owner', 'admin'] },
  { href: '/admin/users', label: 'Users', roles: ['owner'] },
  { href: '/admin/settings', label: 'Settings', roles: ['owner'] },
  { href: '/admin/audit', label: 'Audit', roles: ['owner', 'admin'] },
];

export function AdminShell({
  children,
  user,
  onSignOut,
}: {
  children: React.ReactNode;
  user: SessionUser;
  onSignOut: () => void;
}) {
  const pathname = usePathname();
  const links = NAV.filter((item) => item.roles.includes(user.role));

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link href="/admin" className="admin-brand">
          <HopeLogo variant="mark" decorative className="brand-mark" />
          <span>
            <strong>Our Hope</strong>
            <small>Staff</small>
          </span>
        </Link>
        <nav className="admin-nav" aria-label="Admin">
          {links.map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-user">
          <strong>{user.name}</strong>
          <span className="meta">{user.email}</span>
          <Badge tone="info">{user.role}</Badge>
          <button type="button" className="btn btn-secondary btn-small" onClick={onSignOut}>
            Sign out
          </button>
          <Link href="/" className="meta">View the public site</Link>
        </div>
      </aside>
      <main id="main" className="admin-main">{children}</main>
    </div>
  );
}
