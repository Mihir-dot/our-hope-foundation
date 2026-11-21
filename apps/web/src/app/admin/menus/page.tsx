'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { clientFetch, errorText } from '@/lib/api';
import type { MenuItem } from '@/lib/types';

const locations = ['header', 'footer', 'legal'] as const;

type Menu = { location: string; items: MenuItem[] };

export default function MenusPage() {
  const [menus, setMenus] = useState<Record<string, MenuItem[]>>({ header: [], footer: [], legal: [] });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientFetch<Menu[]>('/admin/menus')
      .then((result) => {
        const next = { header: [], footer: [], legal: [] } as Record<string, MenuItem[]>;
        for (const menu of result.data) next[menu.location] = menu.items || [];
        setMenus(next);
      })
      .catch((err) => setError(errorText(err)))
      .finally(() => setLoading(false));
  }, []);

  function update(location: string, items: MenuItem[]) {
    setMenus((current) => ({ ...current, [location]: items }));
  }

  async function save(location: string) {
    setError('');
    setMessage('');
    try {
      await clientFetch(`/admin/menus/${location}`, {
        method: 'PUT',
        body: JSON.stringify({ items: menus[location] }),
      });
      setMessage(`${location} menu saved.`);
    } catch (err) {
      setError(errorText(err));
    }
  }

  if (loading) return <Spinner label="Loading menus" />;

  return (
    <section>
      <p className="eyebrow">Admin</p>
      <h1>Menus</h1>
      <p>Header, footer, and legal links. A child link sits under its parent.</p>
      {message ? <p className="notice">{message}</p> : null}
      {error ? <p className="notice bad" role="alert">{error}</p> : null}
      {locations.map((location) => (
        <MenuEditor
          key={location}
          location={location}
          items={menus[location] || []}
          onChange={(items) => update(location, items)}
          onSave={() => save(location)}
        />
      ))}
    </section>
  );
}

function MenuEditor({
  location,
  items,
  onChange,
  onSave,
}: {
  location: string;
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
  onSave: () => void;
}) {
  function edit(index: number, patch: Partial<MenuItem>) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  return (
    <section className="card" style={{ marginTop: '1rem' }}>
      <h2 style={{ textTransform: 'capitalize' }}>{location}</h2>
      {items.map((item, index) => (
        <div key={`${location}-${index}`} className="form-grid two" style={{ marginBottom: '0.8rem' }}>
          <Field label="Label" name={`${location}-label-${index}`} value={item.label} onChange={(event) => edit(index, { label: event.target.value })} />
          <Field label="Link" name={`${location}-href-${index}`} value={item.href} onChange={(event) => edit(index, { href: event.target.value })} />
          <div className="span-2 cluster">
            <button type="button" className="btn btn-ghost btn-small" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
          </div>
        </div>
      ))}
      <div className="cluster">
        <button type="button" className="btn btn-secondary btn-small" onClick={() => onChange([...items, { label: 'New link', href: '/' }])}>Add link</button>
        <Button type="button" onClick={onSave}>Save {location}</Button>
      </div>
    </section>
  );
}
