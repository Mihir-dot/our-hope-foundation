import { Router } from 'express';
import { z } from 'zod';
import { objectIdSchema, slugSchema, storyUpsertSchema } from '@ohf/shared';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { archive, create, getAdmin, getPublic, listAdmin, listPublic, update } from './controller.js';

const idParam = z.object({ id: objectIdSchema });
const slugParam = z.object({ slug: slugSchema });

const router = Router();
router.get('/', listPublic);
router.get('/:slug', validate(slugParam, 'params'), getPublic);
export default router;

export const storiesAdminRouter = Router();
storiesAdminRouter.use(authenticate, authorize('admin', 'editor'));
storiesAdminRouter.get('/', listAdmin);
storiesAdminRouter.post('/', validate(storyUpsertSchema), create);
storiesAdminRouter.get('/:id', validate(idParam, 'params'), getAdmin);
storiesAdminRouter.patch('/:id', validate(idParam, 'params'), validate(storyUpsertSchema.partial()), update);
storiesAdminRouter.delete('/:id', validate(idParam, 'params'), archive);
