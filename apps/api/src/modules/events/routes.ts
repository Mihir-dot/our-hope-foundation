import { Router } from 'express';
import { z } from 'zod';
import { eventRegisterSchema, eventUpsertSchema, objectIdSchema, registrationStatuses, slugSchema } from '@ohf/shared';
import { actionLimiter } from '../../middleware/rateLimit.js';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  archive,
  create,
  exportRegistrations,
  getAdmin,
  getPublic,
  listAdmin,
  listPublic,
  patchRegistration,
  register,
  registrations,
  update,
} from './controller.js';

const idParam = z.object({ id: objectIdSchema });
const slugParam = z.object({ slug: slugSchema });
const registrationPatch = z.object({ status: z.enum(registrationStatuses) });

const router = Router();
router.get('/', listPublic);
router.post('/:slug/register', actionLimiter, validate(slugParam, 'params'), validate(eventRegisterSchema), register);
router.get('/:slug', validate(slugParam, 'params'), getPublic);
export default router;

export const eventsAdminRouter = Router();
eventsAdminRouter.use(authenticate, authorize('admin', 'editor'));
eventsAdminRouter.get('/', listAdmin);
eventsAdminRouter.post('/', validate(eventUpsertSchema), create);
eventsAdminRouter.get('/:id/registrations.csv', validate(idParam, 'params'), exportRegistrations);
eventsAdminRouter.get('/:id/registrations', validate(idParam, 'params'), registrations);
eventsAdminRouter.get('/:id', validate(idParam, 'params'), getAdmin);
eventsAdminRouter.patch('/:id', validate(idParam, 'params'), validate(eventUpsertSchema.partial()), update);
eventsAdminRouter.delete('/:id', validate(idParam, 'params'), archive);

export const registrationsAdminRouter = Router();
registrationsAdminRouter.use(authenticate, authorize('admin', 'editor'));
registrationsAdminRouter.patch('/:id', validate(idParam, 'params'), validate(registrationPatch), patchRegistration);
