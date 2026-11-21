'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { HopeLogo } from '@/components/brand/HopeLogo';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { clientFetch, errorText, refreshSession } from '@/lib/api';
import { setAccessToken } from '@/lib/auth-token';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get('next') || '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [pending, setPending] = useState(false);
  const [forgot, setForgot] = useState(false);

  useEffect(() => {
    refreshSession().then((user) => {
      if (user) router.replace(nextPath.startsWith('/admin') ? nextPath : '/admin');
    });
  }, [router, nextPath]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      if (forgot) {
        await clientFetch('/auth/forgot-password', { method: 'POST', auth: false, body: JSON.stringify({ email }) });
        setInfo('If that email belongs to a staff account, a reset link is on its way.');
      } else {
        const result = await clientFetch<{ accessToken: string }>('/auth/login', {
          method: 'POST',
          auth: false,
          body: JSON.stringify({ email, password }),
        });
        setAccessToken(result.data.accessToken);
        router.replace(nextPath.startsWith('/admin') ? nextPath : '/admin');
      }
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="login-card">
      <HopeLogo variant="mark" className="page-hero-mark" />
      <h1>{forgot ? 'Reset password' : 'Staff sign in'}</h1>
      <p>{forgot ? 'We will email a link that lasts one hour.' : 'For people who edit Our Hope Foundation.'}</p>
      <form onSubmit={onSubmit} className="stack-form">
        <Field label="Email" name="email" type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} />
        {forgot ? null : (
          <Field label="Password" name="password" type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        )}
        {info ? <p className="notice">{info}</p> : null}
        {error ? <p className="field-error" role="alert">{error}</p> : null}
        <Button type="submit" disabled={pending}>{pending ? 'Please wait…' : forgot ? 'Send link' : 'Sign in'}</Button>
      </form>
      <p>
        <button type="button" className="btn btn-ghost" onClick={() => { setForgot((value) => !value); setError(''); setInfo(''); }}>
          {forgot ? 'Back to sign in' : 'Forgot password'}
        </button>
      </p>
      <p><Link href="/">Return to the public site</Link></p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p>Loading sign in…</p>}>
      <LoginForm />
    </Suspense>
  );
}
