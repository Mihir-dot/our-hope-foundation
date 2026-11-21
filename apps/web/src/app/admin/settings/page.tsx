'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { clientFetch, errorText } from '@/lib/api';

type Settings = {
  legalName?: string;
  tagline?: string;
  missionLine?: string;
  abn?: string;
  acncNumber?: string;
  charityStatus?: string;
  dgrEndorsed?: boolean;
  ndisProvider?: boolean;
  email?: string;
  phone?: string;
  address?: string;
  acknowledgement?: string;
  social?: { facebook?: string; instagram?: string; linkedin?: string; youtube?: string };
  donationPresetsCents?: number[];
  impactStats?: { label: string; value: string; note?: string }[];
  fundraisingLicences?: Record<string, string>;
  seoTitle?: string;
  seoDescription?: string;
};

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>({ social: {} });
  const [presets, setPresets] = useState('25, 50, 100, 250');
  const [stats, setStats] = useState('[]');
  const [licences, setLicences] = useState('{}');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientFetch<Settings>('/admin/settings')
      .then((result) => {
        setForm(result.data);
        setPresets((result.data.donationPresetsCents || []).map((cents) => cents / 100).join(', '));
        setStats(JSON.stringify(result.data.impactStats || [], null, 2));
        setLicences(JSON.stringify(result.data.fundraisingLicences || {}, null, 2));
      })
      .catch((err) => setError(errorText(err)))
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const donationPresetsCents = presets
        .split(',')
        .map((part) => Math.round(Number(part.trim()) * 100))
        .filter((cents) => Number.isFinite(cents) && cents >= 200);
      const payload: Record<string, unknown> = {
        legalName: form.legalName,
        tagline: form.tagline,
        missionLine: form.missionLine,
        abn: form.abn,
        acncNumber: form.acncNumber,
        charityStatus: form.charityStatus,
        dgrEndorsed: Boolean(form.dgrEndorsed),
        ndisProvider: Boolean(form.ndisProvider),
        phone: form.phone,
        address: form.address,
        acknowledgement: form.acknowledgement,
        social: form.social,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        donationPresetsCents,
        impactStats: JSON.parse(stats),
        fundraisingLicences: JSON.parse(licences),
      };
      if (form.email) payload.email = form.email;
      await clientFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(payload) });
      setMessage('Settings saved.');
    } catch (err) {
      setError(err instanceof SyntaxError ? 'Impact stats and licences must be valid JSON.' : errorText(err));
    }
  }

  if (loading) return <Spinner label="Loading settings" />;

  return (
    <section>
      <p className="eyebrow">Admin</p>
      <h1>Settings</h1>
      <p>Only an owner can change the public charity record.</p>
      <form onSubmit={save} className="form-grid two card">
        <Field label="Legal name" name="legalName" value={form.legalName || ''} onChange={(event) => set('legalName', event.target.value)} />
        <Field label="Email" name="email" type="email" value={form.email || ''} onChange={(event) => set('email', event.target.value)} />
        <Field label="Tagline" name="tagline" value={form.tagline || ''} onChange={(event) => set('tagline', event.target.value)} className="span-2" />
        <Field label="Mission line" name="missionLine" value={form.missionLine || ''} onChange={(event) => set('missionLine', event.target.value)} className="span-2" />
        <Field label="ABN" name="abn" value={form.abn || ''} onChange={(event) => set('abn', event.target.value)} />
        <Field label="ACNC number" name="acncNumber" value={form.acncNumber || ''} onChange={(event) => set('acncNumber', event.target.value)} />
        <Field label="Charity status" name="charityStatus" value={form.charityStatus || ''} onChange={(event) => set('charityStatus', event.target.value)} />
        <Field label="Phone" name="phone" value={form.phone || ''} onChange={(event) => set('phone', event.target.value)} />
        <Field label="Address" name="address" value={form.address || ''} onChange={(event) => set('address', event.target.value)} className="span-2" />
        <label className="check"><input type="checkbox" checked={Boolean(form.dgrEndorsed)} onChange={(event) => set('dgrEndorsed', event.target.checked)} /><span>DGR endorsed</span></label>
        <label className="check"><input type="checkbox" checked={Boolean(form.ndisProvider)} onChange={(event) => set('ndisProvider', event.target.checked)} /><span>NDIS provider</span></label>
        <Field label="Facebook" name="facebook" value={form.social?.facebook || ''} onChange={(event) => set('social', { ...form.social, facebook: event.target.value })} />
        <Field label="Instagram" name="instagram" value={form.social?.instagram || ''} onChange={(event) => set('social', { ...form.social, instagram: event.target.value })} />
        <Field label="LinkedIn" name="linkedin" value={form.social?.linkedin || ''} onChange={(event) => set('social', { ...form.social, linkedin: event.target.value })} />
        <Field label="YouTube" name="youtube" value={form.social?.youtube || ''} onChange={(event) => set('social', { ...form.social, youtube: event.target.value })} />
        <Field label="Donation presets (dollars)" name="presets" value={presets} onChange={(event) => setPresets(event.target.value)} hint="Comma-separated, for example 25, 50, 100, 250" className="span-2" />
        <Field label="Acknowledgement" name="acknowledgement" as="textarea" value={form.acknowledgement || ''} onChange={(event) => set('acknowledgement', event.target.value)} className="span-2" />
        <Field label="Impact stats JSON" name="stats" as="textarea" value={stats} onChange={(event) => setStats(event.target.value)} className="span-2" />
        <Field label="Fundraising licences JSON" name="licences" as="textarea" value={licences} onChange={(event) => setLicences(event.target.value)} className="span-2" />
        <Field label="SEO title" name="seoTitle" value={form.seoTitle || ''} onChange={(event) => set('seoTitle', event.target.value)} />
        <Field label="SEO description" name="seoDescription" value={form.seoDescription || ''} onChange={(event) => set('seoDescription', event.target.value)} />
        {message ? <p className="notice span-2">{message}</p> : null}
        {error ? <p className="field-error span-2" role="alert">{error}</p> : null}
        <div className="span-2"><Button type="submit">Save settings</Button></div>
      </form>
    </section>
  );
}
