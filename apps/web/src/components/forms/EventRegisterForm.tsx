'use client';

import { useState } from 'react';
import { clientFetch, errorText } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

export function EventRegisterForm({ slug }: { slug: string }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', accessibilityNeeds: '', marketingOptIn: false });
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      const result = await clientFetch<{ status?: string }>(`/events/${slug}/register`, {
        method: 'POST',
        auth: false,
        body: JSON.stringify(form),
      });
      setStatus(result.data.status || 'registered');
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  if (status) {
    return (
      <p className="notice">
        {status === 'waitlist'
          ? 'You are on the waitlist. We will email you if a place opens.'
          : 'Your place is confirmed. Check your email for the details.'}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="stack-form">
      <Field label="Name" name="name" required autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      <Field label="Email" name="email" type="email" required autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
      <Field label="Phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
      <Field label="Access needs" name="accessibilityNeeds" as="textarea" hint="Interpreters, step-free entry, a quiet space, or anything else that lets you take part." value={form.accessibilityNeeds} onChange={(event) => setForm({ ...form, accessibilityNeeds: event.target.value })} />
      <label className="check">
        <input type="checkbox" checked={form.marketingOptIn} onChange={(event) => setForm({ ...form, marketingOptIn: event.target.checked })} />
        <span>Send me the occasional family letter</span>
      </label>
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? 'Saving your place…' : 'Register'}</Button>
    </form>
  );
}
