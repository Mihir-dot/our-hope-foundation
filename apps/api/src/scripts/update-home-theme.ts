import mongoose from 'mongoose';
import { brand } from '@ohf/shared';
import { connectDb } from '../config/db.js';

async function main() {
  await connectDb();
  const pages = mongoose.connection.collection('pages');
  const settings = mongoose.connection.collection('settings');

  await pages.updateOne(
    { slug: 'home' },
    {
      $set: {
        blocks: [
          {
            id: 'home-hero',
            type: 'hero',
            data: {
              eyebrow: brand.missionLine,
              title: brand.heroHeadline,
              text: 'Practical education, resources and connection for parents and carers of children with disability across Australia.',
              primaryCta: { label: 'Explore programs', href: '/programs' },
              secondaryCta: { label: 'Join a webinar', href: '/events' },
              image: '/media/hero-family.jpg',
              imageAlt: 'Family learning together at home',
            },
          },
          {
            id: 'home-journey',
            type: 'journey',
            data: {
              title: 'Where you are in your journey',
              text: 'Choose the path that matches what your family needs right now.',
              steps: [
                {
                  title: 'New diagnosis',
                  text: 'Clear first steps when everything feels new.',
                  href: '/programs/understanding-autism',
                  icon: 'compass',
                },
                {
                  title: 'School support',
                  text: 'Partner with educators with confidence.',
                  href: '/programs/communication-strategies',
                  icon: 'school',
                },
                {
                  title: 'Behaviour',
                  text: 'Understand what hard moments are saying.',
                  href: '/programs/positive-behaviour-support',
                  icon: 'heart',
                },
                {
                  title: 'NDIS navigation',
                  text: 'Make sense of plans, goals and supports.',
                  href: '/programs/ndis-navigation',
                  icon: 'signpost',
                },
              ],
            },
          },
          {
            id: 'home-events',
            type: 'eventList',
            data: { title: 'Upcoming webinars', limit: 3, withImpact: true },
          },
          {
            id: 'home-stories',
            type: 'storyList',
            data: { title: 'Stories from families', limit: 3 },
          },
          {
            id: 'home-trust',
            type: 'trustRow',
            data: { title: 'A charity families can read clearly' },
          },
          {
            id: 'home-cta',
            type: 'ctaBand',
            data: {
              title: 'Give families more good days',
              text: 'Gifts fund workshops, resources, and community events.',
              cta: { label: 'Donate', href: '/donate' },
            },
          },
        ],
      },
    },
  );

  await settings.updateOne(
    { key: 'site' },
    {
      $set: {
        impactStats: [
          { label: 'Families supported', value: '3,200+', note: 'Across Australia' },
          { label: 'Webinars delivered', value: '120+', note: 'Practical family learning' },
          { label: 'Families feeling more confident', value: '98%', note: 'After joining a program' },
          { label: 'Reach', value: 'All across Australia', note: 'Regional, rural and metro' },
        ],
      },
    },
  );

  console.log('Home page and impact stats updated to mockup theme');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
