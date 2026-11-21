import type { Metadata } from 'next';
import { TokenAction } from '@/components/forms/TokenAction';

export const metadata: Metadata = { title: 'Unsubscribe' };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <TokenAction
      token={token || ''}
      endpoint="/subscribers/unsubscribe"
      title="Unsubscribe"
      success="You are unsubscribed. You will not receive the family letter."
      missing="This unsubscribe link is missing its token."
    />
  );
}
