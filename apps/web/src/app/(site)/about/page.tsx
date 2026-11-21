import { CmsPage, cmsMetadata } from '@/components/site/CmsPage';

export const generateMetadata = () => cmsMetadata('about', 'About');

export default function AboutPage() {
  return <CmsPage slug="about" eyebrow="About" fallbackTitle="About Our Hope Foundation" />;
}
