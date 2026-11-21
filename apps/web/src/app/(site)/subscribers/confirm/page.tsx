import type { Metadata } from 'next';
import { TokenAction } from '@/components/forms/TokenAction';

export const metadata: Metadata = { title: 'Confirm subscription' };

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <TokenAction
      token={token || ''}
      endpoint="/subscribers/confirm"
      title="Confirm your letter"
      success="You are confirmed. We will write when there is something useful for families."
      missing="This confirmation link is missing its token."
    />
  );
}
