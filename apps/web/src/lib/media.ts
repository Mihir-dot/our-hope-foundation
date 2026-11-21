/** Local mockup-derived imagery under /public/media */

export const siteMedia = {
  hero: '/media/hero-family.jpg',
  heroAlt: '/media/hero-family-alt.jpg',
  donate: '/media/donate-parent-child.jpg',
  donateScene: '/media/donate-scene.jpg',
  events: [
    '/media/event-coast-1.jpg',
    '/media/event-coast-2.jpg',
    '/media/event-coast-3.jpg',
  ],
  programs: [
    '/media/program-1.jpg',
    '/media/program-2.jpg',
    '/media/program-3.jpg',
    '/media/program-4.jpg',
    '/media/program-5.jpg',
    '/media/program-6.jpg',
  ],
  resources: ['/media/resource-1.jpg', '/media/resource-2.jpg', '/media/resource-3.jpg'],
} as const;

const programBySlug: Record<string, string> = {
  'understanding-autism': siteMedia.programs[0],
  'communication-strategies': siteMedia.programs[1],
  'positive-behaviour-support': siteMedia.programs[2],
  'daily-living-skills': siteMedia.programs[3],
  'community-participation': siteMedia.programs[4],
  'ndis-navigation': siteMedia.programs[5],
};

export function programImage(slug: string, index = 0) {
  return programBySlug[slug] || siteMedia.programs[index % siteMedia.programs.length];
}

export function eventImage(slug: string, index = 0) {
  return siteMedia.events[Math.abs(index) % siteMedia.events.length];
}

export function resourceImage(slug: string, index = 0) {
  return siteMedia.resources[Math.abs(index) % siteMedia.resources.length];
}

export function storyImage(index = 0) {
  return siteMedia.programs[index % siteMedia.programs.length];
}
