import { Router } from 'express';
import { z } from 'zod';
import { objectIdSchema, programUpsertSchema, slugSchema } from '@ohf/shared';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { archive, create, getAdmin, getPublic, listAdmin, listPublic, update } from './controller.js';

const idParam = z.object({ id: objectIdSchema });
const slugParam = z.object({ slug: slugSchema });

const router = Router();
router.get('/', listPublic);
router.get('/:slug', validate(slugParam, 'params'), getPublic);
export default router;

export const programsAdminRouter = Router();
programsAdminRouter.use(authenticate, authorize('admin', 'editor'));
programsAdminRouter.get('/', listAdmin);
programsAdminRouter.post('/', validate(programUpsertSchema), create);
programsAdminRouter.get('/:id', validate(idParam, 'params'), getAdmin);
programsAdminRouter.patch('/:id', validate(idParam, 'params'), validate(programUpsertSchema.partial()), update);
programsAdminRouter.delete('/:id', validate(idParam, 'params'), archive);
