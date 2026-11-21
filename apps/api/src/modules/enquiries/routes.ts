import { Router } from 'express';
import { z } from 'zod';
import { enquiryCreateSchema, enquiryStatuses, objectIdSchema } from '@ohf/shared';
import { actionLimiter } from '../../middleware/rateLimit.js';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { create, getOne, list, update } from './controller.js';

const idParam = z.object({ id: objectIdSchema });
const patchSchema = z.object({
  status: z.enum(enquiryStatuses).optional(),
  assigneeId: objectIdSchema.nullable().optional(),
});

const router = Router();
router.post('/', actionLimiter, validate(enquiryCreateSchema), create);
export default router;

export const enquiriesAdminRouter = Router();
enquiriesAdminRouter.use(authenticate, authorize('admin'));
enquiriesAdminRouter.get('/', list);
enquiriesAdminRouter.get('/:id', validate(idParam, 'params'), getOne);
enquiriesAdminRouter.patch('/:id', validate(idParam, 'params'), validate(patchSchema), update);
