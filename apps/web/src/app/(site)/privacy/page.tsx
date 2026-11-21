import { CmsPage, cmsMetadata } from '@/components/site/CmsPage';

export const generateMetadata = () => cmsMetadata('privacy', 'Privacy');

export default function PrivacyPage() {
  return <CmsPage slug="privacy" eyebrow="Privacy" fallbackTitle="Privacy" />;
}
