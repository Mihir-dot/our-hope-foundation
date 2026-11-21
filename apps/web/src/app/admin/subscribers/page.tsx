'use client';

import { useEffect, useState } from 'react';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { clientFetch, downloadAuthed, errorText } from '@/lib/api';
import { formatSydneyDate, labelize } from '@/lib/format';

type Subscriber = { id: string; email: string; status: string; createdAt?: string; confirmedAt?: string };

export default function SubscribersPage() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientFetch<Subscriber[]>('/admin/subscribers?limit=50')
      .then((result) => setRows(result.data))
      .catch((err) => setError(errorText(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="admin-top">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Subscribers</h1>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => downloadAuthed('/admin/subscribers.csv', 'subscribers.csv').catch((err) => setError(errorText(err)))}>
          Download CSV
        </button>
      </div>
      {error ? <p className="notice bad" role="alert">{error}</p> : null}
      {loading ? <Spinner label="Loading subscribers" /> : null}
      {rows.length ? (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Confirmed</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.email}</td>
                  <td><Badge tone={statusTone(row.status)}>{labelize(row.status)}</Badge></td>
                  <td>{formatSydneyDate(row.confirmedAt, false)}</td>
                  <td>{formatSydneyDate(row.createdAt, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
