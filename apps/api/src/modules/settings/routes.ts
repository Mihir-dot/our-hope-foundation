import { Router } from 'express';
import { settingsUpdateSchema } from '@ohf/shared';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { getAdmin, getPublic, update } from './controller.js';

const router = Router();
router.get('/public', getPublic);

export default router;

export const settingsAdminRouter = Router();
settingsAdminRouter.use(authenticate, authorize());
settingsAdminRouter.get('/', getAdmin);
settingsAdminRouter.put('/', validate(settingsUpdateSchema), update);
