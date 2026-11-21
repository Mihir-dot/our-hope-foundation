'use client';

import { AdminList } from '@/components/admin/AdminResource';
import { resources } from '@/components/admin/resources';

export default function UsersAdminPage() {
  return <AdminList config={resources.user} />;
}
