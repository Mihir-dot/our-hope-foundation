'use client';

import { useState } from 'react';
import { clientFetch, errorText } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export function ResourceDownload({ slug, externalUrl, label = 'Open the resource' }: { slug: string; externalUrl?: string; label?: string }) {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function open() {
    setPending(true);
    setError('');
    try {
      const result = await clientFetch<{ url?: string }>(`/resources/${slug}/download`, { method: 'POST', auth: false });
      const url = result.data.url || externalUrl;
      if (url) window.location.assign(url);
      else setError('This resource does not have a file yet.');
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="stack-form">
      <Button type="button" onClick={open} disabled={pending}>{pending ? 'Opening…' : label}</Button>
      {error ? <p className="field-error" role="alert">{error}</p> : null}
    </div>
  );
}
