import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/site/PageHero';
import { serverFetch } from '@/lib/api';
import { formatAUD, labelize } from '@/lib/format';

export const metadata: Metadata = { title: 'Thank you', description: 'Your gift to Our Hope Foundation.' };

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const session = sessionId
    ? await serverFetch<{ status: string; amountCents: number; frequency: string }>(`/donations/session/${encodeURIComponent(sessionId)}`)
    : null;
  const data = session?.data;

  return (
    <>
      <PageHero eyebrow="Thank you" title="Your gift is on its way" lede="Families learn because people choose to give." />
      <section className="section">
        <div className="container narrow">
          {data ? (
            <p className="notice">
              {formatAUD(data.amountCents)} · {labelize(data.frequency)} · {labelize(data.status)}.
              {data.status === 'succeeded' ? ' A receipt will arrive by email if Stripe has your address.' : ' If the payment is still processing, the receipt follows once it clears.'}
            </p>
          ) : (
            <p>If you completed a gift, the receipt will arrive by email. If you closed the window early, you can try again.</p>
          )}
          <p>
            <Link href="/">Return home</Link>
          </p>
        </div>
      </section>
    </>
  );
}
