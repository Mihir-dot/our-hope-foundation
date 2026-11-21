import { Router } from 'express';
import { z } from 'zod';
import { objectIdSchema } from '@ohf/shared';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { complete, list, mediaUpload, presign, remove, streamLocal, upload } from './controller.js';

const idParam = z.object({ id: objectIdSchema });
const router = Router();

router.get('/local/:id', validate(idParam, 'params'), streamLocal);

export const mediaPublicRouter = router;

const admin = Router();
admin.use(authenticate, authorize('admin', 'editor'));
admin.get('/', list);
admin.post('/presign', presign);
admin.post('/upload', mediaUpload.single('file'), upload);
admin.post('/:id/complete', validate(idParam, 'params'), complete);
admin.delete('/:id', validate(idParam, 'params'), remove);

export default admin;
