'use client';

import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { clientFetch, errorText } from '@/lib/api';
import { formatSydneyDate } from '@/lib/format';

type AuditRow = {
  id?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  summary?: string;
  ip?: string;
  at?: string;
};

export default function AuditPage() {
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    clientFetch<AuditRow[]>('/admin/audit?limit=50')
      .then((result) => setRows(Array.isArray(result.data) ? result.data : []))
      .catch((err) => {
        const message = errorText(err);
        if (message.toLowerCase().includes('not found') || message.toLowerCase().includes('forbidden')) setUnavailable(true);
        else setError(message);
      });
  }, []);

  return (
    <section>
      <p className="eyebrow">Admin</p>
      <h1>Audit</h1>
      <p>Sign-ins, publishes, edits, and deletions are written on the server with the staff member, action, and time.</p>
      {error ? <p className="notice bad" role="alert">{error}</p> : null}
      {unavailable ? (
        <div className="card">
          <h2>Log is kept on the server</h2>
          <p>This API records audit entries for content changes and sign-ins. It does not publish a list route yet, so the entries stay in the database rather than this screen.</p>
        </div>
      ) : null}
      {rows === null && !unavailable && !error ? <Spinner label="Loading the audit log" /> : null}
      {rows?.length ? (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>Record</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id || index}>
                  <td>{formatSydneyDate(row.at)}</td>
                  <td>{row.action}</td>
                  <td>{row.entity} {row.entityId}</td>
                  <td>{row.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
