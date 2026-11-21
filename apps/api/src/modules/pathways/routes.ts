import { Router } from 'express';
import { z } from 'zod';
import { objectIdSchema, pathwayUpsertSchema, slugSchema } from '@ohf/shared';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { archive, create, getAdmin, getPublic, listAdmin, listPublic, update } from './controller.js';

const idParam = z.object({ id: objectIdSchema });
const slugParam = z.object({ slug: slugSchema });

const router = Router();
router.get('/', listPublic);
router.get('/:slug', validate(slugParam, 'params'), getPublic);
export default router;

export const pathwaysAdminRouter = Router();
pathwaysAdminRouter.use(authenticate, authorize('admin', 'editor'));
pathwaysAdminRouter.get('/', listAdmin);
pathwaysAdminRouter.post('/', validate(pathwayUpsertSchema), create);
pathwaysAdminRouter.get('/:id', validate(idParam, 'params'), getAdmin);
pathwaysAdminRouter.patch('/:id', validate(idParam, 'params'), validate(pathwayUpsertSchema.partial()), update);
pathwaysAdminRouter.delete('/:id', validate(idParam, 'params'), archive);
