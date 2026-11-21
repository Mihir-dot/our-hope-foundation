import { CmsPage, cmsMetadata } from '@/components/site/CmsPage';

export const generateMetadata = () => cmsMetadata('terms', 'Terms');

export default function TermsPage() {
  return <CmsPage slug="terms" eyebrow="Terms" fallbackTitle="Terms" />;
}
