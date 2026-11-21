import type { Metadata } from 'next';
import { Outfit, Source_Serif_4 } from 'next/font/google';
import { SkipLink } from '@/components/layout/SkipLink';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif-face',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Our Hope Foundation',
    template: '%s · Our Hope Foundation',
  },
  description:
    'Nurturing Abilities · Inspiring Futures · Building Tomorrows. Disability family education and community development.',
  applicationName: 'Our Hope Foundation',
  openGraph: {
    title: 'Our Hope Foundation',
    description: 'When families learn, every day becomes support.',
    locale: 'en_AU',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${outfit.variable} ${sourceSerif.variable}`}>
      <body>
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
