'use client';

import { useState } from 'react';
import { auStates } from '@ohf/shared';
import { clientFetch, errorText } from '@/lib/api';
import { labelize } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

const contactTypes = ['general', 'program', 'ndis', 'media'] as const;
const involveTypes = ['volunteer', 'partnership', 'general'] as const;

export function EnquiryForm({ variant }: { variant: 'contact' | 'involve' }) {
  const types = variant === 'involve' ? involveTypes : contactTypes;
  const [form, setForm] = useState({
    type: types[0],
    name: '',
    email: '',
    phone: '',
    message: '',
    state: '',
    interests: '',
    availability: '',
    organisation: '',
    wwcc: '',
  });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await clientFetch('/enquiries', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          type: form.type,
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
          ...(form.state ? { state: form.state } : {}),
          ...(variant === 'involve'
            ? {
                interests: form.interests.split(',').map((item) => item.trim()).filter(Boolean),
                availability: form.availability,
                organisation: form.organisation,
                ...(form.wwcc ? { wwcc: form.wwcc } : {}),
              }
            : {}),
        }),
      });
      setDone(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return <p className="notice">Thank you. A person from the foundation will read this and reply.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="form-grid two">
      <Field label="I am writing about" name="type" as="select" value={form.type} onChange={(event) => set('type', event.target.value)} options={types.map((type) => ({ value: type, label: labelize(type) }))} />
      <Field label="Name" name="name" required autoComplete="name" value={form.name} onChange={(event) => set('name', event.target.value)} />
      <Field label="Email" name="email" type="email" required autoComplete="email" value={form.email} onChange={(event) => set('email', event.target.value)} />
      <Field label="Phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(event) => set('phone', event.target.value)} />
      <Field label="State" name="state" as="select" value={form.state} onChange={(event) => set('state', event.target.value)} options={[{ value: '', label: 'Prefer not to say' }, ...auStates.map((state) => ({ value: state, label: state }))]} />
      {variant === 'involve' ? (
        <>
          <Field label="Organisation" name="organisation" value={form.organisation} onChange={(event) => set('organisation', event.target.value)} />
          <Field label="Interests" name="interests" hint="Separate with commas" value={form.interests} onChange={(event) => set('interests', event.target.value)} className="span-2" />
          <Field label="Availability" name="availability" value={form.availability} onChange={(event) => set('availability', event.target.value)} className="span-2" />
          <Field
            label="Working with Children Check"
            name="wwcc"
            as="select"
            value={form.wwcc}
            onChange={(event) => set('wwcc', event.target.value)}
            options={[
              { value: '', label: 'Not applicable' },
              { value: 'yes', label: 'Yes, current' },
              { value: 'in-progress', label: 'In progress' },
              { value: 'no', label: 'Not yet' },
            ]}
            hint="Required before volunteering with anyone under 18."
          />
        </>
      ) : null}
      <Field label="Message" name="message" as="textarea" required minLength={10} value={form.message} onChange={(event) => set('message', event.target.value)} className="span-2" />
      {error ? <p className="field-error span-2" role="alert">{error}</p> : null}
      <div className="span-2">
        <Button type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send message'}</Button>
      </div>
    </form>
  );
}
