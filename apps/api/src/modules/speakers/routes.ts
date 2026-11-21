import { Router } from 'express';
import { z } from 'zod';
import { objectIdSchema, speakerUpsertSchema } from '@ohf/shared';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { create, getAdmin, listAdmin, listPublic, remove, update } from './controller.js';

const idParam = z.object({ id: objectIdSchema });
const router = Router();
router.get('/', listPublic);
export default router;

export const speakersAdminRouter = Router();
speakersAdminRouter.use(authenticate, authorize('admin', 'editor'));
speakersAdminRouter.get('/', listAdmin);
speakersAdminRouter.post('/', validate(speakerUpsertSchema), create);
speakersAdminRouter.get('/:id', validate(idParam, 'params'), getAdmin);
speakersAdminRouter.patch('/:id', validate(idParam, 'params'), validate(speakerUpsertSchema.partial()), update);
speakersAdminRouter.delete('/:id', validate(idParam, 'params'), remove);
