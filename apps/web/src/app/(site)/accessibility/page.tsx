import { CmsPage, cmsMetadata } from '@/components/site/CmsPage';

export const generateMetadata = () => cmsMetadata('accessibility', 'Accessibility');

export default function AccessibilityPage() {
  return <CmsPage slug="accessibility" eyebrow="Access" fallbackTitle="Accessibility" />;
}
