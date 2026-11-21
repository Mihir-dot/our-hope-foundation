'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { clientFetch, errorText } from '@/lib/api';
import { formatAUD, formatSydneyDate, labelize } from '@/lib/format';
import type { Enquiry } from '@/lib/types';

type Dashboard = {
  pages: number;
  programs: number;
  resources: number;
  stories: number;
  events: number;
  enquiriesNew: number;
  subscribers: number;
  registrations: number;
  donations: { count: number; amountCents: number };
  donationSeries: { year: number; month: number; amountCents: number; count: number }[];
  recentEnquiries: Enquiry[];
};

const tiles = [
  ['pages', 'Pages'],
  ['programs', 'Programs'],
  ['resources', 'Resources'],
  ['stories', 'Stories'],
  ['events', 'Events'],
  ['enquiriesNew', 'New enquiries'],
  ['subscribers', 'Subscribers'],
  ['registrations', 'Registrations'],
] as const;

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    clientFetch<Dashboard>('/admin/dashboard')
      .then((result) => setData(result.data))
      .catch((err) => setError(errorText(err)));
  }, []);

  if (error) return <p className="notice bad" role="alert">{error}</p>;
  if (!data) return <Spinner label="Loading the dashboard" />;
  const max = Math.max(...data.donationSeries.map((row) => row.amountCents), 1);

  return (
    <section>
      <p className="eyebrow">Admin</p>
      <h1>Dashboard</h1>
      <p className="lede">A quiet view of what families can already read, and what still needs a reply.</p>
      <div className="stat-row" style={{ marginTop: '1.5rem' }}>
        {tiles.map(([key, label]) => (
          <article key={key} className="stat">
            <strong>{data[key]}</strong>
            <h3>{label}</h3>
          </article>
        ))}
        <article className="stat">
          <strong>{formatAUD(data.donations.amountCents)}</strong>
          <h3>Gifts received</h3>
          <p className="meta">{data.donations.count} succeeded</p>
        </article>
      </div>
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2>Gifts, last twelve months</h2>
        {data.donationSeries.length ? (
          <div className="bars" aria-hidden="true">
            {data.donationSeries.map((row) => (
              <span key={`${row.year}-${row.month}`} style={{ height: `${Math.max(8, (row.amountCents / max) * 100)}%` }} title={`${row.month}/${row.year} ${formatAUD(row.amountCents)}`} />
            ))}
          </div>
        ) : (
          <p>No succeeded gifts in this window yet.</p>
        )}
        <ul className="meta">
          {data.donationSeries.map((row) => (
            <li key={`${row.year}-${row.month}`}>{row.month}/{row.year}: {formatAUD(row.amountCents)} · {row.count}</li>
          ))}
        </ul>
      </div>
      <div className="card" style={{ marginTop: '1rem' }}>
        <h2>Recent enquiries</h2>
        {data.recentEnquiries.length === 0 ? <p>No enquiries yet.</p> : (
          <ul>
            {data.recentEnquiries.map((item) => (
              <li key={item.id}>
                <Link href={`/admin/enquiries/${item.id}`}>{item.name || 'Enquiry'}</Link>
                {' · '}
                {labelize(item.type || 'general')}
                {' · '}
                <Badge tone={statusTone(item.status)}>{labelize(item.status || 'new')}</Badge>
                {' · '}
                {formatSydneyDate(item.createdAt)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
