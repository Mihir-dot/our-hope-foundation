'use client';

import { useEffect, useState } from 'react';
import { Badge, statusTone } from '@/components/ui/Badge';
import { clientFetch, downloadAuthed, errorText } from '@/lib/api';
import { labelize } from '@/lib/format';

type Registration = { id: string; name: string; email: string; phone?: string; status: string; accessibilityNeeds?: string };

export function Registrations({ eventId }: { eventId: string }) {
  const [rows, setRows] = useState<Registration[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      const result = await clientFetch<Registration[]>(`/admin/events/${eventId}/registrations?limit=50`);
      setRows(result.data);
    } catch (err) {
      setError(errorText(err));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function update(id: string, status: string) {
    try {
      await clientFetch(`/admin/registrations/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
    } catch (err) {
      setError(errorText(err));
    }
  }

  return (
    <section style={{ marginTop: '2rem' }}>
      <div className="admin-top">
        <h2>Registrations</h2>
        <button type="button" className="btn btn-secondary btn-small" onClick={() => downloadAuthed(`/admin/events/${eventId}/registrations.csv`, 'registrations.csv')}>
          Download CSV
        </button>
      </div>
      {error ? <p className="notice bad">{error}</p> : null}
      {rows.length === 0 ? <p>No one has registered yet.</p> : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Access needs</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.accessibilityNeeds}</td>
                  <td>
                    <Badge tone={statusTone(row.status)}>{labelize(row.status)}</Badge>
                    <select aria-label={`Status for ${row.name}`} value={row.status} onChange={(event) => update(row.id, event.target.value)}>
                      <option value="registered">Registered</option>
                      <option value="waitlist">Waitlist</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
