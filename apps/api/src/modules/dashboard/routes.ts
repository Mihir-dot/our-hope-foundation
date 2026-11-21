import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { counts } from './controller.js';

const router = Router();
router.use(authenticate, authorize('admin', 'editor', 'finance'));
router.get('/', counts);

export default router;
