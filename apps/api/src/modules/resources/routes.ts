import { Router } from 'express';
import { z } from 'zod';
import { objectIdSchema, resourceUpsertSchema, slugSchema } from '@ohf/shared';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { archive, create, download, file, getAdmin, getPublic, listAdmin, listPublic, update } from './controller.js';

const idParam = z.object({ id: objectIdSchema });
const slugParam = z.object({ slug: slugSchema });

const router = Router();
router.get('/', listPublic);
router.get('/:slug/file', validate(slugParam, 'params'), file);
router.post('/:slug/download', validate(slugParam, 'params'), download);
router.get('/:slug', validate(slugParam, 'params'), getPublic);
export default router;

export const resourcesAdminRouter = Router();
resourcesAdminRouter.use(authenticate, authorize('admin', 'editor'));
resourcesAdminRouter.get('/', listAdmin);
resourcesAdminRouter.post('/', validate(resourceUpsertSchema), create);
resourcesAdminRouter.get('/:id', validate(idParam, 'params'), getAdmin);
resourcesAdminRouter.patch('/:id', validate(idParam, 'params'), validate(resourceUpsertSchema.partial()), update);
resourcesAdminRouter.delete('/:id', validate(idParam, 'params'), archive);
