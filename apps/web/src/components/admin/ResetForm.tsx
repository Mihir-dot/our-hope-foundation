'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { clientFetch, errorText } from '@/lib/api';

export function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(token ? '' : 'This reset link is missing its token.');
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await clientFetch('/auth/reset-password', { method: 'POST', auth: false, body: JSON.stringify({ token, password }) });
      setMessage('Password updated. You can sign in.');
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="login-card">
      <h1>Choose a new password</h1>
      <form onSubmit={onSubmit} className="stack-form">
        <Field label="New password" name="password" type="password" required minLength={10} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} hint="At least 10 characters." />
        {message ? <p className="notice">{message}</p> : null}
        {error ? <p className="field-error" role="alert">{error}</p> : null}
        <Button type="submit" disabled={pending || !token}>{pending ? 'Saving…' : 'Update password'}</Button>
      </form>
      <p><a href="/admin/login">Back to sign in</a></p>
    </div>
  );
}
