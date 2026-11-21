'use client';

import { AdminList } from '@/components/admin/AdminResource';
import { resources } from '@/components/admin/resources';

export default function PagesList() {
  return <AdminList config={resources.page} />;
}
