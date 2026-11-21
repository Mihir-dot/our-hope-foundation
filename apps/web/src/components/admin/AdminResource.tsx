'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { clientFetch, errorText } from '@/lib/api';
import { formatAUD, formatSydneyDate, isoToSydneyInput, labelize, sydneyInputToIso } from '@/lib/format';
import type { ApiMeta } from '@/lib/types';
import type { FieldSpec, ResourceConfig } from './resources';

type Values = Record<string, string | boolean | string[]>;
type Row = Record<string, unknown> & { id?: string };

function textOf(value: unknown) {
  return value == null ? '' : String(value);
}

function idList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && 'id' in item) return String((item as { id: unknown }).id);
      return String(item);
    })
    .filter(Boolean);
}

function blank(config: ResourceConfig): Values {
  const values: Values = {};
  for (const field of config.fields) {
    if (field.type === 'checkbox') values[field.name] = false;
    else if (field.type === 'checks') values[field.name] = [];
    else if (field.type === 'json') values[field.name] = field.name === 'blocks' ? '[]' : '[]';
    else if (field.name === 'status') values[field.name] = 'draft';
    else if (field.name === 'timezone') values[field.name] = 'Australia/Sydney';
    else if (field.name === 'capacity') values[field.name] = '100';
    else if (field.name === 'language') values[field.name] = 'en';
    else if (field.name === 'role') values[field.name] = 'editor';
    else if ((field.name === 'format' || field.name === 'type') && field.options?.[0]) values[field.name] = field.options[0].value;
    else values[field.name] = '';
  }
  return values;
}

function hydrate(config: ResourceConfig, doc: Record<string, unknown>): Values {
  const values = blank(config);
  const seo = (doc.seo ?? {}) as { title?: string; description?: string };
  for (const field of config.fields) {
    if (field.name === 'seoTitle') {
      values.seoTitle = seo.title ?? '';
      continue;
    }
    if (field.name === 'seoDescription') {
      values.seoDescription = seo.description ?? '';
      continue;
    }
    const raw = doc[field.name];
    if (field.type === 'checkbox') values[field.name] = Boolean(raw);
    else if (field.type === 'checks') values[field.name] = idList(raw);
    else if (field.type === 'json') values[field.name] = JSON.stringify(raw ?? [], null, 2);
    else if (field.type === 'datetime') values[field.name] = isoToSydneyInput(raw);
    else if (config.readOnly && field.name === 'amountCents') values[field.name] = formatAUD(Number(raw) || 0);
    else if (config.readOnly && field.name === 'createdAt') values[field.name] = formatSydneyDate(textOf(raw));
    else if (config.readOnly && field.name === 'frequency') values[field.name] = labelize(textOf(raw));
    else if (field.type === 'number') values[field.name] = raw == null || raw === '' ? '' : String(raw);
    else values[field.name] = textOf(raw);
  }
  return values;
}

function prepare(config: ResourceConfig, values: Values, isNew: boolean) {
  const payload: Record<string, unknown> = {};
  for (const field of config.fields) {
    if (field.readOnly || field.name === 'seoTitle' || field.name === 'seoDescription') continue;
    if (!isNew && field.name === 'email' && config.endpoint.endsWith('/users')) continue;
    const value = values[field.name];
    if (field.type === 'password') {
      if (!textOf(value)) continue;
      payload[field.name] = textOf(value);
      continue;
    }
    if (field.type === 'checkbox') {
      payload[field.name] = Boolean(value);
      continue;
    }
    if (field.type === 'checks') {
      payload[field.name] = Array.isArray(value) ? value : [];
      continue;
    }
    if (field.type === 'json') {
      const parsed = JSON.parse(textOf(value) || 'null');
      payload[field.name] = parsed ?? [];
      continue;
    }
    if (field.type === 'number') {
      const raw = textOf(value).trim();
      if (!raw) continue;
      payload[field.name] = Number(raw);
      continue;
    }
    if (field.type === 'datetime') {
      const iso = sydneyInputToIso(textOf(value));
      if (iso) payload[field.name] = iso;
      continue;
    }
    const text = textOf(value);
    if (field.name.endsWith('Id')) {
      payload[field.name] = text || null;
      continue;
    }
    if (field.type === 'select' && text === '' && !field.required) continue;
    payload[field.name] = text;
  }
  if (config.fields.some((field) => field.name === 'seoTitle')) {
    payload.seo = { title: textOf(values.seoTitle), description: textOf(values.seoDescription) };
  }
  return payload;
}

function cell(row: Row, column: ResourceConfig['columns'][number]) {
  const value = row[column.key];
  if (column.kind === 'money') return formatAUD(Number(value) || 0);
  if (column.kind === 'date') return formatSydneyDate(typeof value === 'string' ? value : undefined);
  if (column.kind === 'bool') return value ? 'Yes' : 'No';
  if (column.kind === 'status') return <Badge tone={statusTone(textOf(value))}>{labelize(textOf(value))}</Badge>;
  return textOf(value);
}

export function AdminList({ config }: { config: ResourceConfig }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const hasStatus = config.columns.some((column) => column.key === 'status');

  async function load(nextPage = page, query = q, nextStatus = status) {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(nextPage), limit: '20' });
      if (query.trim()) params.set('q', query.trim());
      if (nextStatus) params.set('status', nextStatus);
      const result = await clientFetch<Row[]>(`${config.endpoint}?${params}`);
      setRows(Array.isArray(result.data) ? result.data : []);
      setMeta(result.meta ?? null);
      setPage(nextPage);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1, '', '');
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.endpoint]);

  return (
    <section>
      <div className="admin-top">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>{config.title}</h1>
        </div>
        {config.create ? <Button href={`${config.endpoint}/new`}>New {config.singular.toLowerCase()}</Button> : null}
      </div>
      <form
        className="inline-search"
        onSubmit={(event) => {
          event.preventDefault();
          load(1, q, status);
        }}
      >
        <Field label={`Search ${config.title.toLowerCase()}`} name="q" value={q} onChange={(event) => setQ(event.target.value)} />
        <button className="btn btn-secondary" type="submit">Search</button>
      </form>
      {hasStatus ? (
        <div className="field" style={{ maxWidth: 240, marginBottom: '1rem' }}>
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              load(1, q, event.target.value);
            }}
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
            <option value="new">New</option>
            <option value="in_progress">In progress</option>
            <option value="closed">Closed</option>
            <option value="pending">Pending</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      ) : null}
      {error ? <p className="notice bad" role="alert">{error}</p> : null}
      {loading ? <Spinner label={`Loading ${config.title.toLowerCase()}`} /> : null}
      {!loading && rows.length === 0 ? <EmptyState title={`No ${config.title.toLowerCase()} yet`} /> : null}
      {rows.length ? (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                {config.columns.map((column) => (
                  <th key={column.key} scope="col">{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id || textOf(row.slug) || textOf(row.email)}>
                  {config.columns.map((column, index) => (
                    <td key={column.key}>
                      {index === 0 && row.id ? <Link href={`${config.endpoint}/${row.id}`}>{cell(row, column)}</Link> : cell(row, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {meta && (meta.pages || 1) > 1 ? (
        <div className="pager">
          <button type="button" className="btn btn-secondary btn-small" disabled={page <= 1} onClick={() => load(page - 1)}>Previous</button>
          <span>Page {meta.page || page} of {meta.pages}</span>
          <button type="button" className="btn btn-secondary btn-small" disabled={page >= (meta.pages || 1)} onClick={() => load(page + 1)}>Next</button>
        </div>
      ) : null}
    </section>
  );
}

export function AdminEditor({ config, id }: { config: ResourceConfig; id: string }) {
  const router = useRouter();
  const isNew = id === 'new';
  const [values, setValues] = useState<Values>(() => blank(config));
  const [choices, setChoices] = useState<Record<string, { value: string; label: string }[]>>({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancel = false;
    const loads = config.fields.filter((field) => field.optionsFrom);
    if (!loads.length) return;
    Promise.all(
      loads.map(async (field) => {
        const result = await clientFetch<Row[]>(field.optionsFrom || '');
        const options = (result.data || []).map((row) => ({
          value: textOf(row.id),
          label: textOf(row[field.optionLabel || 'title'] || row.name || row.email || row.id),
        }));
        return [field.name, options] as const;
      }),
    )
      .then((entries) => {
        if (!cancel) setChoices(Object.fromEntries(entries));
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [config]);

  useEffect(() => {
    if (isNew) {
      setValues(blank(config));
      setLoading(false);
      return;
    }
    let cancel = false;
    setLoading(true);
    clientFetch<Record<string, unknown>>(`${config.endpoint}/${id}`)
      .then((result) => {
        if (!cancel) setValues(hydrate(config, result.data));
      })
      .catch((err) => {
        if (!cancel) setError(errorText(err));
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [config, id, isNew]);

  function setValue(name: string, value: string | boolean | string[]) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (isNew && config.endpoint.endsWith('/users') && !textOf(values.password)) {
        throw new Error('A password is required for a new user.');
      }
      const payload = prepare(config, values, isNew);
      if (isNew) {
        const created = await clientFetch<{ id: string }>(config.endpoint, { method: 'POST', body: JSON.stringify(payload) });
        router.replace(`${config.endpoint}/${created.data.id}`);
        return;
      }
      await clientFetch(`${config.endpoint}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      setMessage('Saved.');
    } catch (err) {
      setError(err instanceof SyntaxError ? 'One of the JSON fields could not be read.' : errorText(err));
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    setError('');
    try {
      await clientFetch(`${config.endpoint}/${id}/publish`, { method: 'POST' });
      setValues((current) => ({ ...current, status: 'published' }));
      setMessage('Published.');
    } catch (err) {
      setError(errorText(err));
    }
  }

  async function remove() {
    const verb = config.remove === 'archive' ? 'Archive' : 'Delete';
    if (!window.confirm(`${verb} this ${config.singular.toLowerCase()}?`)) return;
    try {
      await clientFetch(`${config.endpoint}/${id}`, { method: 'DELETE' });
      router.push(config.endpoint);
    } catch (err) {
      setError(errorText(err));
    }
  }

  if (loading) return <Spinner label="Loading record" />;

  return (
    <section>
      <div className="admin-top">
        <div>
          <p className="eyebrow"><Link href={config.endpoint}>{config.title}</Link></p>
          <h1>{isNew ? `New ${config.singular.toLowerCase()}` : textOf(values.title || values.name || config.singular)}</h1>
        </div>
        <div className="cluster">
          {config.publish && !isNew ? <Button type="button" variant="secondary" onClick={publish}>Publish</Button> : null}
          {config.remove && !isNew ? (
            <button type="button" className="btn btn-ghost" onClick={remove}>{config.remove === 'archive' ? 'Archive' : 'Delete'}</button>
          ) : null}
        </div>
      </div>
      <form onSubmit={onSubmit} className="form-grid two card">
        {config.fields.map((field) => (
          <EditorField
            key={field.name}
            field={field}
            value={values[field.name]}
            options={choices[field.name]}
            disabled={Boolean(config.readOnly || field.readOnly || (!isNew && field.name === 'email' && config.endpoint.endsWith('/users')))}
            onChange={(value) => setValue(field.name, value)}
          />
        ))}
        {message ? <p className="notice span-2">{message}</p> : null}
        {error ? <p className="field-error span-2" role="alert">{error}</p> : null}
        {config.readOnly ? null : (
          <div className="span-2">
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : isNew ? 'Create' : 'Save'}</Button>
          </div>
        )}
      </form>
    </section>
  );
}

function EditorField({
  field,
  value,
  options,
  disabled,
  onChange,
}: {
  field: FieldSpec;
  value: string | boolean | string[] | undefined;
  options?: { value: string; label: string }[];
  disabled: boolean;
  onChange: (value: string | boolean | string[]) => void;
}) {
  const span = field.span === 2 ? 'span-2' : '';
  if (field.type === 'checkbox') {
    return (
      <label className={`check ${span}`}>
        <input type="checkbox" checked={Boolean(value)} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
        <span>{field.label}</span>
      </label>
    );
  }
  if (field.type === 'checks') {
    const selected = Array.isArray(value) ? value : [];
    const list = options || field.options || [];
    return (
      <fieldset className={span} disabled={disabled}>
        <legend className="fieldset-label">{field.label}</legend>
        <div className="check-grid">
          {list.map((option) => (
            <label key={option.value} className="check">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={(event) => {
                  onChange(event.target.checked ? [...selected, option.value] : selected.filter((item) => item !== option.value));
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {field.hint ? <p className="field-hint">{field.hint}</p> : null}
      </fieldset>
    );
  }
  if (field.type === 'select') {
    return (
      <div className={span}>
        <Field
          label={field.label}
          name={field.name}
          as="select"
          hint={field.hint}
          required={field.required}
          disabled={disabled}
          value={textOf(value)}
          options={field.options || []}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    );
  }
  return (
    <div className={span}>
      <Field
        label={field.label}
        name={field.name}
        as={field.type === 'textarea' || field.type === 'json' ? 'textarea' : 'input'}
        type={field.type === 'textarea' || field.type === 'json' ? undefined : field.type}
        hint={field.hint}
        required={field.required && field.type !== 'password'}
        disabled={disabled}
        rows={field.rows || (field.type === 'json' ? 12 : undefined)}
        value={textOf(value)}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
