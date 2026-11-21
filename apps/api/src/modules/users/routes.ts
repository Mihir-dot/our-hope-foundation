import { Router } from 'express';
import { createUserSchema, objectIdSchema, updateUserSchema } from '@ohf/shared';
import { z } from 'zod';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { create, getOne, list, remove, update } from './controller.js';

const idParam = z.object({ id: objectIdSchema });
const router = Router();

router.use(authenticate, authorize());
router.get('/', list);
router.post('/', validate(createUserSchema), create);
router.get('/:id', validate(idParam, 'params'), getOne);
router.patch('/:id', validate(idParam, 'params'), validate(updateUserSchema), update);
router.delete('/:id', validate(idParam, 'params'), remove);

export default router;
