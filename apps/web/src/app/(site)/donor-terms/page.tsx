import { CmsPage, cmsMetadata } from '@/components/site/CmsPage';

export const generateMetadata = () => cmsMetadata('donor-terms', 'Donor terms');

export default function DonorTermsPage() {
  return <CmsPage slug="donor-terms" eyebrow="Giving" fallbackTitle="Donor terms" />;
}
