import type { Request, Response } from 'express';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { sendSuccess } from '../../lib/apiResponse.js';
import { escapeRegex, queryString } from '../../lib/listQuery.js';
import { present } from '../../lib/present.js';
import { Event } from '../events/model.js';
import { Program } from '../programs/model.js';
import { Resource } from '../resources/model.js';
import { Story } from '../stories/model.js';

export const search = asyncHandler(async (req: Request, res: Response) => {
  const q = queryString(req.query.q);
  if (q.length < 2) {
    sendSuccess(res, { programs: [], resources: [], stories: [], events: [] });
    return;
  }
  const rx = new RegExp(escapeRegex(q), 'i');
  const published = { status: 'published' as const };
  const [programs, resources, stories, events] = await Promise.all([
    Program.find({ ...published, $or: [{ title: rx }, { summary: rx }, { body: rx }] })
      .limit(8)
      .select('title slug summary format')
      .lean(),
    Resource.find({ ...published, $or: [{ title: rx }, { summary: rx }, { body: rx }] })
      .limit(8)
      .select('title slug summary type')
      .lean(),
    Story.find({ ...published, $or: [{ title: rx }, { excerpt: rx }, { body: rx }] })
      .limit(8)
      .select('title slug excerpt')
      .lean(),
    Event.find({ ...published, $or: [{ title: rx }, { summary: rx }, { body: rx }] })
      .limit(8)
      .select('title slug summary startAt format')
      .lean(),
  ]);
  sendSuccess(res, {
    programs: programs.map((item) => present(item)),
    resources: resources.map((item) => present(item)),
    stories: stories.map((item) => present(item)),
    events: events.map((item) => present(item)),
  });
});
