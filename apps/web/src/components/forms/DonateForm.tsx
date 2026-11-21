'use client';

import { useMemo, useState } from 'react';
import { brand } from '@ohf/shared';
import { clientFetch, errorText } from '@/lib/api';
import { formatAUD } from '@/lib/format';
import { HeartPulse } from '@/components/motion/MagneticButton';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

export function DonateForm({
  presets,
  dgr,
}: {
  presets?: number[];
  dgr?: boolean;
}) {
  const amounts = presets?.length ? presets : [...brand.donationPresetsCents];
  const [selected, setSelected] = useState(amounts[1] ?? amounts[0] ?? 5000);
  const [custom, setCustom] = useState('');
  const [monthly, setMonthly] = useState(false);
  const [dedication, setDedication] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const amountCents = useMemo(() => {
    if (custom.trim()) {
      const dollars = Number(custom);
      if (!Number.isFinite(dollars)) return 0;
      return Math.round(dollars * 100);
    }
    return selected;
  }, [custom, selected]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (amountCents < brand.donationMinCents) {
      setError('The smallest gift is $2.');
      return;
    }
    if (amountCents > brand.donationMaxCents) {
      setError('That amount is larger than we can accept online. Please write to us.');
      return;
    }
    setPending(true);
    try {
      const result = await clientFetch<{ url: string }>('/donations/checkout', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          frequency: monthly ? 'monthly' : 'one_off',
          amountCents,
          dedication,
        }),
      });
      if (result.data.url) window.location.assign(result.data.url);
    } catch (err) {
      setError(errorText(err));
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="stack-form">
      <div className="cluster" role="group" aria-label="Gift frequency">
        <button type="button" className={`choice ${monthly ? '' : 'is-selected'}`} aria-pressed={!monthly} onClick={() => setMonthly(false)}>
          One-off
        </button>
        <button type="button" className={`choice ${monthly ? 'is-selected' : ''}`} aria-pressed={monthly} onClick={() => setMonthly(true)}>
          Monthly
        </button>
      </div>
      <div className="choice-row" role="group" aria-label="Suggested amounts">
        {amounts.map((cents) => (
          <button
            key={cents}
            type="button"
            className={`choice preset ${!custom && selected === cents ? 'is-selected' : ''}`}
            aria-pressed={!custom && selected === cents}
            onClick={() => {
              setSelected(cents);
              setCustom('');
            }}
          >
            {formatAUD(cents)}
          </button>
        ))}
      </div>
      <Field
        label="Other amount (AUD)"
        name="amount"
        inputMode="decimal"
        placeholder="40"
        value={custom}
        onChange={(event) => setCustom(event.target.value)}
        hint={amountCents ? `You are giving ${formatAUD(amountCents)}${monthly ? ' each month' : ''}.` : 'Enter at least $2.'}
      />
      <Field
        label="Dedication (optional)"
        name="dedication"
        value={dedication}
        maxLength={240}
        onChange={(event) => setDedication(event.target.value)}
        hint="A name or note to print with the receipt."
      />
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      <Button type="submit" variant="donate" className="btn-glow" disabled={pending}>
        {pending ? 'Opening checkout…' : monthly ? 'Give monthly' : 'Donate'} <HeartPulse />
      </Button>
      <p className="field-hint">
        Payments are processed by Stripe in Australian dollars. No GST is added.
        {dgr ? ' This gift is tax-deductible.' : ' A tax-deductible receipt is issued only when DGR endorsement is recorded.'}
        {' '}
        <a href="/donor-terms">Donor terms</a>
      </p>
    </form>
  );
}
