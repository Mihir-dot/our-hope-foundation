import { Router } from 'express';
import { z } from 'zod';
import { objectIdSchema, pageUpsertSchema, slugSchema } from '@ohf/shared';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { create, getAdmin, getPublic, listAdmin, listPublic, publish, remove, update } from './controller.js';

const idParam = z.object({ id: objectIdSchema });
const slugParam = z.object({ slug: slugSchema });

const router = Router();
router.get('/', listPublic);
router.get('/:slug', validate(slugParam, 'params'), getPublic);
export default router;

export const pagesAdminRouter = Router();
pagesAdminRouter.use(authenticate, authorize('admin', 'editor'));
pagesAdminRouter.get('/', listAdmin);
pagesAdminRouter.post('/', validate(pageUpsertSchema), create);
pagesAdminRouter.get('/:id', validate(idParam, 'params'), getAdmin);
pagesAdminRouter.patch('/:id', validate(idParam, 'params'), validate(pageUpsertSchema.partial()), update);
pagesAdminRouter.post('/:id/publish', validate(idParam, 'params'), publish);
pagesAdminRouter.delete('/:id', validate(idParam, 'params'), remove);
