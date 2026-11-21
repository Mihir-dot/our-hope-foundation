import { Donation } from '../donations/model.js';
import { Enquiry } from '../enquiries/model.js';
import { Event } from '../events/model.js';
import { Page } from '../pages/model.js';
import { Program } from '../programs/model.js';
import { Registration } from '../registrations/model.js';
import { Resource } from '../resources/model.js';
import { Story } from '../stories/model.js';
import { Subscriber } from '../subscribers/model.js';
import { present } from '../../lib/present.js';

export async function dashboardCounts() {
  const start = new Date();
  start.setUTCMonth(start.getUTCMonth() - 11, 1);
  start.setUTCHours(0, 0, 0, 0);

  const [
    pages,
    programs,
    resources,
    stories,
    events,
    enquiriesNew,
    subscribers,
    registrations,
    donationTotals,
    series,
    recentEnquiries,
  ] = await Promise.all([
    Page.countDocuments({ status: 'published' }),
    Program.countDocuments({ status: 'published' }),
    Resource.countDocuments({ status: 'published' }),
    Story.countDocuments({ status: 'published' }),
    Event.countDocuments({ status: 'published' }),
    Enquiry.countDocuments({ status: 'new' }),
    Subscriber.countDocuments({ status: 'confirmed' }),
    Registration.countDocuments({ status: 'registered' }),
    Donation.aggregate<{ count: number; amountCents: number }>([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, count: { $sum: 1 }, amountCents: { $sum: '$amountCents' } } },
    ]),
    Donation.aggregate<{ _id: { y: number; m: number }; amountCents: number; count: number }>([
      { $match: { status: 'succeeded', createdAt: { $gte: start } } },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          amountCents: { $sum: '$amountCents' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),
    Enquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const money = donationTotals[0] ?? { count: 0, amountCents: 0 };
  return {
    pages,
    programs,
    resources,
    stories,
    events,
    enquiriesNew,
    subscribers,
    registrations,
    donations: { count: money.count, amountCents: money.amountCents },
    donationSeries: series.map((row) => ({
      year: row._id.y,
      month: row._id.m,
      amountCents: row.amountCents,
      count: row.count,
    })),
    recentEnquiries: recentEnquiries.map((row) => present(row)),
  };
}
