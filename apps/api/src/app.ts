import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { pinoHttp } from 'pino-http';
import { env, isProd } from './config/env.js';
import { logger } from './lib/logger.js';
import { requestId } from './middleware/requestId.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { authenticate, authorize } from './middleware/authenticate.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { mediaRoot } from './modules/media/service.js';
import { exportCsv as exportDonationsCsv, stripeWebhook } from './modules/donations/controller.js';
import { exportCsv as exportSubscribersCsv } from './modules/subscribers/controller.js';
import authRoutes from './modules/auth/routes.js';
import usersRoutes from './modules/users/routes.js';
import settingsRoutes, { settingsAdminRouter } from './modules/settings/routes.js';
import mediaAdminRoutes, { mediaPublicRouter } from './modules/media/routes.js';
import menusRoutes, { menusAdminRouter } from './modules/menus/routes.js';
import pagesRoutes, { pagesAdminRouter } from './modules/pages/routes.js';
import programsRoutes, { programsAdminRouter } from './modules/programs/routes.js';
import pathwaysRoutes, { pathwaysAdminRouter } from './modules/pathways/routes.js';
import speakersRoutes, { speakersAdminRouter } from './modules/speakers/routes.js';
import eventsRoutes, { eventsAdminRouter, registrationsAdminRouter } from './modules/events/routes.js';
import resourcesRoutes, { resourcesAdminRouter } from './modules/resources/routes.js';
import storiesRoutes, { storiesAdminRouter } from './modules/stories/routes.js';
import donationsRoutes, { donationsAdminRouter } from './modules/donations/routes.js';
import enquiriesRoutes, { enquiriesAdminRouter } from './modules/enquiries/routes.js';
import subscribersRoutes, { subscribersAdminRouter } from './modules/subscribers/routes.js';
import dashboardRoutes from './modules/dashboard/routes.js';
import searchRoutes from './modules/search/routes.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(requestId);
  app.use(pinoHttp({ logger }));
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.json({ success: true, data: { ok: true } });
  });

  app.post('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

  app.use(express.json({ limit: '1mb' }));
  app.use(mongoSanitize());
  app.use(
    '/uploads',
    express.static(path.join(mediaRoot(), 'public'), {
      index: false,
      dotfiles: 'deny',
      maxAge: isProd ? '7d' : 0,
    }),
  );

  const api = express.Router();
  api.use(generalLimiter);
  api.get('/health', (_req, res) => {
    res.json({ success: true, data: { ok: true } });
  });

  api.use('/auth', authRoutes);
  api.use('/settings', settingsRoutes);
  api.use('/menus', menusRoutes);
  api.use('/pages', pagesRoutes);
  api.use('/programs', programsRoutes);
  api.use('/pathways', pathwaysRoutes);
  api.use('/speakers', speakersRoutes);
  api.use('/events', eventsRoutes);
  api.use('/resources', resourcesRoutes);
  api.use('/stories', storiesRoutes);
  api.use('/donations', donationsRoutes);
  api.use('/enquiries', enquiriesRoutes);
  api.use('/subscribers', subscribersRoutes);
  api.use('/search', searchRoutes);
  api.use('/media', mediaPublicRouter);

  api.get('/admin/donations.csv', authenticate, authorize('admin', 'finance'), exportDonationsCsv);
  api.get('/admin/subscribers.csv', authenticate, authorize('admin'), exportSubscribersCsv);
  api.use('/admin/dashboard', dashboardRoutes);
  api.use('/admin/users', usersRoutes);
  api.use('/admin/settings', settingsAdminRouter);
  api.use('/admin/media', mediaAdminRoutes);
  api.use('/admin/menus', menusAdminRouter);
  api.use('/admin/pages', pagesAdminRouter);
  api.use('/admin/programs', programsAdminRouter);
  api.use('/admin/pathways', pathwaysAdminRouter);
  api.use('/admin/speakers', speakersAdminRouter);
  api.use('/admin/events', eventsAdminRouter);
  api.use('/admin/registrations', registrationsAdminRouter);
  api.use('/admin/resources', resourcesAdminRouter);
  api.use('/admin/stories', storiesAdminRouter);
  api.use('/admin/donations', donationsAdminRouter);
  api.use('/admin/enquiries', enquiriesAdminRouter);
  api.use('/admin/subscribers', subscribersAdminRouter);

  app.use('/api/v1', api);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
