import type { MenuItem } from './types';

/** Anglicare-style primary nav mapped to OHF modules (Donate is separate CTA). */
export const primaryNav: MenuItem[] = [
  {
    label: 'Programs',
    href: '/programs',
    description: 'Practical learning for parents, carers, siblings and guardians.',
    children: [
      { label: 'All programs', href: '/programs' },
      { label: 'Understanding Autism', href: '/programs/understanding-autism' },
      { label: 'Communication Strategies', href: '/programs/communication-strategies' },
      { label: 'Positive Behaviour Support', href: '/programs/positive-behaviour-support' },
      { label: 'Daily Living Skills', href: '/programs/daily-living-skills' },
      { label: 'Community Participation', href: '/programs/community-participation' },
      { label: 'NDIS Navigation', href: '/programs/ndis-navigation' },
    ],
  },
  {
    label: 'Learn',
    href: '/learn',
    description: 'Reading pathways that match where your family is right now.',
    children: [
      { label: 'All pathways', href: '/learn' },
      { label: 'New to autism', href: '/learn/new-to-autism' },
      { label: 'School and daily life', href: '/learn/school-and-daily-life' },
      { label: 'NDIS for families', href: '/learn/ndis-for-families' },
    ],
  },
  {
    label: 'Resources',
    href: '/resources',
    description: 'Tip sheets, articles and recordings you can use at home.',
    children: [
      { label: 'Resource library', href: '/resources' },
      { label: 'First weeks after diagnosis', href: '/resources/first-weeks-after-diagnosis' },
      { label: 'Communication at home', href: '/resources/communication-at-home' },
      { label: 'Visual supports starter', href: '/resources/visual-supports-starter' },
      { label: 'When behaviour gets loud', href: '/resources/understanding-behaviour' },
      { label: 'Reading an NDIS plan', href: '/resources/reading-an-ndis-plan' },
    ],
  },
  {
    label: 'Events',
    href: '/events',
    description: 'Webinars and community sessions across Australia.',
    children: [
      { label: 'Upcoming events', href: '/events' },
      { label: 'Get involved', href: '/get-involved' },
      { label: 'Contact us', href: '/contact' },
    ],
  },
  {
    label: 'Stories',
    href: '/stories',
    description: 'Real family moments — honest, useful and hopeful.',
    children: [
      { label: 'All stories', href: '/stories' },
      { label: 'About Our Hope', href: '/about' },
      { label: 'Get involved', href: '/get-involved' },
    ],
  },
  {
    label: 'About',
    href: '/about',
    description: 'Who we are, how we work, and how to reach us.',
    children: [
      { label: 'About us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Accessibility', href: '/accessibility' },
      { label: 'Child safety', href: '/child-safety' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
  {
    label: 'Get involved',
    href: '/get-involved',
    description: 'Donate, enquire, volunteer or partner with us.',
    children: [
      { label: 'Ways to help', href: '/get-involved' },
      { label: 'Donate', href: '/donate' },
      { label: 'Contact / enquire', href: '/contact' },
      { label: 'Donor terms', href: '/donor-terms' },
    ],
  },
];
