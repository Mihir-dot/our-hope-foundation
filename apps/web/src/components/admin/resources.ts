import {
  audiences,
  auStates,
  contentStatuses,
  enquiryStatuses,
  eventFormats,
  programFormats,
  resourceLanguages,
  resourceTypes,
  roles,
  topics,
} from '@ohf/shared';
import { labelize } from '@/lib/format';

export type FieldType = 'text' | 'email' | 'password' | 'url' | 'textarea' | 'select' | 'checkbox' | 'checks' | 'number' | 'datetime' | 'json';

export type FieldSpec = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  options?: { value: string; label: string }[];
  optionsFrom?: string;
  optionLabel?: string;
  span?: 2;
  rows?: number;
  readOnly?: boolean;
};

export type ColumnSpec = { key: string; label: string; kind?: 'text' | 'status' | 'date' | 'money' | 'bool' };

export type ResourceConfig = {
  title: string;
  singular: string;
  endpoint: string;
  columns: ColumnSpec[];
  fields: FieldSpec[];
  create?: boolean;
  remove?: 'delete' | 'archive';
  publish?: boolean;
  readOnly?: boolean;
};

const choice = (values: readonly string[]) => values.map((value) => ({ value, label: labelize(value) }));
const status: FieldSpec = { name: 'status', label: 'Status', type: 'select', required: true, options: choice(contentStatuses) };
const seo: FieldSpec[] = [
  { name: 'seoTitle', label: 'SEO title', type: 'text', span: 2 },
  { name: 'seoDescription', label: 'SEO description', type: 'textarea', rows: 3, span: 2 },
];

export const resources = {
  page: {
    title: 'Pages',
    singular: 'Page',
    endpoint: '/admin/pages',
    create: true,
    remove: 'delete',
    publish: true,
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'slug', label: 'Slug' },
      { key: 'status', label: 'Status', kind: 'status' },
      { key: 'updatedAt', label: 'Updated', kind: 'date' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true, hint: 'Lowercase words separated by hyphens.' },
      status,
      ...seo,
      { name: 'blocks', label: 'Blocks JSON', type: 'json', span: 2, rows: 18, hint: 'Array of { id, type, data }. Types include hero, richText, journey, cardGrid, statRow, eventList, programList, resourceList, storyList, ctaBand, faq, logoCloud, splitFeature, trustRow.' },
    ],
  },
  program: {
    title: 'Programs',
    singular: 'Program',
    endpoint: '/admin/programs',
    create: true,
    remove: 'archive',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'format', label: 'Format' },
      { key: 'status', label: 'Status', kind: 'status' },
      { key: 'featured', label: 'Featured', kind: 'bool' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'summary', label: 'Summary', type: 'textarea', span: 2, rows: 3 },
      { name: 'body', label: 'Body', type: 'textarea', span: 2, rows: 8 },
      { name: 'format', label: 'Format', type: 'select', options: choice(programFormats) },
      { name: 'durationText', label: 'Duration', type: 'text' },
      status,
      { name: 'featured', label: 'Featured on lists', type: 'checkbox' },
      { name: 'audiences', label: 'Audiences', type: 'checks', options: choice(audiences), span: 2 },
      { name: 'topics', label: 'Topics', type: 'checks', options: choice(topics), span: 2 },
      { name: 'coverId', label: 'Cover media id', type: 'text', span: 2 },
      ...seo,
    ],
  },
  pathway: {
    title: 'Pathways',
    singular: 'Pathway',
    endpoint: '/admin/pathways',
    create: true,
    remove: 'archive',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'slug', label: 'Slug' },
      { key: 'status', label: 'Status', kind: 'status' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'summary', label: 'Summary', type: 'textarea', span: 2, rows: 3 },
      status,
      { name: 'resourceIds', label: 'Resources', type: 'checks', optionsFrom: '/admin/resources?limit=50', optionLabel: 'title', span: 2 },
    ],
  },
  event: {
    title: 'Events',
    singular: 'Event',
    endpoint: '/admin/events',
    create: true,
    remove: 'archive',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'startAt', label: 'Starts', kind: 'date' },
      { key: 'format', label: 'Format' },
      { key: 'status', label: 'Status', kind: 'status' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'summary', label: 'Summary', type: 'textarea', span: 2, rows: 3 },
      { name: 'body', label: 'Body', type: 'textarea', span: 2, rows: 6 },
      { name: 'format', label: 'Format', type: 'select', options: choice(eventFormats) },
      status,
      { name: 'startAt', label: 'Starts (Sydney)', type: 'datetime', required: true },
      { name: 'endAt', label: 'Ends (Sydney)', type: 'datetime', required: true },
      { name: 'timezone', label: 'Timezone', type: 'text' },
      { name: 'capacity', label: 'Capacity', type: 'number' },
      { name: 'venueName', label: 'Venue', type: 'text' },
      { name: 'state', label: 'State', type: 'select', options: [{ value: '', label: 'None' }, ...auStates.map((state) => ({ value: state, label: state }))] },
      { name: 'address', label: 'Address', type: 'text', span: 2 },
      { name: 'onlineUrl', label: 'Online URL', type: 'url', span: 2, hint: 'Emailed to registered people. It is hidden on the public page.' },
      { name: 'speakerIds', label: 'Speakers', type: 'checks', optionsFrom: '/admin/speakers?limit=50', optionLabel: 'name', span: 2 },
      ...seo,
    ],
  },
  resource: {
    title: 'Resources',
    singular: 'Resource',
    endpoint: '/admin/resources',
    create: true,
    remove: 'archive',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status', kind: 'status' },
      { key: 'language', label: 'Language' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'select', required: true, options: choice(resourceTypes) },
      { name: 'language', label: 'Language', type: 'select', options: choice(resourceLanguages) },
      { name: 'summary', label: 'Summary', type: 'textarea', span: 2, rows: 3 },
      { name: 'body', label: 'Body', type: 'textarea', span: 2, rows: 8 },
      { name: 'transcript', label: 'Transcript', type: 'textarea', span: 2, rows: 6, hint: 'Required before a webinar recording can be published.' },
      { name: 'externalUrl', label: 'External URL', type: 'url', span: 2 },
      { name: 'fileId', label: 'File media id', type: 'text' },
      { name: 'minutes', label: 'Minutes', type: 'number' },
      { name: 'pageCount', label: 'Pages', type: 'number' },
      status,
      { name: 'featured', label: 'Featured', type: 'checkbox' },
      { name: 'topics', label: 'Topics', type: 'checks', options: choice(topics), span: 2 },
      { name: 'audiences', label: 'Audiences', type: 'checks', options: choice(audiences), span: 2 },
      ...seo,
    ],
  },
  story: {
    title: 'Stories',
    singular: 'Story',
    endpoint: '/admin/stories',
    create: true,
    remove: 'archive',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'authorName', label: 'Author' },
      { key: 'status', label: 'Status', kind: 'status' },
      { key: 'publishedAt', label: 'Published', kind: 'date' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'authorName', label: 'Author name', type: 'text' },
      { name: 'publishedAt', label: 'Published (Sydney)', type: 'datetime' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', span: 2, rows: 3 },
      { name: 'body', label: 'Body', type: 'textarea', span: 2, rows: 10 },
      status,
      { name: 'coverId', label: 'Cover media id', type: 'text', span: 2 },
      ...seo,
    ],
  },
  speaker: {
    title: 'Speakers',
    singular: 'Speaker',
    endpoint: '/admin/speakers',
    create: true,
    remove: 'delete',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'organisation', label: 'Organisation' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'organisation', label: 'Organisation', type: 'text', span: 2 },
      { name: 'bio', label: 'Bio', type: 'textarea', span: 2, rows: 6 },
      { name: 'photoId', label: 'Photo media id', type: 'text', span: 2 },
    ],
  },
  donation: {
    title: 'Donations',
    singular: 'Donation',
    endpoint: '/admin/donations',
    readOnly: true,
    columns: [
      { key: 'donorEmail', label: 'Donor' },
      { key: 'amountCents', label: 'Amount', kind: 'money' },
      { key: 'frequency', label: 'Frequency' },
      { key: 'status', label: 'Status', kind: 'status' },
      { key: 'createdAt', label: 'Created', kind: 'date' },
    ],
    fields: [
      { name: 'donorName', label: 'Name', type: 'text', readOnly: true },
      { name: 'donorEmail', label: 'Email', type: 'text', readOnly: true },
      { name: 'amountCents', label: 'Amount', type: 'text', readOnly: true },
      { name: 'frequency', label: 'Frequency', type: 'text', readOnly: true },
      { name: 'status', label: 'Status', type: 'text', readOnly: true },
      { name: 'dedication', label: 'Dedication', type: 'textarea', span: 2, readOnly: true },
      { name: 'stripeCheckoutSessionId', label: 'Checkout session', type: 'text', span: 2, readOnly: true },
      { name: 'createdAt', label: 'Created', type: 'text', readOnly: true },
    ],
  },
  enquiry: {
    title: 'Enquiries',
    singular: 'Enquiry',
    endpoint: '/admin/enquiries',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status', kind: 'status' },
      { key: 'createdAt', label: 'Received', kind: 'date' },
    ],
    fields: [
      { name: 'status', label: 'Status', type: 'select', options: choice(enquiryStatuses) },
      { name: 'type', label: 'Type', type: 'text', readOnly: true },
      { name: 'name', label: 'Name', type: 'text', readOnly: true },
      { name: 'email', label: 'Email', type: 'email', readOnly: true },
      { name: 'phone', label: 'Phone', type: 'text', readOnly: true },
      { name: 'state', label: 'State', type: 'text', readOnly: true },
      { name: 'organisation', label: 'Organisation', type: 'text', readOnly: true },
      { name: 'wwcc', label: 'WWCC', type: 'text', readOnly: true },
      { name: 'availability', label: 'Availability', type: 'text', span: 2, readOnly: true },
      { name: 'message', label: 'Message', type: 'textarea', span: 2, rows: 8, readOnly: true },
    ],
  },
  user: {
    title: 'Users',
    singular: 'User',
    endpoint: '/admin/users',
    create: true,
    remove: 'delete',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'disabled', label: 'Disabled', kind: 'bool' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true, hint: 'Email is set when the user is created.' },
      { name: 'role', label: 'Role', type: 'select', options: choice(roles) },
      { name: 'password', label: 'Password', type: 'password', hint: 'At least 10 characters. Leave blank when editing to keep the current password.', span: 2 },
      { name: 'disabled', label: 'Disabled', type: 'checkbox' },
    ],
  },
} satisfies Record<string, ResourceConfig>;
