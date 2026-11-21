import { CmsPage, cmsMetadata } from '@/components/site/CmsPage';

export const generateMetadata = () => cmsMetadata('child-safety', 'Child safety');

export default function ChildSafetyPage() {
  return <CmsPage slug="child-safety" eyebrow="Safety" fallbackTitle="Child safety" />;
}
