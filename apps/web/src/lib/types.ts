export type ApiMeta = { page?: number; limit?: number; total?: number; pages?: number };

export type ContentBlock = {
  id: string;
  type: string;
  data?: Record<string, unknown>;
};

export type Seo = { title?: string; description?: string };

export type PageDoc = {
  id?: string;
  title: string;
  slug: string;
  status?: string;
  seo?: Seo;
  blocks?: ContentBlock[];
  updatedAt?: string;
};

export type Program = {
  id?: string;
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  audiences?: string[];
  topics?: string[];
  format?: string;
  durationText?: string;
  featured?: boolean;
  status?: string;
  coverId?: string | null;
  seo?: Seo;
};

export type Resource = {
  id?: string;
  title: string;
  slug: string;
  summary?: string;
  type?: string;
  body?: string;
  externalUrl?: string;
  transcript?: string;
  topics?: string[];
  audiences?: string[];
  language?: string;
  minutes?: number;
  pageCount?: number;
  publishedAt?: string;
  featured?: boolean;
  status?: string;
  fileId?: string | null;
  seo?: Seo;
};

export type Story = {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  authorName?: string;
  publishedAt?: string;
  status?: string;
  coverId?: string | null;
  seo?: Seo;
};

export type Speaker = {
  id?: string;
  name: string;
  role?: string;
  organisation?: string;
  bio?: string;
  photoId?: string | null;
};

export type EventItem = {
  id?: string;
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  format?: string;
  startAt?: string;
  endAt?: string;
  timezone?: string;
  venueName?: string;
  address?: string;
  state?: string;
  onlineUrl?: string;
  capacity?: number;
  speakers?: Speaker[];
  speakerIds?: string[];
  status?: string;
  seo?: Seo;
};

export type Pathway = {
  id?: string;
  title: string;
  slug: string;
  summary?: string;
  status?: string;
  resourceIds?: string[];
  resources?: Resource[];
};

export type MenuItem = {
  label: string;
  href: string;
  description?: string;
  children?: MenuItem[];
};

export type MenuDoc = { id?: string; location: string; items: MenuItem[] };

export type ImpactStat = { label: string; value: string; note?: string };

export type SiteSettings = {
  legalName?: string;
  tagline?: string;
  missionLine?: string;
  abn?: string;
  acncNumber?: string;
  charityStatus?: string;
  dgrEndorsed?: boolean;
  ndisProvider?: boolean;
  fundraisingLicences?: Record<string, string>;
  email?: string;
  phone?: string;
  address?: string;
  acknowledgement?: string;
  social?: { facebook?: string; instagram?: string; linkedin?: string; youtube?: string };
  donationPresetsCents?: number[];
  impactStats?: ImpactStat[];
  seoTitle?: string;
  seoDescription?: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'editor' | 'finance';
};

export type SearchResults = {
  programs: Program[];
  resources: Resource[];
  stories: Story[];
  events: EventItem[];
};

export type Enquiry = {
  id: string;
  type?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  state?: string;
  interests?: string[];
  availability?: string;
  organisation?: string;
  wwcc?: string;
  status?: string;
  createdAt?: string;
};

export type ListResult<T> = { items: T[]; meta?: ApiMeta };
