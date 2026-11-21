'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { clientFetch, errorText } from '@/lib/api';

type MediaItem = {
  id: string;
  url?: string;
  alt?: string;
  mime?: string;
  originalName?: string;
  bytes?: number;
};

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [alt, setAlt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  async function load() {
    const result = await clientFetch<MediaItem[]>('/admin/media?limit=50');
    setItems(result.data);
  }

  useEffect(() => {
    load().catch((err) => setError(errorText(err))).finally(() => setLoading(false));
  }, []);

  async function upload(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError('Choose a JPEG, PNG, WebP, or PDF.');
      return;
    }
    setPending(true);
    setError('');
    try {
      const body = new FormData();
      body.set('file', file);
      body.set('alt', alt);
      await clientFetch('/admin/media/upload', { method: 'POST', body });
      setFile(null);
      setAlt('');
      await load();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this file?')) return;
    try {
      await clientFetch(`/admin/media/${id}`, { method: 'DELETE' });
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(errorText(err));
    }
  }

  return (
    <section>
      <p className="eyebrow">Admin</p>
      <h1>Media</h1>
      <p>Images need alt text. PDFs can be 25 MB. Copy an id into a cover or file field.</p>
      <form onSubmit={upload} className="card form-grid two">
        <Field label="Alt text" name="alt" value={alt} onChange={(event) => setAlt(event.target.value)} hint="Required for images." />
        <div className="field">
          <label htmlFor="file">File</label>
          <input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </div>
        {error ? <p className="field-error span-2" role="alert">{error}</p> : null}
        <div className="span-2">
          <Button type="submit" disabled={pending}>{pending ? 'Uploading…' : 'Upload'}</Button>
        </div>
      </form>
      {loading ? <Spinner label="Loading media" /> : null}
      <div className="media-grid" style={{ marginTop: '1rem' }}>
        {items.map((item) => (
          <article key={item.id} className="card media-card">
            {item.mime?.startsWith('image/') && item.url ? <img src={item.url} alt={item.alt || ''} /> : <p className="meta">{item.mime}</p>}
            <strong>{item.originalName || 'File'}</strong>
            <p className="meta">{item.alt}</p>
            <p className="meta">{item.id}</p>
            <button type="button" className="btn btn-ghost btn-small" onClick={() => remove(item.id)}>Delete</button>
          </article>
        ))}
      </div>
    </section>
  );
}
