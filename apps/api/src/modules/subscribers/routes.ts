import { Router } from 'express';
import { subscriberCreateSchema } from '@ohf/shared';
import { actionLimiter } from '../../middleware/rateLimit.js';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { confirm, create, list, unsubscribeHandler } from './controller.js';

const router = Router();
router.post('/', actionLimiter, validate(subscriberCreateSchema), create);
router.post('/confirm', confirm);
router.post('/unsubscribe', unsubscribeHandler);
export default router;

export const subscribersAdminRouter = Router();
subscribersAdminRouter.use(authenticate, authorize('admin'));
subscribersAdminRouter.get('/', list);
