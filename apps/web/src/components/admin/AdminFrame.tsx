'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { Spinner } from '@/components/ui/Spinner';
import { clientFetch, refreshSession } from '@/lib/api';
import { setAccessToken } from '@/lib/auth-token';
import type { SessionUser } from '@/lib/types';

export function AdminFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = pathname === '/admin/login' || pathname.startsWith('/admin/login/') || pathname === '/admin/reset-password' || pathname.startsWith('/admin/reset-password/');
  if (bare) return <main id="main" className="login-screen">{children}</main>;
  return <SessionGate>{children}</SessionGate>;
}

function SessionGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let cancel = false;
    refreshSession().then((session) => {
      if (cancel) return;
      if (!session) {
        router.replace('/admin/login');
        return;
      }
      setUser(session);
    });
    return () => {
      cancel = true;
    };
  }, [router]);

  if (!user) {
    return (
      <main id="main" className="login-screen">
        <Spinner label="Checking your session" />
      </main>
    );
  }

  return (
    <AdminShell
      user={user}
      onSignOut={async () => {
        await clientFetch('/auth/logout', { method: 'POST' }).catch(() => undefined);
        setAccessToken(null);
        router.replace('/admin/login');
      }}
    >
      {children}
    </AdminShell>
  );
}
