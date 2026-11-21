import { Router } from 'express';
import { z } from 'zod';
import { donationCheckoutSchema, objectIdSchema } from '@ohf/shared';
import { actionLimiter } from '../../middleware/rateLimit.js';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { checkout, getOne, list, session } from './controller.js';

const idParam = z.object({ id: objectIdSchema });
const sessionParam = z.object({ sessionId: z.string().min(4).max(200) });

const router = Router();
router.post('/checkout', actionLimiter, validate(donationCheckoutSchema), checkout);
router.get('/session/:sessionId', validate(sessionParam, 'params'), session);
export default router;

export const donationsAdminRouter = Router();
donationsAdminRouter.use(authenticate, authorize('admin', 'finance'));
donationsAdminRouter.get('/', list);
donationsAdminRouter.get('/:id', validate(idParam, 'params'), getOne);
