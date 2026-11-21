import { Router } from 'express';
import { z } from 'zod';
import { menuUpdateSchema } from '@ohf/shared';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { getPublic, list, update } from './controller.js';

const locationParam = z.object({ location: z.enum(['header', 'footer', 'legal']) });
const router = Router();
router.get('/:location', validate(locationParam, 'params'), getPublic);
export default router;

export const menusAdminRouter = Router();
menusAdminRouter.use(authenticate, authorize('admin', 'editor'));
menusAdminRouter.get('/', list);
menusAdminRouter.put('/:location', validate(locationParam, 'params'), validate(menuUpdateSchema), update);
