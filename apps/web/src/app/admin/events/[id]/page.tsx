'use client';

import { useParams } from 'next/navigation';
import { AdminEditor } from '@/components/admin/AdminResource';
import { Registrations } from '@/components/admin/Registrations';
import { resources } from '@/components/admin/resources';

export default function EventEditor() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return (
    <>
      <AdminEditor config={resources.event} id={id} />
      {id !== 'new' ? <Registrations eventId={id} /> : null}
    </>
  );
}
