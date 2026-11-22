import type { Metadata } from 'next';
import { brand } from '@ohf/shared';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { getPage } from '@/lib/content';
import type { ContentBlock } from '@/lib/types';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('home');
  return {
    title: { absolute: page?.seo?.title || 'Our Hope Foundation' },
    description: page?.seo?.description || brand.tagline,
  };
}

const homeModules = [
  {
    title: 'Programs',
    summary: 'Workshops and webinars for parents, carers, siblings and guardians.',
    href: '/programs',
    icon: 'compass',
    links: [
      { label: 'All programs', href: '/programs' },
      { label: 'Understanding Autism', href: '/programs/understanding-autism' },
      { label: 'NDIS Navigation', href: '/programs/ndis-navigation' },
    ],
  },
  {
    title: 'Learn',
    summary: 'Curated reading pathways for the stage your family is in.',
    href: '/learn',
    icon: 'school',
    links: [
      { label: 'All pathways', href: '/learn' },
      { label: 'New to autism', href: '/learn/new-to-autism' },
      { label: 'NDIS for families', href: '/learn/ndis-for-families' },
    ],
  },
  {
    title: 'Resources',
    summary: 'Tip sheets, articles and recordings you can use straight away.',
    href: '/resources',
    icon: 'signpost',
    links: [
      { label: 'Resource library', href: '/resources' },
      { label: 'First weeks after diagnosis', href: '/resources/first-weeks-after-diagnosis' },
      { label: 'Communication at home', href: '/resources/communication-at-home' },
    ],
  },
  {
    title: 'Events',
    summary: 'Live webinars and community sessions across Australia.',
    href: '/events',
    icon: 'heart',
    links: [
      { label: 'Upcoming events', href: '/events' },
      { label: 'Get involved', href: '/get-involved' },
    ],
  },
  {
    title: 'Stories',
    summary: 'Honest family moments that help others feel less alone.',
    href: '/stories',
    icon: 'heart',
    links: [
      { label: 'All stories', href: '/stories' },
      { label: 'About Our Hope', href: '/about' },
    ],
  },
  {
    title: 'Get involved',
    summary: 'Donate, enquire, volunteer or partner with the foundation.',
    href: '/get-involved',
    icon: 'compass',
    links: [
      { label: 'Ways to help', href: '/get-involved' },
      { label: 'Donate', href: '/donate' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Contact',
    summary: 'Ask a question about programs, partnerships or media.',
    href: '/contact',
    icon: 'signpost',
    links: [
      { label: 'Enquiry form', href: '/contact' },
      { label: 'About us', href: '/about' },
    ],
  },
  {
    title: 'Donate',
    summary: 'Fund workshops, resources and community events for families.',
    href: '/donate',
    icon: 'heart',
    links: [
      { label: 'Give now', href: '/donate' },
      { label: 'Donor terms', href: '/donor-terms' },
    ],
  },
];

const fallback: ContentBlock[] = [
  {
    id: 'home-hero',
    type: 'hero',
    data: {
      eyebrow: brand.missionLine,
      title: brand.heroHeadline,
      text: 'Learning for parents, carers, siblings, and guardians of people with disability.',
      primaryCta: { label: 'Explore programs', href: '/programs' },
      secondaryCta: { label: 'Donate', href: '/donate' },
      image: '/media/hero-family.jpg',
      imageAlt: 'Family learning together at home',
    },
  },
  {
    id: 'home-modules',
    type: 'moduleGrid',
    data: {
      eyebrow: 'What we offer',
      title: 'Support for every stage of family life',
      text: 'Explore programs, learning pathways, resources and ways to get involved — hover a module to see related links.',
      items: homeModules,
    },
  },
  {
    id: 'home-stats',
    type: 'statRow',
    data: {
      title: 'Our impact',
      text: 'Numbers that belong to real families across Australia.',
    },
  },
  {
    id: 'home-involved',
    type: 'cardGrid',
    data: {
      eyebrow: 'Get involved',
      title: 'Help families learn with confidence',
      text: 'Your time, gift or enquiry keeps practical education within reach.',
      items: [
        {
          eyebrow: 'Give',
          title: 'Make a donation',
          text: 'Fund workshops, tip sheets and community events.',
          href: '/donate',
        },
        {
          eyebrow: 'Connect',
          title: 'Enquire or partner',
          text: 'Volunteer, media and partnership enquiries welcome.',
          href: '/contact',
        },
        {
          eyebrow: 'Learn more',
          title: 'Ways to get involved',
          text: 'See every path to support Our Hope Foundation.',
          href: '/get-involved',
        },
      ],
    },
  },
  { id: 'home-stories', type: 'storyList', data: { title: 'Stories from families', limit: 3 } },
  { id: 'home-resources', type: 'resourceList', data: { title: 'From the library', limit: 3 } },
  { id: 'home-trust', type: 'trustRow', data: { title: 'A charity families can read clearly' } },
  {
    id: 'home-cta',
    type: 'ctaBand',
    data: {
      title: 'Give families more good days',
      text: 'Gifts fund workshops, resources, and community events.',
      cta: { label: 'Donate', href: '/donate' },
    },
  },
];

export default async function HomePage() {
  const page = await getPage('home');
  return <BlockRenderer blocks={page?.blocks?.length ? page.blocks : fallback} animate />;
}
