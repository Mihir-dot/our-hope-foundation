import { Router } from 'express';
import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from '@ohf/shared';
import { actionLimiter, loginLimiter } from '../../middleware/rateLimit.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { forgotHandler, loginHandler, logoutHandler, meHandler, refreshHandler, resetHandler } from './controller.js';

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', logoutHandler);
router.get('/me', authenticate, meHandler);
router.post('/forgot-password', actionLimiter, validate(forgotPasswordSchema), forgotHandler);
router.post('/reset-password', actionLimiter, validate(resetPasswordSchema), resetHandler);

export default router;
