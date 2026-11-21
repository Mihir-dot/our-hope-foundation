'use client';

import { useParams } from 'next/navigation';
import { AdminEditor } from '@/components/admin/AdminResource';
import { resources } from '@/components/admin/resources';

export default function StoryEditor() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return <AdminEditor config={resources.story} id={id} />;
}
