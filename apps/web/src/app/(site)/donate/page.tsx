import type { Metadata } from 'next';
import Image from 'next/image';
import { DonateForm } from '@/components/forms/DonateForm';
import { HeartPulse } from '@/components/motion/MagneticButton';
import { Reveal } from '@/components/motion/Reveal';
import { TextReveal } from '@/components/motion/TextReveal';
import { getSettings } from '@/lib/content';
import { siteMedia } from '@/lib/media';

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support families every day. Gifts fund free education programs, webinars and resources.',
};

export default async function DonatePage() {
  const settings = await getSettings();
  return (
    <section className="section donate-section">
      <div className="container donate-grid">
        <Reveal>
          <p className="eyebrow">Your support changes lives</p>
          <TextReveal as="h1">Support families every day</TextReveal>
          <p className="lede">
            Your donation funds free education programs, webinars and resources that empower families, build skills and
            create inclusive communities.
          </p>
          <DonateForm presets={settings?.donationPresetsCents} dgr={settings?.dgrEndorsed} />
        </Reveal>
        <Reveal delay={0.12} className="donate-visual">
          <div className="donate-photo">
            <Image
              src={siteMedia.donate}
              alt="Parent and child reading together by the coast"
              width={900}
              height={1100}
              className="donate-photo-img"
              priority
            />
            <div className="donate-float-card">
              <div className="donate-float-top">
                <HeartPulse className="donate-float-heart" />
                <div className="impact-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="9" cy="9" r="3" />
                    <circle cx="16" cy="10" r="2.5" />
                    <path d="M3 19c1.5-3 3.8-4.5 6.5-4.5S15 16 16.5 19" />
                  </svg>
                </div>
              </div>
              <h2>Together we build inclusive futures.</h2>
              <p>Education opens doors. Community creates belonging. Thank you for making it possible.</p>
              <svg className="donate-waves-svg" viewBox="0 0 320 28" preserveAspectRatio="none" aria-hidden>
                <path
                  className="wave-path-a"
                  d="M0 16 C40 4 80 28 120 16 C160 4 200 28 240 16 C280 4 300 12 320 16 L320 28 L0 28 Z"
                  fill="currentColor"
                />
                <path
                  className="wave-path-b"
                  d="M0 18 C50 28 90 8 140 18 C190 28 230 10 280 18 C300 22 310 16 320 18 L320 28 L0 28 Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
