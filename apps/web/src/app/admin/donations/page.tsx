'use client';

import { AdminList } from '@/components/admin/AdminResource';
import { downloadAuthed } from '@/lib/api';
import { resources } from '@/components/admin/resources';

export default function DonationsAdminPage() {
  return (
    <>
      <div className="cluster" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary btn-small" onClick={() => downloadAuthed('/admin/donations.csv', 'donations.csv')}>
          Download CSV
        </button>
      </div>
      <AdminList config={resources.donation} />
    </>
  );
}
