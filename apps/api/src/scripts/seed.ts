import mongoose from 'mongoose';
import { brand } from '@ohf/shared';
import { connectDb } from '../config/db.js';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { hashPassword } from '../modules/auth/service.js';
import { Event } from '../modules/events/model.js';
import { Menu } from '../modules/menus/model.js';
import { Page } from '../modules/pages/model.js';
import { Pathway } from '../modules/pathways/model.js';
import { Program } from '../modules/programs/model.js';
import { Resource } from '../modules/resources/model.js';
import { Speaker } from '../modules/speakers/model.js';
import { Story } from '../modules/stories/model.js';
import { User } from '../modules/users/model.js';
import { settingsDefaults } from '../modules/settings/service.js';
import { Settings } from '../modules/settings/model.js';

async function ensure(model: mongoose.Model<any>, filter: Record<string, unknown>, data: Record<string, unknown>) {
  const existing = await model.findOne(filter);
  if (existing) return existing;
  return model.create({ ...filter, ...data });
}

function rich(slug: string, paragraphs: string[]) {
  return [
    {
      id: `${slug}-body`,
      type: 'richText',
      data: { html: paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('') },
    },
  ];
}

const programs = [
  {
    title: 'Understanding Autism',
    slug: 'understanding-autism',
    summary: 'A plain-language start for families who have just received a diagnosis, or who have been wondering for a while.',
    body: 'This program walks through what autism can look like at home, at school, and in the community. Sessions use family examples rather than clinical checklists. You will leave with language you can use with relatives, teachers, and your child.',
    audiences: ['parents', 'carers', 'guardians'],
    topics: ['autism', 'wellbeing'],
    format: 'webinar',
    durationText: '4 sessions · 90 minutes',
    featured: true,
    status: 'published',
  },
  {
    title: 'Communication Strategies',
    slug: 'communication-strategies',
    summary: 'Practical ways to make requests, choices, and everyday conversations easier.',
    body: 'Families try visual supports, wait time, and modelling in real routines such as meals, baths, and the school run. The program is useful whether your person speaks, uses a device, or is still finding their way in.',
    audiences: ['parents', 'carers', 'siblings'],
    topics: ['communication', 'autism', 'school'],
    format: 'workshop',
    durationText: '6 hours over three weeks',
    featured: true,
    status: 'published',
  },
  {
    title: 'Positive Behaviour Support',
    slug: 'positive-behaviour-support',
    summary: 'Look underneath behaviour so the response at home is calmer and more useful.',
    body: 'We treat behaviour as communication. You will map one hard moment, notice what happens before and after, and try a small change that keeps everyone safer. This is education for families, not a clinical behaviour plan.',
    audiences: ['parents', 'carers', 'guardians'],
    topics: ['behaviour', 'wellbeing'],
    format: 'workshop',
    durationText: 'One day workshop',
    featured: false,
    status: 'published',
  },
  {
    title: 'Daily Living Skills',
    slug: 'daily-living-skills',
    summary: 'Break dressing, meals, money, and travel into steps a family can actually practise.',
    body: 'Each skill is taught in the place it happens. You will choose one routine, write the steps in your own words, and decide what “good enough for this week” looks like. Siblings are welcome.',
    audiences: ['parents', 'carers', 'siblings', 'guardians'],
    topics: ['daily-living', 'autism'],
    format: 'self-paced',
    durationText: 'Self-paced · about 3 hours',
    featured: false,
    status: 'published',
  },
  {
    title: 'Community Participation',
    slug: 'community-participation',
    summary: 'Plan outings, groups, and friendships without turning the weekend into a project.',
    body: 'The program covers sensory planning, how to brief a venue, and how to leave early without apology. Families share what has worked at libraries, sport, faith communities, and local parks.',
    audiences: ['parents', 'carers', 'siblings'],
    topics: ['community', 'wellbeing'],
    format: 'workshop',
    durationText: 'Two evening sessions',
    featured: false,
    status: 'published',
  },
  {
    title: 'NDIS Navigation',
    slug: 'ndis-navigation',
    summary: 'Read a plan, prepare for a meeting, and know which questions belong to you.',
    body: 'Our Hope Foundation is not an NDIS provider and does not lodge claims. This program helps families understand plan language, the difference between support and therapy, and how to take notes that still make sense a month later.',
    audiences: ['parents', 'carers', 'guardians'],
    topics: ['ndis', 'daily-living'],
    format: 'webinar',
    durationText: '3 webinars · 75 minutes',
    featured: true,
    status: 'published',
  },
];

const resources = [
  {
    title: 'The first weeks after a diagnosis',
    slug: 'first-weeks-after-diagnosis',
    summary: 'What to do this fortnight, and what can wait.',
    type: 'article',
    body: 'A diagnosis can arrive with a folder of words and very little sleep. Start with one question: what would make tomorrow morning 10 minutes easier? Tell one trusted person. Decline appointments that are not urgent. Write down the phrases you want teachers to use.',
    topics: ['autism', 'wellbeing'],
    audiences: ['parents', 'carers', 'guardians'],
    minutes: 8,
    featured: true,
  },
  {
    title: 'Communication at home',
    slug: 'communication-at-home',
    summary: 'A one-page reminder for requests, choices, and waiting.',
    type: 'tip-sheet',
    body: 'Offer two real choices. Wait longer than feels natural. Point to the thing as you say the word. Celebrate the attempt, including a look, a reach, or a sound.',
    topics: ['communication'],
    audiences: ['parents', 'carers', 'siblings'],
    pageCount: 1,
    featured: true,
  },
  {
    title: 'A starter set of visual supports',
    slug: 'visual-supports-starter',
    summary: 'First-then cards, a morning strip, and a “finished” box.',
    type: 'article',
    body: 'You do not need a laminator on day one. A notepad on the fridge is a visual support. Draw the next two steps only. Remove the card when the step is done so the list shrinks.',
    topics: ['communication', 'daily-living', 'school'],
    audiences: ['parents', 'carers'],
    minutes: 6,
  },
  {
    title: 'When behaviour gets loud',
    slug: 'understanding-behaviour',
    summary: 'A short pause-and-notice sheet for hard moments.',
    type: 'tip-sheet',
    body: 'After everyone is safe, write three lines: what was happening, what the person might have needed, and what you will try next time. Skip the story about who was right.',
    topics: ['behaviour', 'wellbeing'],
    audiences: ['parents', 'carers', 'guardians'],
    pageCount: 2,
  },
  {
    title: 'Routines that can flex',
    slug: 'daily-routines-that-flex',
    summary: 'Keep the shape of the day when the details change.',
    type: 'article',
    body: 'Anchor the day with three beats: a start, a middle, and a finish. The middle can move. Say the change out loud and show it. A shorter version of a routine still counts.',
    topics: ['daily-living', 'school'],
    audiences: ['parents', 'carers', 'siblings'],
    minutes: 7,
  },
  {
    title: 'Community outings checklist',
    slug: 'community-outings-checklist',
    summary: 'Leave the house with a plan for noise, food, and the way home.',
    type: 'tip-sheet',
    body: 'Pack the familiar item, a snack, and an exit line you have already agreed. Tell the person how long you will stay. Leaving early is a successful outing.',
    topics: ['community', 'wellbeing'],
    audiences: ['parents', 'carers', 'siblings'],
    pageCount: 1,
  },
  {
    title: 'How to read an NDIS plan',
    slug: 'reading-an-ndis-plan',
    summary: 'A family glossary for the words that show up in a plan meeting.',
    type: 'article',
    body: 'Highlight the goals in your own words before you look at the dollar lines. Ask who is responsible for each next step. Our Hope Foundation does not manage plans or claim as a provider. Bring a second adult if the meeting is long.',
    topics: ['ndis'],
    audiences: ['parents', 'carers', 'guardians'],
    minutes: 10,
    featured: true,
  },
  {
    title: 'Asking better questions',
    slug: 'family-webinar-asking-better-questions',
    summary: 'A recorded conversation about questions that help at school and in appointments.',
    type: 'webinar-recording',
    body: 'Families and a guest educator talk through questions that open a meeting instead of closing it.',
    transcript:
      'Welcome. Today we practise questions that keep a meeting useful. Try “what did you notice just before?” instead of “why did they do that?”. Write the answer down in the person’s own words. If you do not understand a term, ask for a plain explanation before you agree to anything. Thank you for learning with us.',
    topics: ['school', 'communication', 'ndis'],
    audiences: ['parents', 'carers', 'guardians'],
    minutes: 42,
  },
];

async function seed() {
  const email = env.SEED_OWNER_EMAIL.toLowerCase();
  const owner = await User.findOne({ email });
  if (!owner) {
    await User.create({
      email,
      name: 'Foundation Owner',
      role: 'owner',
      passwordHash: await hashPassword(env.SEED_OWNER_PASSWORD),
    });
    logger.info({ email }, 'Seeded owner');
  } else {
    logger.info({ email }, 'Owner already exists');
  }

  if (!(await Settings.findOne({ key: 'site' }))) {
    await Settings.create(settingsDefaults);
    logger.info('Seeded settings');
  }

  const menus = [
    {
      location: 'header',
      items: [
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
        { label: 'Donate', href: '/donate' },
      ],
    },
    {
      location: 'footer',
      items: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Programs', href: '/programs' },
        { label: 'Donate', href: '/donate' },
      ],
    },
    {
      location: 'legal',
      items: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Accessibility', href: '/accessibility' },
        { label: 'Donor terms', href: '/donor-terms' },
        { label: 'Child safety', href: '/child-safety' },
      ],
    },
  ];
  for (const menu of menus) {
    await Menu.findOneAndUpdate(
      { location: menu.location },
      { $set: { items: menu.items } },
      { upsert: true, new: true },
    );
  }

  const pages = [
    {
      title: 'Home',
      slug: 'home',
      status: 'published',
      seo: { title: 'Our Hope Foundation', description: brand.tagline },
      blocks: [
        {
          id: 'home-hero',
          type: 'hero',
          data: {
            eyebrow: brand.missionLine,
            title: brand.heroHeadline,
            text: 'Practical education, resources and connection for parents and carers of children with disability across Australia.',
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
            items: [
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
            ],
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
    {
      title: 'About',
      slug: 'about',
      status: 'published',
      seo: { title: 'About Our Hope Foundation', description: brand.missionLine },
      blocks: [
        ...rich('about', [
          'Our Hope Foundation exists so families of people with disability can learn together. The public name is Our Hope Foundation. Disability family education and community development is the work, not a second logo.',
          'We teach parents, carers, siblings, and guardians. We do not provide NDIS supports, and we do not claim to be an NDIS provider. When a family needs a registered provider, we help them know what to ask.',
          brand.acknowledgement,
        ]),
        {
          id: 'about-split',
          type: 'splitFeature',
          data: {
            title: 'What you will find here',
            text: 'Programs, a resource library, events, and stories. Learning lists at /learn are reading pathways, not an online course.',
          },
        },
      ],
    },
    {
      title: 'Get involved',
      slug: 'get-involved',
      status: 'published',
      blocks: rich('get-involved', [
        'Families, volunteers, and partner organisations can all take part. Volunteers who work with people under 18 need a Working with Children Check before they start.',
        'Use the form on this page to tell us how you would like to help. A person from the foundation will reply.',
      ]),
    },
    {
      title: 'Contact',
      slug: 'contact',
      status: 'published',
      blocks: rich('contact', [
        `Write to ${brand.email}. For program questions, partnership ideas, or media requests, the contact form reaches the right person.`,
        'We read every message. We may take a few days to reply.',
      ]),
    },
    {
      title: 'Privacy',
      slug: 'privacy',
      status: 'published',
      blocks: rich('privacy', [
        'We collect the details you type into forms: name, email, phone, and the message you send. Donation payments are handled by Stripe. We store the amount, a reference, and the email Stripe returns. We do not store card numbers.',
        'We use this information to reply, confirm an event place, send a newsletter you opted into, and receipt a gift. We do not sell personal information. You can ask for a copy or a correction by emailing us.',
      ]),
    },
    {
      title: 'Terms',
      slug: 'terms',
      status: 'published',
      blocks: rich('terms', [
        'The pages, programs, and resources on this site are general education for families in Australia. They are not medical, legal, or financial advice, and they are not an NDIS plan.',
        'You may share links. Please do not copy our materials into another product without asking. Event places can be limited, and a full event moves later registrations to a waitlist.',
      ]),
    },
    {
      title: 'Accessibility',
      slug: 'accessibility',
      status: 'published',
      blocks: rich('accessibility', [
        'We aim for WCAG 2.2 AA. Pages use clear headings, visible focus, and text that can be resized. If something gets in the way, email us and tell us the page and what you were trying to do.',
        'Event forms ask about access needs. Tell us about interpreters, quiet space, step-free entry, or anything else that lets you take part.',
      ]),
    },
    {
      title: 'Donor terms',
      slug: 'donor-terms',
      status: 'published',
      blocks: rich('donor-terms', [
        'Gifts are made in Australian dollars through Stripe. One-off gifts are a single payment. Monthly gifts continue until you cancel them in the Stripe customer portal linked from your receipt.',
        'A tax-deductible receipt is issued only when the foundation’s deductible gift recipient endorsement is recorded in site settings. No GST is added to a donation.',
      ]),
    },
    {
      title: 'Child safety',
      slug: 'child-safety',
      status: 'published',
      blocks: rich('child-safety', [
        'Our programs are for adult family members. We do not create accounts for children, and we do not ask children to contact us directly.',
        'Staff and volunteers who may be around people under 18 must hold a current Working with Children Check. If you are worried about a child’s safety, contact the police or your state child-protection service. You can also write to us and we will refer the concern.',
      ]),
    },
  ];

  for (const page of pages) {
    if (page.slug === 'home') {
      await Page.findOneAndUpdate({ slug: 'home' }, { $set: page }, { upsert: true, new: true });
    } else {
      await ensure(Page, { slug: page.slug }, page);
    }
  }

  for (const program of programs) {
    await ensure(Program, { slug: program.slug }, { ...program, seo: { title: program.title, description: program.summary } });
  }

  const resourceIds = new Map<string, mongoose.Types.ObjectId>();
  for (const resource of resources) {
    const doc = await ensure(Resource, { slug: resource.slug }, {
      ...resource,
      language: 'en',
      status: 'published',
      publishedAt: new Date('2026-09-01'),
      seo: { title: resource.title, description: resource.summary },
    });
    resourceIds.set(resource.slug, doc._id);
  }

  const pathways = [
    {
      title: 'New to autism',
      slug: 'new-to-autism',
      summary: 'A short reading list for the first month.',
      slugs: ['first-weeks-after-diagnosis', 'communication-at-home', 'visual-supports-starter'],
    },
    {
      title: 'School and daily life',
      slug: 'school-and-daily-life',
      summary: 'Routines, behaviour, and getting out of the house.',
      slugs: ['daily-routines-that-flex', 'understanding-behaviour', 'community-outings-checklist'],
    },
    {
      title: 'NDIS for families',
      slug: 'ndis-for-families',
      summary: 'Read a plan and practise the questions to ask.',
      slugs: ['reading-an-ndis-plan', 'family-webinar-asking-better-questions'],
    },
  ];
  for (const pathway of pathways) {
    await ensure(Pathway, { slug: pathway.slug }, {
      title: pathway.title,
      summary: pathway.summary,
      status: 'published',
      resourceIds: pathway.slugs.map((slug) => resourceIds.get(slug)).filter(Boolean),
    });
  }

  const speakerSeeds = [
    {
      name: 'Amira Hassan',
      role: 'Family educator',
      organisation: 'Our Hope Foundation',
      bio: 'Amira hosts the foundation’s family webinars and has spent fifteen years beside parents after a new diagnosis.',
    },
    {
      name: 'Jordan Blake',
      role: 'Speech pathologist',
      organisation: 'Guest educator',
      bio: 'Jordan joins selected workshops to show communication ideas families can try the same week. Jordan is a guest, not a staff clinician.',
    },
    {
      name: 'Priya Nair',
      role: 'Behaviour support practitioner',
      organisation: 'Guest educator',
      bio: 'Priya helps families notice what a hard moment is saying, and what a smaller next step could be.',
    },
    {
      name: 'Tom Nguyen',
      role: 'NDIS plan mentor',
      organisation: 'Our Hope Foundation',
      bio: 'Tom teaches families how to read plan language. He does not lodge claims or act as a support coordinator.',
    },
  ];
  const speakerIds = new Map<string, mongoose.Types.ObjectId>();
  for (const speaker of speakerSeeds) {
    const doc = await ensure(Speaker, { name: speaker.name }, speaker);
    speakerIds.set(speaker.name, doc._id);
  }

  const events = [
    {
      title: 'Communication at home',
      slug: 'family-webinar-communication-at-home',
      summary: 'A live webinar on choices, wait time, and visual supports.',
      body: 'Bring one routine you would like to change. You will leave with two things to try before next week.',
      format: 'online',
      startAt: new Date('2026-12-03T00:00:00.000Z'),
      endAt: new Date('2026-12-03T01:30:00.000Z'),
      onlineUrl: 'https://meet.example.org/ohf-communication',
      capacity: 80,
      speakers: ['Amira Hassan', 'Jordan Blake'],
    },
    {
      title: 'Positive routines in Sydney',
      slug: 'workshop-positive-routines-sydney',
      summary: 'An in-person workshop for families who want mornings to feel possible.',
      body: 'We will map one morning routine and practise a shorter version. Step-free entry is available. Tell us about access needs when you register.',
      format: 'in-person',
      startAt: new Date('2026-12-12T00:00:00.000Z'),
      endAt: new Date('2026-12-12T03:00:00.000Z'),
      venueName: 'Parramatta Community Room',
      address: '126 Church Street, Parramatta NSW 2150',
      state: 'NSW',
      capacity: 24,
      speakers: ['Priya Nair'],
    },
    {
      title: 'NDIS navigation evening',
      slug: 'ndis-navigation-evening',
      summary: 'An online evening for families preparing for a plan meeting.',
      body: 'Bring a plan if you have one. We will not collect it. This session does not replace a support coordinator.',
      format: 'online',
      startAt: new Date('2027-02-04T08:00:00.000Z'),
      endAt: new Date('2027-02-04T09:15:00.000Z'),
      onlineUrl: 'https://meet.example.org/ohf-ndis',
      capacity: 100,
      speakers: ['Tom Nguyen', 'Amira Hassan'],
    },
    {
      title: 'Community picnic in Melbourne',
      slug: 'community-picnic-melbourne',
      summary: 'A relaxed afternoon that already happened, kept here so families can see what we host.',
      body: 'Families brought lunch, a familiar item, and no agenda. We will host another picnic when the next date is set.',
      format: 'in-person',
      startAt: new Date('2026-08-16T02:00:00.000Z'),
      endAt: new Date('2026-08-16T05:00:00.000Z'),
      venueName: 'Edinburgh Gardens',
      address: 'Alfred Crescent, Fitzroy North VIC 3068',
      state: 'VIC',
      capacity: 60,
      speakers: ['Amira Hassan'],
    },
  ];
  for (const event of events) {
    const { speakers, ...rest } = event;
    await ensure(Event, { slug: event.slug }, {
      ...rest,
      timezone: 'Australia/Sydney',
      status: 'published',
      speakerIds: speakers.map((name) => speakerIds.get(name)).filter(Boolean),
      seo: { title: event.title, description: event.summary },
    });
  }

  const stories = [
    {
      title: 'A Saturday that felt possible',
      slug: 'a-saturday-that-felt-possible',
      excerpt: 'We stopped planning the whole day and kept the park, the snack, and the way home.',
      body: 'The picnic was on the calendar and I nearly cancelled it twice. We stayed forty minutes. My son used the swing, my daughter read the signs out loud, and we left while it was still good. That counted.',
      authorName: 'Leah, parent',
    },
    {
      title: 'What school meetings taught us',
      slug: 'what-school-meetings-taught-us',
      excerpt: 'One written question changed the tone of the room.',
      body: 'I used to walk in ready to defend. Amira suggested I start with “what did you notice just before?”. The teacher had an answer. We left with one change to the morning line, not a new label.',
      authorName: 'Daniel, carer',
    },
    {
      title: 'Our first community choir',
      slug: 'our-first-community-choir',
      excerpt: 'Nobody had to stand still, and the song still happened.',
      body: 'The choir leader let people sit, walk, or hold a familiar scarf. My sister sang the last line. I cried in the car and then sent the registration form to another family.',
      authorName: 'Sofia, sibling',
    },
  ];
  for (const story of stories) {
    await ensure(Story, { slug: story.slug }, {
      ...story,
      status: 'published',
      publishedAt: new Date('2026-10-12'),
      seo: { title: story.title, description: story.excerpt },
    });
  }

  logger.info('Seed complete');
}

connectDb()
  .then(seed)
  .then(() => mongoose.disconnect())
  .catch(async (err) => {
    logger.error({ err }, 'Seed failed');
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  });
