'use client';

import { useState } from 'react';
import { clientFetch, errorText } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

export function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    setMessage('');
    try {
      await clientFetch('/subscribers', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email }),
      });
      setEmail('');
      setMessage('Check your inbox to confirm. We will not write until you do.');
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="stack-form">
      <Field
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      {message ? <p className="notice">{message}</p> : null}
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'Sending…' : 'Subscribe'}
      </Button>
    </form>
  );
}
